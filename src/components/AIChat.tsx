import React, { useState } from 'react';
import { Bot, MessageCircle, Settings, AlertCircle, Wrench } from 'lucide-react';

const AIChat: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col h-full app-gradient">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-emerald-900">AI Помощник</h1>
              <p className="text-sm text-emerald-600">Изучение эсперанто</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">В разработке</span>
            </div>
            
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Placeholder */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-12 h-12 text-emerald-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            AI Помощник в разработке
          </h2>
          
          <p className="text-emerald-700 mb-6 leading-relaxed">
            Мы работаем над созданием умного AI-помощника для изучения эсперанто. 
            Скоро здесь появится интерактивный чат с поддержкой голоса и персональными рекомендациями.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-emerald-800 mb-3">Планируемые возможности:</h3>
            <div className="space-y-2 text-sm text-emerald-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Ответы на вопросы об эсперанто</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Проверка произношения</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Персональные рекомендации</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Интерактивные диалоги</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Голосовой ввод и вывод</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-700 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Временно недоступно</span>
            </div>
            <p className="text-xs text-yellow-600">
              Пока AI-помощник находится в разработке, вы можете изучать материал в разделах "Главная" и "Тест"
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-emerald-900">
                  Настройки AI
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-emerald-600" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-yellow-800">Статус разработки</span>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  </div>
                  <p className="text-sm text-yellow-700">AI-помощник находится в активной разработке</p>
                </div>

                {/* Future Configuration */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
                  <h3 className="font-medium text-gray-700 mb-2">Будущие настройки</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• Выбор языка интерфейса</p>
                    <p>• Настройки голоса</p>
                    <p>• Уровень сложности ответов</p>
                    <p>• Персонализация обучения</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <h3 className="font-medium text-emerald-800 mb-2">Обратная связь</h3>
                  <p className="text-sm text-emerald-700">
                    Есть идеи для AI-помощника? Напишите нам через раздел "Мой аккаунт"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;