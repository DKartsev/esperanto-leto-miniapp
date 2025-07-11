import React from 'react';
import { Trophy, RotateCcw, Save, Star, TrendingUp, BookOpen, Target } from 'lucide-react';

interface TestResultsProps {
  results: any;
  onSaveResults: () => void;
  onRetakeTest: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ results, onSaveResults, onRetakeTest }) => {
  // Calculate section scores
  const calculateSectionScore = (sectionAnswers: any[]) => {
    if (!sectionAnswers || sectionAnswers.length === 0) return 0;
    const correct = sectionAnswers.filter(a => a.isCorrect).length;
    return Math.round((correct / sectionAnswers.length) * 100);
  };

  const sectionScores = {
    reading: calculateSectionScore(results.sectionResults?.reading || []),
    writing: calculateSectionScore(results.sectionResults?.writing || []),
    listening: calculateSectionScore(results.sectionResults?.listening || []),
    grammar: calculateSectionScore(results.sectionResults?.grammar || [])
  };

  const overallScore = Math.round(Object.values(sectionScores).reduce((a, b) => a + b, 0) / 4);

  // Determine CEFR level
  const getCEFRLevel = (score: number) => {
    if (score >= 90) return { level: 'C2', name: 'Профессиональный', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 80) return { level: 'C1', name: 'Продвинутый', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { level: 'B2', name: 'Выше среднего', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (score >= 60) return { level: 'B1', name: 'Средний', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 50) return { level: 'A2', name: 'Элементарный', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: 'A1', name: 'Начальный', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const cefrLevel = getCEFRLevel(overallScore);

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (sectionScores.reading < 70) {
      recommendations.push({
        skill: 'Понимание прочитанного',
        chapters: ['Глава 1: Основы чтения', 'Глава 3: Словарный запас'],
        icon: <BookOpen className="w-5 h-5" />,
        color: 'bg-emerald-500'
      });
    }
    
    if (sectionScores.writing < 70) {
      recommendations.push({
        skill: 'Письмо',
        chapters: ['Глава 2: Грамматика', 'Глава 9: Практические упражнения'],
        icon: <Target className="w-5 h-5" />,
        color: 'bg-green-500'
      });
    }
    
    if (sectionScores.listening < 70) {
      recommendations.push({
        skill: 'Понимание на слух',
        chapters: ['Глава 4: Произношение', 'Глава 5: Диалоги'],
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'bg-emerald-600'
      });
    }
    
    if (sectionScores.grammar < 70) {
      recommendations.push({
        skill: 'Грамматика',
        chapters: ['Глава 2: Грамматика', 'Глава 8: История языка'],
        icon: <Star className="w-5 h-5" />,
        color: 'bg-green-600'
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs} сек`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto container-centered">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">
            Тест завершен! 🎉
          </h1>
          <p className="text-xl text-emerald-700">
            Ваши результаты готовы
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-emerald-600 mb-4">
              {overallScore}%
            </div>
            <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full ${cefrLevel.bg} ${cefrLevel.color} font-semibold text-lg border border-emerald-200`}>
              <Star className="w-6 h-6" />
              <span>Уровень {cefrLevel.level} - {cefrLevel.name}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-900 mb-1">
                {results.totalQuestions || 40}
              </div>
              <div className="text-sm text-emerald-700">Всего вопросов</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {results.answers?.filter((a: any) => a.isCorrect).length || 0}
              </div>
              <div className="text-sm text-green-700">Правильно</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {results.answers?.filter((a: any) => !a.isCorrect).length || 0}
              </div>
              <div className="text-sm text-red-700">Неправильно</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {formatTime(results.timeSpent || 0)}
              </div>
              <div className="text-sm text-emerald-700">Время</div>
            </div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-emerald-900 mb-6 text-center">
            Детализация по навыкам
          </h2>
          
          <div className="space-y-6">
            {[
              { key: 'reading', name: 'Понимание прочитанного', color: 'bg-emerald-500' },
              { key: 'writing', name: 'Письмо', color: 'bg-green-500' },
              { key: 'listening', name: 'Понимание на слух', color: 'bg-emerald-600' },
              { key: 'grammar', name: 'Грамматика', color: 'bg-green-600' }
            ].map((skill) => (
              <div key={skill.key} className="flex items-center space-x-4">
                <div className="w-40 text-sm font-medium text-emerald-800">
                  {skill.name}
                </div>
                <div className="flex-1 bg-emerald-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${skill.color} transition-all duration-1000`}
                    style={{ width: `${sectionScores[skill.key as keyof typeof sectionScores]}%` }}
                  ></div>
                </div>
                <div className="w-16 text-right font-semibold text-emerald-900">
                  {sectionScores[skill.key as keyof typeof sectionScores]}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8 mb-8">
            <h2 className="text-2xl font-semibold text-emerald-900 mb-6 text-center">
              Рекомендации для изучения
            </h2>
            
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-emerald-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 ${rec.color} rounded-full flex items-center justify-center text-white`}>
                      {rec.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-900">
                      Улучшить: {rec.skill}
                    </h3>
                  </div>
                  <div className="ml-13">
                    <p className="text-emerald-700 mb-3">Рекомендуемые главы для изучения:</p>
                    <div className="space-y-2">
                      {rec.chapters.map((chapter, chapterIndex) => (
                        <div key={chapterIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-emerald-800">{chapter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onSaveResults}
            className="flex-1 btn-green flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Сохранить результаты</span>
          </button>
          
          <button
            onClick={onRetakeTest}
            className="flex-1 btn-green flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Пройти тест заново</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults;