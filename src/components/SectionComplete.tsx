import React from 'react';
import { CheckCircle, XCircle, RotateCcw, ArrowRight, Trophy, Clock } from 'lucide-react';

interface SectionResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: any[];
  totalHintsUsed: number;
}

interface SectionCompleteProps {
  results: SectionResults;
  chapterId: number;
  sectionId: number;
  onRetryIncorrect: () => void;
  onCompleteChapter: () => void;
}

const SectionComplete: React.FC<SectionCompleteProps> = ({
  results,
  chapterId,
  sectionId,
  onRetryIncorrect,
  onCompleteChapter
}) => {
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const incorrectCount = results.incorrectAnswers.length;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { message: "Отличная работа!", color: "text-green-600", icon: Trophy };
    if (percentage >= 70) return { message: "Хорошо выполнено!", color: "text-blue-600", icon: CheckCircle };
    if (percentage >= 50) return { message: "Неплохо, но можно лучше", color: "text-yellow-600", icon: Clock };
    return { message: "Нужно больше практики", color: "text-red-600", icon: XCircle };
  };

  const performance = getPerformanceMessage();
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Раздел завершен!</h1>
          <p className="text-gray-600">Глава {chapterId} — Раздел {sectionId}</p>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 mb-6">
          <div className="text-center mb-6">
            <div className={`text-6xl font-bold mb-2 ${performance.color}`}>
              {percentage}%
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <PerformanceIcon className={`w-6 h-6 ${performance.color}`} />
              <span className={`text-lg font-semibold ${performance.color}`}>
                {performance.message}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {results.correctAnswers}
              </div>
              <div className="text-sm text-green-700">Правильно</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {incorrectCount}
              </div>
              <div className="text-sm text-red-700">Неправильно</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {results.totalHintsUsed}
              </div>
              <div className="text-sm text-blue-700">Подсказок</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="text-center text-sm text-gray-600">
            {results.correctAnswers} из {results.totalQuestions} вопросов
          </div>
        </div>

        {/* Incorrect Answers */}
        {incorrectCount > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              Ошибки ({incorrectCount})
            </h3>
            <div className="space-y-4">
              {results.incorrectAnswers.map((answer, index) => (
                <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="font-medium text-gray-900 mb-2">
                    {answer.question}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">Ваш ответ:</span>
                      <span className="font-medium text-red-700">{answer.selectedAnswer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">Правильный:</span>
                      <span className="font-medium text-green-700">{answer.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {incorrectCount > 0 && (
            <button
              onClick={onRetryIncorrect}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Повторить ошибочные ({incorrectCount})</span>
            </button>
          )}
          
          <button
            onClick={onCompleteChapter}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>Завершить главу</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionComplete;