import React, { useState, useEffect } from 'react';
import { Volume2, ArrowRight, Clock, X } from 'lucide-react';

interface Question {
  id: number;
  section: 'reading' | 'writing' | 'listening' | 'grammar';
  type: 'multiple-choice' | 'text-input' | 'audio';
  question: string;
  options?: string[];
  correctAnswer: string;
  audioUrl?: string;
  passage?: string;
}

interface TestInterfaceProps {
  onComplete: (results: any) => void;
  onBack?: () => void; // Добавляем пропс для возврата
}

const TestInterface: React.FC<TestInterfaceProps> = ({ onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds

  const questions: Question[] = [
    // Reading Comprehension (1-10)
    {
      id: 1,
      section: 'reading',
      type: 'multiple-choice',
      question: 'Согласно тексту, что является основной целью эсперанто?',
      passage: 'Esperanto estas internacia planlingvo kreita de D-ro Zamenhof en 1887. La ĉefa celo de Esperanto estas faciligi komunikadon inter homoj de malsamaj nacioj kaj kulturoj.',
      options: ['Заменить все национальные языки', 'Облегчить общение между людьми разных наций', 'Создать новую культуру', 'Упростить изучение языков'],
      correctAnswer: 'Облегчить общение между людьми разных наций'
    },
    {
      id: 2,
      section: 'reading',
      type: 'multiple-choice',
      question: 'Кто создал язык эсперанто?',
      passage: 'Esperanto estas internacia planlingvo kreita de D-ro Zamenhof en 1887.',
      options: ['Профессор Смит', 'Доктор Заменгоф', 'Лингвист Иванов', 'Учитель Браун'],
      correctAnswer: 'Доктор Заменгоф'
    },
    // Writing (11-20)
    {
      id: 11,
      section: 'writing',
      type: 'multiple-choice',
      question: 'Выберите правильный перевод: "Я читаю книгу"',
      options: ['Mi legos libron', 'Mi legas libron', 'Mi legis libron', 'Mi legus libron'],
      correctAnswer: 'Mi legas libron'
    },
    {
      id: 12,
      section: 'writing',
      type: 'multiple-choice',
      question: 'Какое окончание имеют прилагательные в эсперанто?',
      options: ['-o', '-a', '-e', '-i'],
      correctAnswer: '-a'
    },
    // Listening (21-30)
    {
      id: 21,
      section: 'listening',
      type: 'audio',
      question: 'Что говорит диктор?',
      options: ['Saluton, kiel vi fartas?', 'Bonan matenon, amiko', 'Dankon pro via helpo', 'Ĝis revido, ĝis baldaŭ'],
      correctAnswer: 'Saluton, kiel vi fartas?',
      audioUrl: '/audio/question21.mp3'
    },
    {
      id: 22,
      section: 'listening',
      type: 'audio',
      question: 'Какое время дня упоминается в аудио?',
      options: ['Утро', 'День', 'Вечер', 'Ночь'],
      correctAnswer: 'Утро',
      audioUrl: '/audio/question22.mp3'
    },
    // Grammar (31-40)
    {
      id: 31,
      section: 'grammar',
      type: 'multiple-choice',
      question: 'Как образуется множественное число в эсперанто?',
      options: ['Добавлением -s', 'Добавлением -j', 'Добавлением -oj', 'Изменением окончания'],
      correctAnswer: 'Добавлением -j'
    },
    {
      id: 32,
      section: 'grammar',
      type: 'multiple-choice',
      question: 'Какое окончание имеют наречия в эсперанто?',
      options: ['-a', '-o', '-e', '-i'],
      correctAnswer: '-e'
    }
  ];

  // Generate 40 questions by repeating and modifying the base questions
  const generateFullQuestionSet = (): Question[] => {
    const fullSet: Question[] = [];
    const sections = ['reading', 'writing', 'listening', 'grammar'] as const;
    
    sections.forEach((section, sectionIndex) => {
      for (let i = 0; i < 10; i++) {
        const baseQuestion = questions.find(q => q.section === section) || questions[0];
        fullSet.push({
          ...baseQuestion,
          id: sectionIndex * 10 + i + 1,
          question: `${baseQuestion.question} (Вопрос ${sectionIndex * 10 + i + 1})`
        });
      }
    });
    
    return fullSet;
  };

  const fullQuestions = generateFullQuestionSet();
  const currentQuestionData = fullQuestions[currentQuestion];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit test
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSectionName = (section: string) => {
    switch (section) {
      case 'reading': return 'Понимание прочитанного';
      case 'writing': return 'Письмо';
      case 'listening': return 'Понимание на слух';
      case 'grammar': return 'Грамматика';
      default: return 'Тест';
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'reading': return 'bg-emerald-500';
      case 'writing': return 'bg-green-500';
      case 'listening': return 'bg-emerald-600';
      case 'grammar': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    const answer = currentQuestionData.type === 'text-input' ? textAnswer : selectedAnswer;
    
    const newAnswer = {
      questionId: currentQuestionData.id,
      section: currentQuestionData.section,
      question: currentQuestionData.question,
      selectedAnswer: answer,
      correctAnswer: currentQuestionData.correctAnswer,
      isCorrect: answer === currentQuestionData.correctAnswer
    };

    setAnswers(prev => [...prev, newAnswer]);

    if (currentQuestion + 1 >= 40) {
      handleComplete();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
      setTextAnswer('');
    }
  };

  const handleComplete = () => {
    const sectionResults = {
      reading: answers.filter(a => a.section === 'reading'),
      writing: answers.filter(a => a.section === 'writing'),
      listening: answers.filter(a => a.section === 'listening'),
      grammar: answers.filter(a => a.section === 'grammar')
    };

    onComplete({
      totalQuestions: 40,
      answers,
      sectionResults,
      timeSpent: (30 * 60) - timeRemaining
    });
  };

  const handleExit = () => {
    if (confirm('Вы уверены, что хотите выйти из теста? Прогресс будет потерян.')) {
      if (onBack) {
        onBack();
      }
    }
  };

  const playAudio = () => {
    // Simulate audio playback
    console.log('Playing audio:', currentQuestionData.audioUrl);
  };

  const progress = ((currentQuestion + 1) / 40) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            {/* Back Button */}
            <button
              onClick={handleExit}
              className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
              title="Выйти из теста"
            >
              <X className="w-6 h-6 text-emerald-600" />
            </button>
            
            <div className="text-center flex-1">
              <h1 className="text-lg font-semibold text-emerald-900">
                {getSectionName(currentQuestionData.section)}
              </h1>
              <p className="text-sm text-emerald-700">
                Вопрос {currentQuestion + 1} из 40
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-red-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-emerald-200 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getSectionColor(currentQuestionData.section)}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-emerald-600 text-center">
            {Math.round(progress)}% завершено
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-8">
            {/* Reading Passage */}
            {currentQuestionData.passage && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-emerald-800 mb-3">Текст для чтения:</h3>
                <p className="text-emerald-700 leading-relaxed text-lg">
                  {currentQuestionData.passage}
                </p>
              </div>
            )}

            {/* Audio Player */}
            {currentQuestionData.type === 'audio' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6 text-center">
                <h3 className="font-semibold text-emerald-800 mb-4">Прослушайте аудио:</h3>
                <button
                  onClick={playAudio}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>Воспроизвести аудио</span>
                </button>
                <p className="text-sm text-emerald-600 mt-2">
                  Вы можете прослушать аудио несколько раз
                </p>
              </div>
            )}

            {/* Question */}
            <h2 className="text-2xl font-semibold text-emerald-900 mb-8">
              {currentQuestionData.question}
            </h2>

            {/* Answer Options */}
            {currentQuestionData.type === 'multiple-choice' && (
              <div className="space-y-4 mb-8">
                {currentQuestionData.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === option
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {selectedAnswer === option && (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Text Input */}
            {currentQuestionData.type === 'text-input' && (
              <div className="mb-8">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Введите ваш ответ здесь..."
                  className="w-full p-4 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none resize-none h-32"
                />
              </div>
            )}

            {/* Next Button */}
            <div className="text-center">
              <button
                onClick={handleNext}
                disabled={!selectedAnswer && !textAnswer}
                className={`font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center space-x-2 mx-auto ${
                  selectedAnswer || textAnswer
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>{currentQuestion + 1 >= 40 ? 'Завершить тест' : 'Следующий вопрос'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestInterface;