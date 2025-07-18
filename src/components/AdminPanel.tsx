import { useState, useEffect, useCallback, type FC } from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  Settings,
  Users,
  BookOpen,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import DataExporter from './DataExporter';
import esperantoData, { Chapter, Section } from '../data/esperantoData';
import { isAdmin } from '../utils/adminUtils.js';

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

type EditingItem =
  | { type: 'chapter'; data: Chapter | null }
  | { type: 'section'; data: Section | null; chapterId: number };

type AdminTab = 'content' | 'users' | 'analytics' | 'settings';

const AdminPanel: FC<AdminPanelProps> = ({ onClose, currentUser, currentEmail }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');

  // Content Management State
  const [chapters, setChapters] = useState<Chapter[]>(esperantoData);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // User Management State
  const [users, setUsers] = useState<UserProgress[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);

  // Analytics State
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalChapters: 14,
    totalQuestions: 0,
    averageProgress: 0,
    completionRate: 0
  });

  const checkAdminAccess = useCallback(() => {
    if (isAdmin(currentUser, currentEmail)) {
      setIsAuthorized(true);
      console.log(`✅ Admin access granted for user: ${currentUser || currentEmail}`);
    } else {
      setAuthError('У вас нет прав администратора для доступа к этой панели.');
      console.log(`❌ Admin access denied for user: ${currentUser || currentEmail}`);
    }
  }, [currentUser, currentEmail]);

  const loadSystemData = useCallback(async () => {
    try {
      // Load mock data - in real app this would come from backend
      await loadUsers();
      await loadAnalytics();
      await loadAdminUsers();
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      // noop
    }
  }, [chapters, users]);

  useEffect(() => {
    // Check if current user has admin privileges
    checkAdminAccess();
    loadSystemData();
  }, [checkAdminAccess, loadSystemData]);

  const loadUsers = async () => {
    // Mock user data - in real app this would come from backend
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
      },
      {
        userId: '2',
        username: 'user2',
        totalProgress: 45,
        chaptersCompleted: 2,
        testsCompleted: 3,
        timeSpent: 80,
        lastActive: new Date(Date.now() - 86400000),
        currentChapter: 3,
        currentSection: 2
      },
      {
        userId: '3',
        username: 'user3',
        totalProgress: 90,
        chaptersCompleted: 5,
        testsCompleted: 8,
        timeSpent: 200,
        lastActive: new Date(Date.now() - 3600000),
        currentChapter: 6,
        currentSection: 1
      }
    ];
    setUsers(mockUsers);
  };

  const loadAnalytics = async () => {
    // Calculate system statistics
    const totalQuestions = chapters.reduce((total, chapter) => {
      return total + chapter.sections.reduce((sectionTotal, section) => {
        return sectionTotal + (section.questions?.length || 0);
      }, 0);
    }, 0);

    const stats: SystemStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => new Date().getTime() - u.lastActive.getTime() < 86400000).length,
      totalChapters: chapters.length,
      totalQuestions,
      averageProgress: users.reduce((sum, u) => sum + u.totalProgress, 0) / (users.length || 1),
      completionRate: users.filter(u => u.totalProgress >= 80).length / (users.length || 1) * 100
    };

    setSystemStats(stats);
  };

  const loadAdminUsers = async () => {
    const mockAdminUsers: AdminUser[] = [
      {
        id: '1',
        username: 'admin5050',
        accessLevel: 'admin',
        permissions: ['content_edit', 'user_management', 'analytics', 'system_settings'],
        lastActive: new Date(),
        createdAt: new Date(Date.now() - 30 * 86400000)
      },
      {
        id: '2',
        username: 'moderator1',
        accessLevel: 'moderator',
        permissions: ['content_edit', 'user_view'],
        lastActive: new Date(Date.now() - 3600000),
        createdAt: new Date(Date.now() - 15 * 86400000)
      }
    ];
    setAdminUsers(mockAdminUsers);
  };

  // Content Management Functions
  const handleAddChapter = () => {
    setEditingItem({ type: 'chapter', data: null });
    setShowAddModal(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingItem({ type: 'chapter', data: chapter });
    setShowAddModal(true);
  };

  const handleDeleteChapter = (chapterId: number) => {
    if (confirm('Вы уверены, что хотите удалить эту главу? Это действие нельзя отменить.')) {
      setChapters(prev => prev.filter(ch => ch.id !== chapterId));
      console.log(
        `Chapter ${chapterId} deleted by admin ${currentUser || currentEmail}`
      );
    }
  };

  const handleSaveChapter = (chapterData: Partial<Chapter>) => {
    if (editingItem?.data) {
      // Edit existing chapter
      setChapters(prev => prev.map(ch => 
        ch.id === editingItem.data.id ? { ...ch, ...chapterData } : ch
      ));
    } else {
      // Add new chapter
      const newChapter: Chapter = {
        id: Math.max(...chapters.map(ch => ch.id)) + 1,
        ...chapterData,
        sections: []
      };
      setChapters(prev => [...prev, newChapter]);
    }
    setShowAddModal(false);
    setEditingItem(null);
  };

  const handleAddSection = (chapterId: number) => {
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      setSelectedChapter(chapter);
      setEditingItem({ type: 'section', data: null, chapterId });
      setShowAddModal(true);
    }
  };

  const handleEditSection = (section: Section, chapterId: number) => {
    setEditingItem({ type: 'section', data: section, chapterId });
    setShowAddModal(true);
  };

  const handleSaveSection = (sectionData: Partial<Section>) => {
    const chapterId = editingItem?.chapterId;
    if (!chapterId) return;

    setChapters(prev => prev.map(chapter => {
      if (chapter.id === chapterId) {
        if (editingItem?.data) {
          // Edit existing section
          return {
            ...chapter,
            sections: chapter.sections.map(section =>
              section.id === editingItem.data.id ? { ...section, ...sectionData } : section
            )
          };
        } else {
          // Add new section
          const newSection: Section = {
            id: Math.max(...chapter.sections.map(s => s.id), 0) + 1,
            ...sectionData,
            theoryBlocks: [],
            questions: []
          };
          return {
            ...chapter,
            sections: [...chapter.sections, newSection]
          };
        }
      }
      return chapter;
    }));

    setShowAddModal(false);
    setEditingItem(null);
  };

  // User Management Functions
  const handleViewUserDetails = (user: UserProgress) => {
    setSelectedUser(user);
  };

  const handleResetUserProgress = (userId: string) => {
    if (confirm('Вы уверены, что хотите сбросить прогресс этого пользователя?')) {
      setUsers(prev => prev.map(user => 
        user.userId === userId 
          ? { ...user, totalProgress: 0, chaptersCompleted: 0, testsCompleted: 0, currentChapter: 1, currentSection: 1 }
          : user
      ));
      console.log(
        `User progress reset for ${userId} by admin ${currentUser || currentEmail}`
      );
    }
  };

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h2>
            <p className="text-gray-600 mb-6">{authError}</p>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {(
            [
              { id: 'content', label: 'Управление контентом', icon: BookOpen },
              { id: 'users', label: 'Пользователи', icon: Users },
              { id: 'analytics', label: 'Аналитика', icon: BarChart3 },
              { id: 'settings', label: 'Настройки', icon: Settings }
            ] as { id: AdminTab; label: string; icon: LucideIcon }[]
          ).map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Content Management Tab */}
          {activeTab === 'content' && (
            <div className="h-full flex">
              {/* Sidebar */}
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Главы курса</h3>
                    <button
                      onClick={handleAddChapter}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Поиск глав..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedChapter?.id === chapter.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedChapter(chapter)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{chapter.title}</h4>
                            <p className="text-sm text-gray-600">{chapter.sections.length} разделов</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditChapter(chapter);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChapter(chapter.id);
                              }}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                {selectedChapter ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedChapter.title}</h2>
                        <p className="text-gray-600">{selectedChapter.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddSection(selectedChapter.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить раздел</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedChapter.sections.map((section) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                              <p className="text-gray-600">{section.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditSection(section, selectedChapter.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Удалить этот раздел?')) {
                                    setChapters(prev => prev.map(ch => 
                                      ch.id === selectedChapter.id 
                                        ? { ...ch, sections: ch.sections.filter(s => s.id !== section.id) }
                                        : ch
                                    ));
                                  }
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-gray-900">Теория</div>
                              <div className="text-gray-600">{section.theoryBlocks?.length || 0} блоков</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-gray-900">Вопросы</div>
                              <div className="text-gray-600">{section.questions?.length || 0} вопросов</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-gray-900">Время</div>
                              <div className="text-gray-600">{section.duration}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Выберите главу для редактирования</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Поиск пользователей..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Экспорт</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Пользователь
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Прогресс
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Главы
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Тесты
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Последняя активность
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 font-semibold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">ID: {user.userId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-emerald-600 h-2 rounded-full"
                                  style={{ width: `${user.totalProgress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{user.totalProgress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.chaptersCompleted}/14
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.testsCompleted}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActive.toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleViewUserDetails(user)}
                                className="text-emerald-600 hover:text-emerald-900"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleResetUserProgress(user.userId)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Аналитика и отчеты</h2>
              
              {/* Stats Cards */}
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

              {/* Data Export Component */}
              <DataExporter />
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6 h-full overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Настройки системы</h2>
              
              <div className="space-y-6">
                {/* Admin Users */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Администраторы</h3>
                  <div className="space-y-3">
                    {adminUsers.map((admin) => (
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
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            admin.accessLevel === 'admin' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {admin.permissions.length} разрешений
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Добавить администратора</span>
                  </button>
                </div>

                {/* System Settings */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Системные настройки</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Автоматическое резервное копирование</div>
                        <div className="text-sm text-gray-600">Ежедневное сохранение данных</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Уведомления администраторов</div>
                        <div className="text-sm text-gray-600">Email уведомления о важных событиях</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">Опасная зона</h3>
                  <div className="space-y-3">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Сбросить все данные пользователей
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                      Экспорт и очистка логов
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem?.data ? 'Редактировать' : 'Добавить'} {editingItem?.type === 'chapter' ? 'главу' : 'раздел'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const data = Object.fromEntries(formData.entries());
              
              if (editingItem?.type === 'chapter') {
                handleSaveChapter(data);
              } else {
                handleSaveSection(data);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingItem?.data?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    name="description"
                    defaultValue={editingItem?.data?.description || ''}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {editingItem?.type === 'chapter' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Сложность
                      </label>
                      <select
                        name="difficulty"
                        defaultValue={editingItem?.data?.difficulty || 'Легкий'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Легкий">Легкий</option>
                        <option value="Средний">Средний</option>
                        <option value="Сложный">Сложный</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Примерное время изучения
                      </label>
                      <input
                        type="text"
                        name="estimatedTime"
                        defaultValue={editingItem?.data?.estimatedTime || ''}
                        placeholder="например: 2-3 часа"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </>
                )}

                {editingItem?.type === 'section' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Продолжительность
                    </label>
                    <input
                      type="text"
                      name="duration"
                      defaultValue={editingItem?.data?.duration || ''}
                      placeholder="например: 30 мин"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Детали пользователя</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-xl">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedUser.username}</h4>
                  <p className="text-gray-600">ID: {selectedUser.userId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Общий прогресс</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedUser.totalProgress}%</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Завершено глав</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedUser.chaptersCompleted}/14</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Пройдено тестов</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedUser.testsCompleted}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Время изучения</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedUser.timeSpent} мин</div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="text-sm text-emerald-700 mb-2">Текущая позиция</div>
                <div className="text-emerald-900 font-medium">
                  Глава {selectedUser.currentChapter}, Раздел {selectedUser.currentSection}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
