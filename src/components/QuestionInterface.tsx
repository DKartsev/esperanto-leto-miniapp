import { useState, type FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Eye, ArrowRight, X, Book, Brain } from 'lucide-react'
import Tooltip from './ui/Tooltip'
import LoadingScreen from './LoadingScreen';
import { fetchTheoryBlocks, fetchQuestions } from '../services/courseService'
import { saveProgressBulk, saveTestResults } from '../services/progressService'
import { useAuth } from './SupabaseAuthProvider'
import { useLoadData } from '../hooks/useLoadData';
import TheoryBlock from './TheoryBlock';


export interface QuestionResultItem {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
}

export interface QuestionResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: QuestionResultItem[];
  totalHintsUsed: number;
}

interface QuestionInterfaceProps {
  chapterId: number;
  sectionId: number;
  onComplete: (results: QuestionResults) => void;
  onBackToSections: () => void;
}

const QuestionInterface: FC<QuestionInterfaceProps> = ({
  chapterId,
  sectionId,
  onComplete,
  onBackToSections
}) => {
  const { refreshStats, isAuthenticated } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime] = useState(Date.now())
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState<QuestionResultItem[]>([]);
  const [isExiting, setIsExiting] = useState(false)
  const [showTheory, setShowTheory] = useState(true);
  const [currentTheoryBlock, setCurrentTheoryBlock] = useState(0);
  const [theoryBlocks, setTheoryBlocks] = useState<Array<{ id: number; title: string; content: string; examples: string[]; key_terms: string[] }>>([])
  const [questions, setQuestions] = useState<Array<{ id: number; type: string; question: string; options: string[]; correctAnswer: string; explanation: string; hints: string[]; difficulty: string }>>([])
  const { loading, error } = useLoadData(async () => {
    const theory = await fetchTheoryBlocks(sectionId)
    const qData = await fetchQuestions(sectionId)
        console.log('Loaded questions count:', qData.length)
        const formatted = (qData as Array<{
          id: number
          type: string
          question: string
          options: string[]
          correct_answer: string
          explanation: string
          hints: string[]
          difficulty: string
        }>).map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          hints: q.hints,
          difficulty: q.difficulty
        }))
    setTheoryBlocks(theory as Array<{ id: number; title: string; content: string; examples: string[]; key_terms: string[] }>)
    setQuestions(formatted)
    return true
  }, [chapterId, sectionId])

  const totalQuestions = questions.length
  const currentQuestionData = questions[currentQuestion]

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (questions.length === 0) {
    return <div className="p-6">Данные не найдены</div>
  }

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

  const termTranslations: Record<string, string> = {
    saluton: 'привет',
    dankon: 'спасибо'
  }

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer)
    const correct = answer === currentQuestionData.correctAnswer
    setIsCorrect(correct)

    const newAnswer = {
      questionId: currentQuestionData.id,
      question: currentQuestionData.question,
      selectedAnswer: answer,
      correctAnswer: currentQuestionData.correctAnswer,
      isCorrect: correct,
      hintsUsed: hintsUsed
    }

    setAnswers(prev => [...prev, newAnswer])

    if (!isAuthenticated) {
      console.warn('Answer not saved: user is not authenticated')
    }
  }

  const handleNext = async () => {
    if (currentQuestion + 1 >= totalQuestions) {
      const results = {
        totalQuestions,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        incorrectAnswers: answers.filter(a => !a.isCorrect),
        totalHintsUsed: answers.reduce((sum, a) => sum + a.hintsUsed, 0)
      }

      if (isAuthenticated) {
        try {
          await saveProgressBulk(chapterId, sectionId, answers)
          const spent = Math.round((Date.now() - startTime) / 1000)
          await saveTestResults(
            chapterId,
            sectionId,
            results.correctAnswers,
            results.totalQuestions,
            spent
          )
          await refreshStats()
        } catch (err) {
          console.error('Ошибка сохранения результатов:', err)
        }
      }

      onComplete(results)
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

  const handleNextDelayed = () => {
    setIsExiting(true)
    setTimeout(async () => {
      setIsExiting(false)
      await handleNext()
    }, 800)
  }

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-emerald-200 p-8 mb-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Book className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-900 flex items-center gap-1">
                    <Brain className="w-6 h-6" /> Теория
                  </h2>
                  <p className="text-emerald-700">{currentTheory.title}</p>
                </div>
              </div>

              <div className="prose prose-emerald max-w-none">
                <TheoryBlock content={currentTheory.content} />

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
                    {currentTheory.key_terms.map((term, index) => (
                      <Tooltip key={index} text={termTranslations[term] || term}>
                        <span className="cursor-pointer bg-emerald-200 text-emerald-800 px-4 py-2 rounded-full font-medium">
                          {term}
                        </span>
                      </Tooltip>
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
            </motion.div>
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
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionData.id}
            initial={{ opacity: 0, y: 10 }}
            animate={isExiting ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6"
          >
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
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
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
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }} className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!selectedAnswer && hintsUsed < 2 && (
            <button
              onClick={handleHint}
              className="flex-1 bg-blue-100 text-blue-800 font-semibold py-2 px-3 rounded-lg transition-transform duration-200 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95"
            >
              <span role="img" aria-label="hint">💡</span>
              <span>Подсказка ({2 - hintsUsed})</span>
            </button>
          )}
          
          {!selectedAnswer && (
            <button
              onClick={handleShowAnswer}
              className="flex-1 bg-gray-100 text-gray-800 font-semibold py-2 px-3 rounded-lg transition-transform duration-200 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95"
            >
              <span role="img" aria-label="answer">👁</span>
              <span>Показать ответ</span>
            </button>
          )}
          
          {selectedAnswer && (
            <button
              onClick={handleNextDelayed}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-transform duration-200 flex items-center justify-center space-x-2 hover:scale-105 active:scale-95"
            >
              <span>{currentQuestion + 1 >= totalQuestions ? 'Завершить' : 'Следующий'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
      </AnimatePresence>
    </div>
  </div>
  );
};

export default QuestionInterface;
