import React from 'react';
import { Trophy, Star, Clock, ArrowRight, Medal, Target } from 'lucide-react';

interface ChapterCompleteProps {
  chapterId: number;
  onNextChapter: () => void;
  onBackToChapters: () => void;
}

const ChapterComplete: React.FC<ChapterCompleteProps> = ({
  chapterId,
  onNextChapter,
  onBackToChapters
}) => {
  // Симуляция данных о завершении главы
  const completionTime = "2 часа 15 минут";
  const totalScore = 85;
  const badge = "Эксперт";
  const achievements = [
    "Первое прохождение",
    "Высокая точность",
    "Быстрое обучение"
  ];

  const getBadgeIcon = () => {
    if (totalScore >= 90) return Trophy;
    if (totalScore >= 80) return Medal;
    if (totalScore >= 70) return Star;
    return Target;
  };

  const getBadgeColor = () => {
    if (totalScore >= 90) return "from-yellow-400 to-yellow-600";
    if (totalScore >= 80) return "from-green-400 to-green-600";
    if (totalScore >= 70) return "from-blue-400 to-blue-600";
    return "from-gray-400 to-gray-600";
  };

  const BadgeIcon = getBadgeIcon();

  return (
    <div className="min-h-screen app-gradient p-6">
      <div className="max-w-2xl mx-auto">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className={`w-32 h-32 bg-gradient-to-br ${getBadgeColor()} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse`}>
            <BadgeIcon className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Поздравляем! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Глава {chapterId} успешно завершена
          </p>
          
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
            <Trophy className="w-5 h-5" />
            <span>Получен бейдж: {badge}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Статистика прохождения
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {totalScore}%
              </div>
              <div className="text-sm text-green-700 font-medium">
                Общий результат
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600 mb-2 flex items-center justify-center">
                <Clock className="w-5 h-5 mr-1" />
                {completionTime}
              </div>
              <div className="text-sm text-blue-700 font-medium">
                Время изучения
              </div>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Прогресс главы</span>
              <span className="text-sm font-bold text-green-600">100%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full w-full transition-all duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Достижения
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-yellow-800">{achievement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white mb-6">
          <h3 className="text-xl font-semibold mb-3">Что дальше?</h3>
          <p className="text-green-100 mb-4">
            Отличная работа! Вы готовы к изучению следующей главы или можете вернуться к обзору всех глав.
          </p>
          
          <div className="flex items-center space-x-2 text-green-100">
            <ArrowRight className="w-5 h-5" />
            <span>Глава {chapterId + 1}: Следующий уровень ждет вас!</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onNextChapter}
            className="btn-green w-full flex items-center justify-center space-x-2"
          >
            <span>Перейти к главе {chapterId + 1}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onBackToChapters}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors duration-200 border-2 border-gray-200 hover:border-green-300"
          >
            Вернуться к главам
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChapterComplete;