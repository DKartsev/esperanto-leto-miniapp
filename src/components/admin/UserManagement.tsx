import { useState, useEffect, type FC } from 'react';
import { Search, Download, Eye, AlertTriangle, X } from 'lucide-react';

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

interface UserManagementProps {
  users: UserProgress[];
  onChange: (users: UserProgress[]) => void;
  currentUser: string;
  currentEmail: string;
}

const UserManagement: FC<UserManagementProps> = ({ users, onChange, currentUser, currentEmail }) => {
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
    onChange(mockUsers);
  };

  const handleViewUserDetails = (user: UserProgress) => setSelectedUser(user);

  const handleResetUserProgress = (userId: string) => {
    if (confirm('Вы уверены, что хотите сбросить прогресс этого пользователя?')) {
      const updated = users.map(user =>
        user.userId === userId
          ? { ...user, totalProgress: 0, chaptersCompleted: 0, testsCompleted: 0, currentChapter: 1, currentSection: 1 }
          : user
      );
      onChange(updated);
      console.log(`User progress reset for ${userId} by admin ${currentUser || currentEmail}`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (users.length === 0) {
      void loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Прогресс</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Главы</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тесты</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Последняя активность</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
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
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${user.totalProgress}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-900">{user.totalProgress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.chaptersCompleted}/14</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.testsCompleted}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastActive.toLocaleDateString('ru-RU')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleViewUserDetails(user)} className="text-emerald-600 hover:text-emerald-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleResetUserProgress(user.userId)} className="text-red-600 hover:text-red-900">
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Детали пользователя</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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

export default UserManagement;
