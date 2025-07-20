import { useState, useEffect, useRef, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  LogOut,
  Settings,
  Trophy,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Pencil,
  X,
  Check
} from 'lucide-react';
import { useAuth } from './SupabaseAuthProvider';
import { supabase } from '../services/supabaseClient.js';
import { isAdmin } from '../utils/adminUtils.js';
import { findOrCreateUserProfile } from '../services/authService.js';
import AdminPanelButton from '../components/AdminPanelButton';
import LoadingVideo from './LoadingVideo';
import AccountHeader from './account/AccountHeader';
import AccountStats from './account/AccountStats';
import AccountProgress from './account/AccountProgress';
import AccountAvatarUpload from './account/AccountAvatarUpload';
import { useAccountData } from '../hooks/useAccountData';

interface MyAccountProps {
  onBackToHome: () => void;
  onStartChapter?: (chapterId: number) => void;
}

interface ChapterStats {
  totalTime: number;
  averageAccuracy: number;
  completedChapters: number;
  totalChapters: number;
  progress: number;
}

const MyAccount: FC<MyAccountProps> = ({ onBackToHome, onStartChapter }) => {
  const {
    user,
    profile,
    stats,
    achievements,
    loading,
    signOut,
    isAuthenticated,
    updateProfile,
    refreshStats
  } = useAuth() as any;
  const navigate = useNavigate();
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [chapterStats, setChapterStats] = useState<ChapterStats | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [chapterProgress, setChapterProgress] = useState<any[]>([]);
  const [recommendedChapter, setRecommendedChapter] = useState<{ chapterId: number; title: string } | null>(null);
  const [completedChapters, setCompletedChapters] = useState(0);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    const fetchStartDate = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('answered_at')
        .eq('user_id', user.id)
        .order('answered_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Ошибка получения даты начала обучения:', error);
        return;
      }

      setStartDate(data?.answered_at ?? null);
    };

    fetchStartDate();
  }, [user?.id]);

  useEffect(() => {
    setNewUsername(profile?.username || '');
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Ошибка выхода:', error);
    }
  };

  const handleUsernameSave = async () => {
    try {
      if (!newUsername || newUsername === profile?.username) {
        setIsEditingUsername(false);
        return;
      }

      await updateProfile({ username: newUsername });
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Ошибка обновления имени пользователя:', error);
    }
  };

  const handleUsernameCancel = () => {
    setNewUsername(profile?.username || '');
    setIsEditingUsername(false);
  };


  useEffect(() => {
    const fetchActualProgress = async () => {
      setProgressLoading(true);
      if (!user?.id) {
        setProgressLoading(false);
        return;
      }

      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('chapter_id, section_id, is_correct, time_spent, answered_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Ошибка загрузки прогресса:', error);
        setProgressLoading(false);
        return;
      }

      if (!progress) {
        setProgressLoading(false);
        return;
      }

      let totalTimeSec = 0;
      let correctAnswers = 0;
      const sectionMap = new Map<string, { correct: number; total: number; chapter: number }>();
      let firstDate: Date | null = null;

      progress.forEach((row: any) => {
        totalTimeSec += row.time_spent || 0;
        if (row.is_correct) correctAnswers += 1;

        const key = `${row.chapter_id}-${row.section_id}`;
        if (!sectionMap.has(key)) {
          sectionMap.set(key, { correct: 0, total: 0, chapter: row.chapter_id });
        }
        const stat = sectionMap.get(key)!;
        stat.total += 1;
        if (row.is_correct) stat.correct += 1;

        if (row.answered_at) {
          const d = new Date(row.answered_at);
          if (!firstDate || d < firstDate) firstDate = d;
        }
      });

      const avgAccuracy = progress.length
        ? Math.round((correctAnswers / progress.length) * 100)
        : 0;

      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('id, chapter_id');

      if (sectionsError) {
        console.error('Ошибка загрузки списка разделов:', sectionsError);
        setProgressLoading(false);
        return;
      }

      const sectionsPerChapter = new Map<number, number>();
      sections?.forEach((s: any) => {
        sectionsPerChapter.set(
          s.chapter_id,
          (sectionsPerChapter.get(s.chapter_id) || 0) + 1
        );
      });

      const chapterAcc: Record<number, number[]> = {};
      sectionMap.forEach((val) => {
        const acc = val.total ? val.correct / val.total : 0;
        if (!chapterAcc[val.chapter]) chapterAcc[val.chapter] = [];
        chapterAcc[val.chapter].push(acc);
      });

      let completed = 0;
      for (const [chapterId, total] of sectionsPerChapter) {
        const arr = chapterAcc[chapterId] || [];
        if (arr.length === total && arr.every((a) => a >= 0.7)) {
          completed += 1;
        }
      }

      setCompletedChapters(completed);
      setTotalStudyMinutes(Math.round(totalTimeSec / 60));
      setAverageAccuracy(avgAccuracy);
      setStartDate(firstDate ? firstDate.toISOString() : null);
      setProgressLoading(false);
    };

    fetchActualProgress();
  }, [user?.id]);

  async function loadChapterStats() {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;

    const { data: chapters, error } = await supabase
      .from('user_chapter_progress')
      .select('average_accuracy, total_time, completed')
      .eq('user_id', user_id);

    if (error) {
      console.error('Ошибка загрузки прогресса глав:', error);
      return;
    }

    let totalTime = 0;
    let averageAccuracy = 0;
    let completedChapters = 0;

    if (chapters && chapters.length > 0) {
      totalTime = chapters.reduce((sum, row) => sum + row.total_time, 0);
      averageAccuracy = Math.round(
        chapters.reduce((sum, row) => sum + row.average_accuracy, 0) /
          chapters.length
      );
      completedChapters = chapters.filter((row) => row.completed).length;
    }

    const { count: totalChapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id', { count: 'exact', head: true });

    if (chaptersError) {
      console.error('Ошибка получения количества глав:', chaptersError);
    }

    const totalCh = totalChapters ?? 0;
    const progress = totalCh
      ? Math.round((completedChapters / totalCh) * 100)
      : 0;

    setChapterStats({
      totalTime: Math.round(totalTime / 60),
      averageAccuracy,
      completedChapters,
      totalChapters: totalCh,
      progress
    });
  }

  const handleTelegramLogin = async () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!tgUser) {
      console.warn('Пользователь Telegram не найден');
      setLoginError('Пользователь Telegram не найден');
      return;
    }

    setLoginLoading(true);
    const username = tgUser.username || `${tgUser.first_name}${tgUser.last_name || ''}`;
    const userId = await findOrCreateUserProfile(tgUser.id.toString(), username);

    if (!userId) {
      setLoginError('Ошибка создания профиля');
    } else {
      localStorage.setItem('user_id', userId);
      await loadChapterStats();
      await refreshStats();
    }
    setLoginLoading(false);
  };

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const isTelegramUser = Boolean(telegramUser);

  useEffect(() => {
    if (!isAuthenticated && telegramUser) {
      handleTelegramLogin();
    }
  }, [isAuthenticated, telegramUser]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAuthenticated) return;
      const user_id = localStorage.getItem('user_id');
      if (!user_id) return;

      const { data: chapters, error } = await supabase
        .from('user_chapter_progress')
        .select('average_accuracy, total_time, completed')
        .eq('user_id', user_id);

      if (error) {
        console.error('Ошибка загрузки прогресса глав:', error);
        return;
      }

      let totalTime = 0;
      let averageAccuracy = 0;
      let completedChapters = 0;

      if (chapters && chapters.length > 0) {
        totalTime = chapters.reduce((sum, row) => sum + row.total_time, 0);
        averageAccuracy = Math.round(
          chapters.reduce((sum, row) => sum + row.average_accuracy, 0) /
            chapters.length
        );
        completedChapters = chapters.filter(row => row.completed).length;
      }

      const { count: totalChapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id', { count: 'exact', head: true });

      if (chaptersError) {
        console.error('Ошибка получения количества глав:', chaptersError);
      }

      const totalCh = totalChapters ?? 0;
      const progress = totalCh
        ? Math.round((completedChapters / totalCh) * 100)
        : 0;

      setChapterStats({
        totalTime: Math.round(totalTime / 60),
        averageAccuracy,
        completedChapters,
        totalChapters: totalCh,
        progress
      });
    };

    fetchStats();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || localStorage.getItem('user_id') || profile?.id;
      if (!userId) return;
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId);
      if (!error && data) setProgressData(data as any[]);
    };

    fetchProgress();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Ошибка получения пользователя:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('accuracy, time_spent')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (error) {
        console.error('Ошибка загрузки прогресса:', error);
        return;
      }

      const completedSections = data ? data.length : 0;
      const averageAccuracy = data && data.length > 0
        ? Math.round(data.reduce((sum: number, row: any) => sum + (row.accuracy || 0), 0) / data.length)
        : 0;
      const totalTimeSpent = data ? data.reduce((sum: number, row: any) => sum + (row.time_spent || 0), 0) : 0;

      setUserStats({ completedSections, averageAccuracy, totalTimeSpent });
    };

    fetchUserStats();
  }, []);

  useEffect(() => {
    const fetchChapterProgress = async () => {
      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, title');

      const { data: sections } = await supabase
        .from('sections')
        .select('id, chapter_id');

      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || localStorage.getItem('user_id') || profile?.id;
      if (!userId || !chapters) return;

      const { data: completed } = await supabase
        .from('user_progress')
        .select('chapter_id, section_id')
        .eq('user_id', userId)
        .eq('completed', true);

      const sectionsByChapter = new Map<number, number>();
      sections?.forEach((s: any) => {
        sectionsByChapter.set(
          s.chapter_id,
          (sectionsByChapter.get(s.chapter_id) || 0) + 1
        );
      });

      const completedMap: Record<number, Set<number>> = {};
      completed?.forEach((c: any) => {
        if (!completedMap[c.chapter_id]) {
          completedMap[c.chapter_id] = new Set();
        }
        completedMap[c.chapter_id].add(c.section_id);
      });

      const result = chapters.map((ch: any) => {
        const total = sectionsByChapter.get(ch.id) || 0;
        const done = completedMap[ch.id]?.size || 0;
        const percent = total ? Math.round((done / total) * 100) : 0;
        return {
          chapterId: ch.id,
          title: ch.title,
          totalSections: total,
          completedSections: done,
          percent
        };
      });

      setChapterProgress(result);
    };

    if (isAuthenticated) {
      fetchChapterProgress();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (chapterProgress && chapterProgress.length > 0) {
      const next = chapterProgress.find((cp: any) => cp.percent < 100);
      if (next) {
        setRecommendedChapter({ chapterId: next.chapterId, title: next.title });
      } else {
        setRecommendedChapter(null);
      }
    }
  }, [chapterProgress]);

  const navigateRef = useRef(false);

  useEffect(() => {
    if (
      !navigateRef.current &&
      telegramUser &&
      localStorage.getItem('user_id') &&
      profile &&
      !loading
    ) {
      console.log('Navigate to /account', {
        telegramUser,
        user_id: localStorage.getItem('user_id'),
        profile
      });
      navigateRef.current = true;
      navigate('/account');
    }
  }, [telegramUser, profile, loading, navigate]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const formatHoursMinutes = (minutes: number): string => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const h = String(hrs).padStart(2, '0');
    const m = String(mins).padStart(2, '0');
    return `${h}:${m}`;
  };

  // Функция для проверки прав администратора
  const hasAdminAccess = () => {
    return isAdmin(profile?.username, user?.email);
  };

  if (loading) {
    return <LoadingVideo />;
  }

  // Initial Login Screen
  if (!isAuthenticated) {
    if (loginLoading) {
      return <LoadingVideo />;
    }

    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-200">
              {/* Header */}
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-emerald-900 mb-2">
                Добро пожаловать!
              </h1>
              <p className="text-emerald-700 mb-8">
                Вы авторизуетесь через Telegram для сохранения прогресса и рекомендаций
              </p>

              {loginError && (
                <p className="text-red-600 mb-4">{loginError}</p>
              )}

              {/* Security Info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium text-sm">Безопасный вход</span>
                </div>
                <p className="text-xs text-emerald-600">
                  Мы используем безопасную систему входа для защиты ваших данных.
                  Ваши данные не передаются третьим лицам.
                </p>
              </div>

              {/* Benefits */}
              <div className="text-left space-y-3">
                <h3 className="font-semibold text-emerald-900 text-center mb-4">
                  Преимущества регистрации:
                </h3>
                <div className="space-y-2">
                  {[
                    'Сохранение прогресса обучения',
                    'Персональные рекомендации',
                    'Статистика и достижения',
                    'Синхронизация между устройствами'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={onBackToHome}
                className="mt-8 w-full text-emerald-600 hover:text-emerald-800 font-medium py-2 transition-colors"
              >
                Продолжить без регистрации
              </button>
            </div>
          </div>
        </div>

      </>
    );
  }

  // Authenticated User Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                {isTelegramUser ? (
                  <h1 className="text-2xl font-bold text-emerald-900">
                    {profile?.username || 'Пользователь'}
                  </h1>
                ) : isEditingUsername ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="border rounded-lg px-2 py-1 text-sm"
                    />
                    <button onClick={handleUsernameSave} className="text-emerald-600">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={handleUsernameCancel} className="text-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-emerald-900">
                      {profile?.username || user?.email?.split('@')[0] || 'Пользователь'}
                    </h1>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-emerald-700">{user?.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-emerald-600 font-medium">
                    {stats?.level || 'Начинающий'}
                  </span>
                  <span className="text-emerald-400">•</span>
                  <span className="text-sm text-emerald-600">
                    С нами с {new Date(user?.created_at || '').toLocaleDateString('ru-RU')}
                  </span>
                  {/* Показываем статус администратора для admin5050 */}
                {hasAdminAccess() && (
                    <>
                      <span className="text-emerald-400">•</span>
                      <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-medium">
                        👑 Администратор
                      </span>
                    </>
                  )}
                </div>
                {chapterStats && (
                  <div className="mt-2 bg-neutral-100 rounded p-2 text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        Время обучения: {formatTime(chapterStats.totalTime)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      <span>Средняя точность: {chapterStats.averageAccuracy}%</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Общий прогресс: {chapterStats.progress}%</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>
                        Пройдено глав: {chapterStats.completedChapters} из {chapterStats.totalChapters}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-emerald-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {stats?.completedChapters || 0}
                </div>
                <div className="text-sm text-emerald-700">Глав завершено</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {formatTime(stats?.totalTimeSpent || 0)}
                </div>
                <div className="text-sm text-emerald-700">Время изучения</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {stats?.accuracy || 0}%
                </div>
                <div className="text-sm text-emerald-700">Точность ответов</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {startDate ? new Date(startDate).toLocaleDateString('ru-RU') : '-'}
                </div>
                <div className="text-sm text-emerald-700">Дата начала</div>
              </div>
            </div>
          </div>
        </div>

        {progressLoading ? (
          <div className="rounded-2xl p-4 bg-white shadow my-4">
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-4 bg-white shadow my-4 space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Завершено глав: {completedChapters}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Обучение: {formatHoursMinutes(totalStudyMinutes)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Точность ответов: {averageAccuracy}%</span>
            </div>
            {startDate && (
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Начало: {new Date(startDate).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>
        )}

        {/* Admin Access Notice for admin5050 */}
        {hasAdminAccess() && (
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-semibold">Административный доступ</h3>
                <p className="text-emerald-100">У вас есть полные права администратора</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="font-semibold">Управление контентом</div>
                <div className="text-emerald-100">Создание и редактирование глав</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="font-semibold">Пользователи</div>
                <div className="text-emerald-100">Мониторинг и управление</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="font-semibold">Аналитика</div>
                <div className="text-emerald-100">Отчеты и статистика</div>
              </div>
            </div>
            <AdminPanelButton />
          </div>
        )}

                    {/* Progress Overview */}
        {chapterStats && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-emerald-900 mb-4">Общий прогресс</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-700">Прогресс курса</span>
                <span className="text-emerald-600 font-semibold">{chapterStats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${chapterStats.progress > 70 ? 'bg-green-500' : 'bg-gray-400'}`}
                  style={{ width: `${chapterStats.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-emerald-700">
              <div>Средняя точность: {chapterStats.averageAccuracy}%</div>
              <div>Общее время обучения: {chapterStats.totalTime} минут</div>
            </div>
          </div>
        )}

        {chapterStats && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-emerald-700">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Всего глав: {chapterStats.totalChapters}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Пройдено глав: {chapterStats.completedChapters}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Средняя точность: {chapterStats.averageAccuracy}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Общее время: {formatTime(chapterStats.totalTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Достижения
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              {achievements.map((a: any, idx: number) => (
                <li key={idx} className="text-yellow-700">{a.achievement_type}</li>
              ))}
            </ul>
          </div>
        )}

        {progressData && progressData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-emerald-900 mb-4">Прогресс по разделам</h2>
            <ul className="space-y-1 text-sm text-emerald-700">
              {progressData.map((p) => (
                <li key={p.section_id} className="flex justify-between">
                  <span>Раздел {p.section_id}</span>
                  <span className="flex items-center space-x-2">
                    <span>{p.accuracy}%</span>
                    <span className={p.completed ? 'text-green-600' : 'text-red-600'}>
                      {p.completed ? 'Завершён' : 'Не завершён'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {chapterProgress && chapterProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
            {recommendedChapter ? (
              <div className="mb-4 flex justify-between items-center">
                <span className="text-emerald-700">
                  Рекомендуем начать с главы: <span className="font-semibold">{recommendedChapter.title}</span>
                </span>
                {onStartChapter && (
                  <button
                    onClick={() => onStartChapter(recommendedChapter.chapterId)}
                    className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-emerald-700"
                  >
                    Начать обучение
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-4 text-emerald-700">Вы прошли все главы 🎉</div>
            )}
            <h2 className="text-xl font-semibold text-emerald-900 mb-4">Прогресс по главам</h2>
            <ul className="space-y-2 text-sm text-emerald-700">
              {chapterProgress.map((cp) => (
                <li key={cp.chapterId} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span>
                      {cp.title} — {cp.completedSections} из {cp.totalSections} разделов ({cp.percent}%)
                    </span>
                    {cp.percent === 100 && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-emerald-600 rounded-full"
                      style={{ width: `${cp.percent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {chapterStats && (
          <div className="bg-emerald-50 text-emerald-700 p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Статистика обучения</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full shadow">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-emerald-900">
                    {formatTime(chapterStats.totalTime)}
                  </div>
                  <div className="text-sm">Время обучения</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full shadow">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-emerald-900">
                    {chapterStats.averageAccuracy}%
                  </div>
                  <div className="text-sm">Средняя точность</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-full shadow">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-emerald-900">
                    {chapterStats.completedChapters}/{chapterStats.totalChapters}
                  </div>
                  <div className="text-sm">Глав завершено</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">
            Последняя активность
          </h2>
          <div className="text-center py-8 text-emerald-600">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Начните изучение, чтобы увидеть свою активность здесь</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Настройки</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-emerald-100">
              <span className="text-emerald-800">Уведомления о прогрессе</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-emerald-100">
              <span className="text-emerald-800">Ежедневные напоминания</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Back to Learning Button */}
        <div className="mt-8 text-center">
          {hasAdminAccess() && (
            <AdminPanelButton />
          )}
          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Продолжить изучение
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
