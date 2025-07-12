import React from 'react';
import { Play, Clock, BookOpen, Headphones, PenTool, FileText } from 'lucide-react';

interface TestIntroProps {
  onStartTest: () => void;
}

const TestIntro: React.FC<TestIntroProps> = ({ onStartTest }) => {
  const testSections = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Понимание прочитанного",
      description: "10 вопросов на понимание текстов",
      color: "bg-emerald-500"
    },
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "Письмо",
      description: "10 вопросов на грамматику и лексику",
      color: "bg-green-500"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Понимание на слух",
      description: "10 аудио вопросов",
      color: "bg-emerald-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Грамматика",
      description: "10 вопросов на знание правил",
      color: "bg-green-600"
    }
  ];

  return (
    <div className="min-h-screen app-gradient p-6">
      <div className="max-w-4xl mx-auto container-centered w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-4">
            Тест на знание эсперанто
          </h1>
          <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
            Определите свой уровень владения языком эсперанто и получите персональные рекомендации для изучения
          </p>
        </div>

        {/* Test Info */}
        <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8 w-full">
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600 mb-2">40</div>
              <div className="text-sm text-emerald-700 font-medium">Вопросов</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center">
                <Clock className="w-8 h-8 mr-2" />
                30
              </div>
              <div className="text-sm text-green-700 font-medium">Минут</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-600 mb-2">4</div>
              <div className="text-sm text-emerald-700 font-medium">Навыка</div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-emerald-900 mb-6 text-center">
            Структура теста
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8 w-full">
            {testSections.map((section, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className={`w-12 h-12 ${section.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  {section.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900">{section.title}</h3>
                  <p className="text-sm text-emerald-700">{section.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-yellow-800 mb-2">Важная информация:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Тест можно пройти только один раз за сессию</li>
              <li>• Возврат к предыдущим вопросам невозможен</li>
              <li>• Результаты будут сохранены в вашем профиле</li>
              <li>• По итогам вы получите рекомендации по изучению</li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={onStartTest}
            className="test-button flex items-center space-x-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            <span>Начать тест</span>
          </button>
          <p className="text-sm text-emerald-600 mt-4">
            Убедитесь, что у вас есть 30 минут свободного времени
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestIntro;