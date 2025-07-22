import { useState, useEffect, useCallback, type FC } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Settings, Users, BookOpen, BarChart3, AlertTriangle, Shield, TrendingUp, CheckCircle, X } from 'lucide-react';
import { isAdmin } from '../../utils/adminUtils.js';
import { Chapter, fetchEsperantoData } from '../../data/esperantoData';
import ChapterEditor from './ChapterEditor';
import UserManagement from './UserManagement';
import LogsView from './LogsView';
import DataExporter from './DataExporter';

interface AdminUser {
  id: string;
  username: string;
  accessLevel: 'admin' | 'moderator' | 'viewer';
  permissions: string[];
  lastActive: Date;
  createdAt: Date;
}

interface UserProgress {
  userId: string;
  username: string;
  totalProgress: number;
  chaptersCompleted: number;
  testsCompleted: number;
  timeSpent: number;
  lastActive: Date;
  currentChapter: number;
  currentSection: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalChapters: number;
  totalQuestions: number;
  averageProgress: number;
  completionRate: number;
}

interface AdminPanelProps {
  onClose: () => void;
  currentUser: string;
  currentEmail: string;
}

type AdminTab = 'content' | 'users' | 'analytics' | 'settings' | 'logs';

const AdminPanel: FC<AdminPanelProps> = ({ onClose, currentUser, currentEmail }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalChapters: 0,
    totalQuestions: 0,
    averageProgress: 0,
    completionRate: 0
  });

  const checkAdminAccess = useCallback(() => {
    if (isAdmin(currentUser, currentEmail)) {
      setIsAuthorized(true);
    } else {
      setAuthError('У вас нет прав администратора для доступа к этой панели.');
    }
  }, [currentUser, currentEmail]);

  const loadUsers = async () => {
    const mockUsers: UserProgress[] = [
      {
        userId: '1',
        username: 'user1',
        totalProgress: 75,
        chaptersCompleted: 3,
        testsCompleted: 5,
        timeSpent: 120,
        lastActive: new Date(),
        currentChapter: 4,
        currentSection: 1
      }
    ];
    setUsers(mockUsers);
  };

  const loadAdminUsers = async () => {
    const mockAdminUsers: AdminUser[] = [
      { id: '1', username: 'admin5050', accessLevel: 'admin', permissions: [], lastActive: new Date(), createdAt: new Date() }
    ];
    setAdminUsers(mockAdminUsers);
  };

  useEffect(() => {
    void fetchEsperantoData()
      .then(setChapters)
      .catch(err => console.error('Failed to load course data', err));
  }, []);

  const loadAnalytics = useCallback(() => {
    const totalQuestions = chapters.reduce((total, chapter) => total + chapter.sections.reduce((s, sec) => s + (sec.questions?.length || 0), 0), 0);
    const stats: SystemStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => new Date().getTime() - u.lastActive.getTime() < 86400000).length,
      totalChapters: chapters.length,
      totalQuestions,
      averageProgress: users.reduce((sum, u) => sum + u.totalProgress, 0) / (users.length || 1),
      completionRate: users.filter(u => u.totalProgress >= 80).length / (users.length || 1) * 100
    };
    setSystemStats(stats);
  }, [chapters, users]);

  useEffect(() => {
    checkAdminAccess();
    void loadUsers();
    void loadAdminUsers();
  }, [checkAdminAccess]);

  useEffect(() => {
    loadAnalytics();
  }, [chapters, users, loadAnalytics]);

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h2>
            <p className="text-gray-600 mb-6">{authError}</p>
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: AdminTab; label: string; icon: LucideIcon }[] = [
    { id: 'content', label: 'Управление контентом', icon: BookOpen },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
    { id: 'logs', label: 'Логи', icon: AlertTriangle },
    { id: 'settings', label: 'Настройки', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Административная панель</h1>
              <p className="text-gray-600">Управление контентом и пользователями</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Администратор: <span className="font-semibold text-emerald-600">{currentUser || currentEmail}</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'content' && (
            <ChapterEditor chapters={chapters} onChange={setChapters} currentUser={currentUser} currentEmail={currentEmail} />
          )}
          {activeTab === 'users' && (
            <UserManagement users={users} onChange={setUsers} currentUser={currentUser} currentEmail={currentEmail} />
          )}
          {activeTab === 'analytics' && (
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Аналитика и отчеты</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Активные пользователи</p>
                      <p className="text-2xl font-bold text-gray-900">{systemStats.activeUsers}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Средний прогресс</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(systemStats.averageProgress)}%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Завершили курс</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.round(systemStats.completionRate)}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <DataExporter />
            </div>
          )}
          {activeTab === 'logs' && <LogsView devMode={import.meta.env.DEV} />}
          {activeTab === 'settings' && (
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки системы</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Администраторы</h3>
                  <div className="space-y-3">
                    {adminUsers.map(admin => (
                      <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{admin.username}</div>
                            <div className="text-sm text-gray-600">{admin.accessLevel}</div>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {admin.permissions.length} разрешений
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
