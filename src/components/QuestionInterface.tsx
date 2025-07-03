import React, { useState, useEffect } from 'react';
import { HelpCircle, Eye, ArrowRight, X, Book, ChevronDown } from 'lucide-react';

interface Question {
  id: number;
  type: 'multiple-choice' | 'text-input' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
}

interface TheoryBlock {
  title: string;
  content: string;
  examples: string[];
  keyTerms: string[];
}

interface QuestionInterfaceProps {
  chapterId: number;
  sectionId: number;
  onComplete: (results: any) => void;
  onBackToSections: () => void;
}

const QuestionInterface: React.FC<QuestionInterfaceProps> = ({ 
  chapterId, 
  sectionId, 
  onComplete, 
  onBackToSections 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const [showTheory, setShowTheory] = useState(true);
  const [currentTheoryBlock, setCurrentTheoryBlock] = useState(0);

  // Get theory blocks and questions for current section
  const getSectionData = (chapterId: number, sectionId: number) => {
    if (chapterId === 1) {
      switch (sectionId) {
        case 1: // Базовая лексика
          return {
            theoryBlocks: [
              {
                title: "Основы словарного запаса эсперанто",
                content: "Словарь эсперанто построен на интернациональных корнях, знакомых носителям европейских языков. Каждое слово имеет постоянное значение и произношение. Изучение базовой лексики начинается с самых употребительных слов повседневного общения.",
                examples: [
                  "saluton (привет) — универсальное приветствие",
                  "dankon (спасибо) — выражение благодарности", 
                  "pardonu (извините) — вежливое извинение"
                ],
                keyTerms: ["базовая лексика", "интернациональные корни", "повседневное общение"]
              },
              {
                title: "Семья и дом",
                content: "Слова, обозначающие семью и дом, являются основой для описания личной жизни. Эти термины помогают рассказать о себе и своих близких. Все существительные оканчиваются на -o.",
                examples: [
                  "domo (дом) — место жительства",
                  "patrino (мама) — мать, родительница",
                  "amiko (друг) — близкий человек"
                ],
                keyTerms: ["семья", "дом", "родственники", "окончание -o"]
              }
            ],
            questions: [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'Как переводится слово "здравствуйте" на эсперанто?',
                options: ['saluton', 'dankon', 'pardonu', 'ĝis revido'],
                correctAnswer: 'saluton',
                explanation: 'Слово "saluton" является универсальным приветствием в эсперанто, используется в любое время дня.',
                hints: ['Это слово используется при встрече', 'Происходит от латинского корня']
              },
              {
                id: 2,
                type: 'multiple-choice',
                question: 'Как переводится слово "спасибо" на эсперанто?',
                options: ['saluton', 'dankon', 'pardonu', 'ĝis revido'],
                correctAnswer: 'dankon',
                explanation: 'Слово "dankon" выражает благодарность и является одним из самых важных слов вежливости.',
                hints: ['Выражает благодарность', 'Используется после получения помощи']
              },
              {
                id: 3,
                type: 'multiple-choice',
                question: 'Как переводится слово "дом" на эсперанто?',
                options: ['domo', 'hundo', 'kato', 'akvo'],
                correctAnswer: 'domo',
                explanation: 'Слово "domo" обозначает дом, жилище. Как и все существительные в эсперанто, оканчивается на -o.',
                hints: ['Место где живут люди', 'Оканчивается на -o']
              },
              {
                id: 4,
                type: 'multiple-choice',
                question: 'Как переводится слово "друг" на эсперанто?',
                options: ['amiko', 'patrino', 'lakto', 'pomo'],
                correctAnswer: 'amiko',
                explanation: 'Слово "amiko" означает друг. Корень "am-" связан с любовью и дружбой.',
                hints: ['Близкий человек', 'Корень связан с любовью']
              }
            ]
          };

        case 2: // Произношение и алфавит
          return {
            theoryBlocks: [
              {
                title: "Алфавит и произношение",
                content: "Алфавит эсперанто состоит из 28 букв. Каждая буква имеет только одно произношение. Нет немых букв. Это делает чтение и произношение предсказуемыми и простыми для изучения.",
                examples: [
                  "a, e, i, o, u — гласные звуки как в русском",
                  "ĉ = ч, ĝ = дж, ĵ = ж, ŝ = ш, ŭ = у краткое",
                  "Каждая буква читается одинаково во всех словах"
                ],
                keyTerms: ["28 букв", "одно произношение", "диакритические знаки", "предсказуемость"]
              },
              {
                title: "Правила ударения",
                content: "Ударение в эсперанто всегда падает на предпоследний слог. Это правило не имеет исключений. Знание этого правила помогает правильно произносить любое слово эсперанто.",
                examples: [
                  "SA-lu-ton (привет) — ударение на SA",
                  "es-pe-RAN-to — ударение на RAN", 
                  "u-ni-ver-si-TA-to (университет) — ударение на TA"
                ],
                keyTerms: ["предпоследний слог", "без исключений", "правильное произношение"]
              }
            ],
            questions: [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'Сколько букв в алфавите эсперанто?',
                options: ['26', '28', '30', '32'],
                correctAnswer: '28',
                explanation: 'В алфавите эсперанто 28 букв: 23 латинские буквы плюс 5 букв с диакритическими знаками.',
                hints: ['Больше чем в английском', 'Включает буквы с надстрочными знаками']
              },
              {
                id: 2,
                type: 'multiple-choice',
                question: 'На какой слог падает ударение в эсперанто?',
                options: ['последний', 'предпоследний', 'первый', 'зависит от слова'],
                correctAnswer: 'предпоследний',
                explanation: 'Ударение в эсперанто всегда падает на предпоследний слог, без исключений.',
                hints: ['Это правило без исключений', 'Не на последний слог']
              }
            ]
          };

        case 3: // Артикли и существительные
          return {
            theoryBlocks: [
              {
                title: "Определенный артикль",
                content: "В эсперанто есть только один артикль — определенный артикль 'la'. Он не изменяется по родам, числам или падежам. Неопределенного артикля нет — его отсутствие указывает на неопределенность.",
                examples: [
                  "la domo (дом) — конкретный, известный дом",
                  "domo (дом) — любой дом, дом вообще",
                  "la libroj (книги) — конкретные книги"
                ],
                keyTerms: ["артикль la", "определенность", "неизменяемость", "отсутствие неопределенного артикля"]
              },
              {
                title: "Существительные и их окончания",
                content: "Все существительные в эсперанто оканчиваются на -o в единственном числе. Множественное число образуется добавлением -j. Это правило действует без исключений для всех существительных.",
                examples: [
                  "libro (книга) → libroj (книги)",
                  "hundo (собака) → hundoj (собаки)",
                  "amiko (друг) → amikoj (друзья)"
                ],
                keyTerms: ["окончание -o", "множественное число -j", "без исключений"]
              }
            ],
            questions: [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'Какое окончание имеют все существительные в эсперанто?',
                options: ['-a', '-o', '-e', '-i'],
                correctAnswer: '-o',
                explanation: 'Все существительные в эсперанто оканчиваются на -o в единственном числе.',
                hints: ['Это гласная буква', 'Как в итальянском языке']
              },
              {
                id: 2,
                type: 'multiple-choice',
                question: 'Как образуется множественное число существительных?',
                options: ['добавлением -s', 'добавлением -j', 'изменением окончания', 'добавлением -oj'],
                correctAnswer: 'добавлением -j',
                explanation: 'Множественное число образуется добавлением -j к форме единственного числа.',
                hints: ['Добавляется одна буква', 'Эта буква есть в русском алфавите']
              }
            ]
          };

        case 4: // Местоимения
          return {
            theoryBlocks: [
              {
                title: "Личные местоимения",
                content: "Личные местоимения в эсперанто просты и логичны. Они не изменяются по падежам в именительном падеже. Система местоимений включает формы для всех лиц единственного и множественного числа.",
                examples: [
                  "mi (я), vi (ты/вы), li (он), ŝi (она), ĝi (оно)",
                  "ni (мы), ili (они)",
                  "Mi estas studento. (Я студент.)"
                ],
                keyTerms: ["личные местоимения", "не изменяются", "единственное число", "множественное число"]
              },
              {
                title: "Притяжательные местоимения",
                content: "Притяжательные местоимения образуются добавлением окончания -a к личным местоимениям. Они согласуются с определяемым словом в числе, добавляя -j во множественном числе.",
                examples: [
                  "mia (мой/моя/моё) → miaj (мои)",
                  "via libro (твоя книга), viaj libroj (твои книги)",
                  "lia domo (его дом), ŝia kato (её кошка)"
                ],
                keyTerms: ["притяжательные", "окончание -a", "согласование", "множественное число -j"]
              }
            ],
            questions: [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'Как сказать "я" на эсперанто?',
                options: ['mi', 'vi', 'li', 'ni'],
                correctAnswer: 'mi',
                explanation: 'Местоимение "mi" означает "я" и является основой для образования других форм.',
                hints: ['Первое лицо единственного числа', 'Короткое слово']
              },
              {
                id: 2,
                type: 'multiple-choice',
                question: 'Как образуются притяжательные местоимения?',
                options: ['добавлением -o', 'добавлением -a', 'добавлением -e', 'добавлением -i'],
                correctAnswer: 'добавлением -a',
                explanation: 'Притяжательные местоимения образуются добавлением окончания -a к личным местоимениям.',
                hints: ['Как у прилагательных', 'Окончание прилагательных']
              }
            ]
          };

        case 5: // Простые фразы
          return {
            theoryBlocks: [
              {
                title: "Базовые фразы общения",
                content: "Простые фразы эсперанто позволяют начать общение с первых дней изучения. Эти фразы включают приветствия, благодарности, извинения и базовые вопросы. Они составляют основу вежливого общения.",
                examples: [
                  "Saluton! Kiel vi fartas? (Привет! Как дела?)",
                  "Dankon pro via helpo. (Спасибо за вашу помощь.)",
                  "Pardonu, mi ne komprenas. (Извините, я не понимаю.)"
                ],
                keyTerms: ["базовые фразы", "вежливое общение", "приветствия", "благодарности"]
              },
              {
                title: "Построение простых предложений",
                content: "Простые предложения в эсперанто следуют логичной структуре: подлежащее + сказуемое + дополнение. Порядок слов гибкий, но эта схема наиболее естественна для начинающих.",
                examples: [
                  "Mi lernas esperanton. (Я изучаю эсперанто.)",
                  "Vi parolas bone. (Вы говорите хорошо.)",
                  "Ni amas la naturon. (Мы любим природу.)"
                ],
                keyTerms: ["структура предложения", "подлежащее", "сказуемое", "дополнение", "гибкий порядок"]
              }
            ],
            questions: [
              {
                id: 1,
                type: 'multiple-choice',
                question: 'Как сказать "Как дела?" на эсперанто?',
                options: ['Kiel vi fartas?', 'Kio estas?', 'Kie vi estas?', 'Kiam vi venos?'],
                correctAnswer: 'Kiel vi fartas?',
                explanation: 'Фраза "Kiel vi fartas?" является стандартным способом спросить о самочувствии.',
                hints: ['Начинается с "Kiel"', 'Вопрос о состоянии']
              },
              {
                id: 2,
                type: 'multiple-choice',
                question: 'Как сказать "Я не понимаю" на эсперанто?',
                options: ['Mi komprenas', 'Mi ne komprenas', 'Vi komprenas', 'Ni komprenas'],
                correctAnswer: 'Mi ne komprenas',
                explanation: 'Фраза "Mi ne komprenas" означает "Я не понимаю". Отрицание "ne" ставится перед глаголом.',
                hints: ['Включает отрицание "ne"', 'Полезная фраза для изучающих']
              }
            ]
          };
      }
    }

    // Default data for other chapters
    return {
      theoryBlocks: [
        {
          title: "Теоретические основы",
          content: "Этот раздел содержит основные теоретические сведения по теме. Изучите материал внимательно, так как он понадобится для выполнения практических заданий.",
          examples: ["Пример 1", "Пример 2"],
          keyTerms: ["термин 1", "термин 2"]
        }
      ],
      questions: [
        {
          id: 1,
          type: 'multiple-choice',
          question: 'Пример вопроса для главы ' + chapterId + ', раздел ' + sectionId,
          options: ['Вариант 1', 'Вариант 2', 'Вариант 3', 'Вариант 4'],
          correctAnswer: 'Вариант 1',
          explanation: 'Это пример объяснения для главы ' + chapterId + ', раздел ' + sectionId,
          hints: ['Подсказка 1', 'Подсказка 2']
        }
      ]
    };
  };

  const sectionData = getSectionData(chapterId, sectionId);
  const { theoryBlocks, questions } = sectionData;
  const totalQuestions = questions.length * 3; // Each question repeated 3 times with variations
  const currentQuestionData = questions[currentQuestion % questions.length];

  const getChapterTitle = (chapterId: number): string => {
    switch (chapterId) {
      case 1: return "Основы эсперанто";
      case 2: return "Основные глаголы и действия";
      case 3: return "Грамматика";
      default: return `Глава ${chapterId}`;
    }
  };

  const getSectionTitle = (chapterId: number, sectionId: number): string => {
    if (chapterId === 1) {
      switch (sectionId) {
        case 1: return "Базовая лексика";
        case 2: return "Произношение и алфавит";
        case 3: return "Артикли и существительные";
        case 4: return "Местоимения";
        case 5: return "Простые фразы";
        default: return `Раздел ${sectionId}`;
      }
    }
    return `Раздел ${sectionId}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQuestionData.correctAnswer;
    setIsCorrect(correct);
    
    const newAnswer = {
      questionId: currentQuestionData.id,
      question: currentQuestionData.question,
      selectedAnswer: answer,
      correctAnswer: currentQuestionData.correctAnswer,
      isCorrect: correct,
      hintsUsed: hintsUsed
    };
    
    setAnswers(prev => [...prev, newAnswer]);
  };

  const handleNext = () => {
    if (currentQuestion + 1 >= totalQuestions) {
      onComplete({
        totalQuestions,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        incorrectAnswers: answers.filter(a => !a.isCorrect),
        totalHintsUsed: answers.reduce((sum, a) => sum + a.hintsUsed, 0)
      });
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
      setShowAnswer(false);
      setIsCorrect(null);
      setHintsUsed(0);
      setShowHint(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setSelectedAnswer(currentQuestionData.correctAnswer);
    setIsCorrect(true);
  };

  const handleHint = () => {
    if (hintsUsed < 2 && hintsUsed < currentQuestionData.hints.length) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
    }
  };

  const handleStartQuestions = () => {
    setShowTheory(false);
  };

  const handleNextTheoryBlock = () => {
    if (currentTheoryBlock < theoryBlocks.length - 1) {
      setCurrentTheoryBlock(prev => prev + 1);
    } else {
      handleStartQuestions();
    }
  };

  const handlePrevTheoryBlock = () => {
    if (currentTheoryBlock > 0) {
      setCurrentTheoryBlock(prev => prev - 1);
    }
  };

  if (showTheory) {
    const currentTheory = theoryBlocks[currentTheoryBlock];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-emerald-200 sticky top-0 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onBackToSections}
                className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-emerald-600" />
              </button>
              <div className="text-center">
                <h1 className="text-lg font-semibold text-emerald-900">
                  {getChapterTitle(chapterId)} — {getSectionTitle(chapterId, sectionId)}
                </h1>
                <p className="text-sm text-emerald-700">
                  Теория {currentTheoryBlock + 1} из {theoryBlocks.length}
                </p>
              </div>
              <div className="w-10"></div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-emerald-200 rounded-full h-3">
              <div
                className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentTheoryBlock + 1) / theoryBlocks.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Theory Content */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-8 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-900">Теория</h2>
                  <p className="text-emerald-700">{currentTheory.title}</p>
                </div>
              </div>

              <div className="prose prose-emerald max-w-none">
                <p className="text-emerald-800 text-lg leading-relaxed mb-6">
                  {currentTheory.content}
                </p>

                {/* Examples */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-emerald-900 mb-4">Примеры:</h3>
                  <div className="space-y-3">
                    {currentTheory.examples.map((example, index) => (
                      <div key={index} className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <code className="text-emerald-800 font-mono text-lg">{example}</code>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Terms */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-emerald-900 mb-4">Ключевые термины:</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentTheory.keyTerms.map((term, index) => (
                      <span key={index} className="bg-emerald-200 text-emerald-800 px-4 py-2 rounded-full font-medium">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevTheoryBlock}
                  disabled={currentTheoryBlock === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                    currentTheoryBlock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  Назад
                </button>

                <div className="text-center">
                  <div className="flex space-x-2">
                    {theoryBlocks.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentTheoryBlock ? 'bg-emerald-600' : 'bg-emerald-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNextTheoryBlock}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                >
                  <span>
                    {currentTheoryBlock === theoryBlocks.length - 1 ? 'К вопросам' : 'Далее'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBackToSections}
              className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-emerald-600" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-emerald-900">
                {getChapterTitle(chapterId)} — {getSectionTitle(chapterId, sectionId)}
              </h1>
              <p className="text-sm text-emerald-700">
                Вопрос {currentQuestion + 1} из {totalQuestions}
              </p>
            </div>
            <button
              onClick={() => setShowTheory(true)}
              className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
              title="Показать теорию"
            >
              <Book className="w-6 h-6 text-emerald-600" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-emerald-200 rounded-full h-3">
            <div
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-6">
            {currentQuestionData.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3 mb-6">
            {currentQuestionData.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={selectedAnswer !== ''}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : selectedAnswer !== '' && option === currentQuestionData.correctAnswer
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50'
                } ${selectedAnswer !== '' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {selectedAnswer === option && isCorrect && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {selectedAnswer === option && !isCorrect && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Explanation */}
          {showAnswer && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-emerald-800 mb-2">Объяснение:</h3>
              <p className="text-emerald-700">{currentQuestionData.explanation}</p>
            </div>
          )}

          {/* Hint */}
          {showHint && hintsUsed > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Подсказка:</h3>
              <p className="text-blue-700">{currentQuestionData.hints[hintsUsed - 1]}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!selectedAnswer && hintsUsed < 2 && (
            <button
              onClick={handleHint}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Подсказка ({2 - hintsUsed})</span>
            </button>
          )}
          
          {!selectedAnswer && (
            <button
              onClick={handleShowAnswer}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>Показать ответ</span>
            </button>
          )}
          
          {selectedAnswer && (
            <button
              onClick={handleNext}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>{currentQuestion + 1 >= totalQuestions ? 'Завершить' : 'Следующий'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionInterface;