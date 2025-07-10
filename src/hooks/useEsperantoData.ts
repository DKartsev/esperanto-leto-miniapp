// Хук для работы с данными эсперанто

import { useState, useEffect, useMemo } from 'react';
import {
  fetchCourseData,
  Chapter,
  Section,
  Question,
  TheoryBlock
} from '../services/courseService.ts';
// Local utilities for progress calculations
export interface LearningProgress {
  chapterId: number;
  sectionId: number;
  completedQuestions: number[];
  score: number;
  timeSpent: number;
  lastAccessed: Date;
}

const calculateSectionProgress = (
  section: Section | undefined,
  completedQuestions: number[]
): number => {
  if (!section) return 0;
  const totalQuestions = section.questions ? section.questions.length : 0;
  const completed = completedQuestions.length;
  return totalQuestions > 0 ? Math.round((completed / totalQuestions) * 100) : 0;
};

const getRecommendedNextSection = (
  chapters: Chapter[],
  currentChapter: number,
  currentSection: number
): { chapterId: number; sectionId: number } | null => {
  const chapter = chapters.find(ch => ch.id === currentChapter);
  if (!chapter) return null;
  if (chapter.sections && currentSection < chapter.sections.length) {
    return { chapterId: currentChapter, sectionId: currentSection + 1 };
  }
  const next = chapters.find(ch => ch.id === currentChapter + 1);
  if (next) return { chapterId: currentChapter + 1, sectionId: 1 };
  return null;
};

// Интерфейс для состояния обучения
interface LearningState {
  currentChapter: number;
  currentSection: number;
  completedSections: Array<{ chapterId: number; sectionId: number }>;
  sectionProgress: Record<string, LearningProgress>;
  totalProgress: number;
}

// Хук для управления данными курса
export const useEsperantoData = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [learningState, setLearningState] = useState<LearningState>(() => {
    // Загружаем состояние из localStorage
    const saved = localStorage.getItem('esperanto-learning-state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading learning state:', error);
      }
    }
    
    // Начальное состояние
    return {
      currentChapter: 1,
      currentSection: 1,
      completedSections: [],
      sectionProgress: {},
      totalProgress: 0
    };
  });

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('esperanto-learning-state', JSON.stringify(learningState));
  }, [learningState]);

  // Загрузка данных курса из Supabase
  useEffect(() => {
    fetchCourseData()
      .then(data => setChapters(data))
      .catch(err => console.error('Failed to load course data', err));
  }, []);

  // Вычисляем общий прогресс
  const totalProgress = useMemo(() => {
    const totalSections = chapters.reduce(
      (total, chapter) => total + (chapter.sections ? chapter.sections.length : 0),
      0
    );
    const completedCount = learningState.completedSections.length;
    return totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0;
  }, [learningState.completedSections, chapters]);

  // Обновляем общий прогресс
  useEffect(() => {
    setLearningState(prev => ({ ...prev, totalProgress }));
  }, [totalProgress]);

  // Функции для работы с данными
  const getChapter = (id: number): Chapter | undefined => {
    return chapters.find(ch => ch.id === id);
  };

  const getSection = (chapterId: number, sectionId: number): Section | undefined => {
    return chapters
      .find(ch => ch.id === chapterId)?.sections?.find(sec => sec.id === sectionId);
  };

  const getQuestions = (chapterId: number, sectionId: number): Question[] => {
    return (
      getSection(chapterId, sectionId)?.questions || []
    );
  };

  const getTheory = (chapterId: number, sectionId: number): TheoryBlock[] => {
    return (
      getSection(chapterId, sectionId)?.theory_blocks || []
    );
  };

  // Функции для управления прогрессом
  const updateSectionProgress = (
    chapterId: number, 
    sectionId: number, 
    completedQuestions: number[],
    score: number,
    timeSpent: number
  ) => {
    const key = `${chapterId}-${sectionId}`;
    const progress: LearningProgress = {
      chapterId,
      sectionId,
      completedQuestions,
      score,
      timeSpent,
      lastAccessed: new Date()
    };

    setLearningState(prev => ({
      ...prev,
      sectionProgress: {
        ...prev.sectionProgress,
        [key]: progress
      }
    }));
  };

  const markSectionCompleted = (chapterId: number, sectionId: number) => {
    setLearningState(prev => {
      const isAlreadyCompleted = prev.completedSections.some(
        section => section.chapterId === chapterId && section.sectionId === sectionId
      );

      if (!isAlreadyCompleted) {
        return {
          ...prev,
          completedSections: [...prev.completedSections, { chapterId, sectionId }]
        };
      }

      return prev;
    });
  };

  const getSectionProgressData = (chapterId: number, sectionId: number): LearningProgress | undefined => {
    const key = `${chapterId}-${sectionId}`;
    return learningState.sectionProgress[key];
  };

  const isSectionCompleted = (chapterId: number, sectionId: number): boolean => {
    return learningState.completedSections.some(
      section => section.chapterId === chapterId && section.sectionId === sectionId
    );
  };

  const isChapterCompleted = (chapterId: number): boolean => {
    const chapter = getChapter(chapterId);
    if (!chapter) return false;
    return (chapter.sections || []).every(section =>
      isSectionCompleted(chapterId, section.id)
    );
  };

  const getNextRecommendedSection = () => {
    return getRecommendedNextSection(chapters, learningState.currentChapter, learningState.currentSection);
  };

  const setCurrentPosition = (chapterId: number, sectionId: number) => {
    setLearningState(prev => ({
      ...prev,
      currentChapter: chapterId,
      currentSection: sectionId
    }));
  };

  // Функции для статистики
  const getChapterProgress = (chapterId: number): number => {
    const chapter = getChapter(chapterId);
    if (!chapter) return 0;
    const completedSections = (chapter.sections || []).filter(section =>
      isSectionCompleted(chapterId, section.id)
    ).length;
    const total = chapter.sections ? chapter.sections.length : 0;
    return total > 0 ? Math.round((completedSections / total) * 100) : 0;
  };

  const getTotalTimeSpent = (): number => {
    return Object.values(learningState.sectionProgress).reduce(
      (total, progress) => total + progress.timeSpent, 0
    );
  };

  const getAverageScore = (): number => {
    const scores = Object.values(learningState.sectionProgress).map(p => p.score);
    if (scores.length === 0) return 0;
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  // Функция сброса прогресса
  const resetProgress = () => {
    setLearningState({
      currentChapter: 1,
      currentSection: 1,
      completedSections: [],
      sectionProgress: {},
      totalProgress: 0
    });
    localStorage.removeItem('esperanto-learning-state');
  };

  return {
    // Данные
    chapters,
    learningState,
    
    // Функции получения данных
    getChapter,
    getSection,
    getQuestions,
    getTheory,
    
    // Функции прогресса
    updateSectionProgress,
    markSectionCompleted,
    getSectionProgressData,
    isSectionCompleted,
    isChapterCompleted,
    getNextRecommendedSection,
    setCurrentPosition,
    
    // Статистика
    getChapterProgress,
    getTotalTimeSpent,
    getAverageScore,
    totalProgress,
    
    // Утилиты
    resetProgress
  };
};

// Хук для работы с конкретным разделом
export const useSectionData = (chapterId: number, sectionId: number) => {
  const { getSection, getQuestions, getTheory, getSectionProgressData, updateSectionProgress } = useEsperantoData();
  
  const section = getSection(chapterId, sectionId);
  const questions = getQuestions(chapterId, sectionId);
  const theory = getTheory(chapterId, sectionId);
  const progress = getSectionProgressData(chapterId, sectionId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>>([]);

  const addAnswer = (questionId: number, selectedAnswer: string, isCorrect: boolean, timeSpent: number) => {
    setAnswers(prev => [...prev, { questionId, selectedAnswer, isCorrect, timeSpent }]);
  };

  const calculateScore = (): number => {
    if (answers.length === 0) return 0;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    return Math.round((correctAnswers / answers.length) * 100);
  };

  const getTotalTimeSpent = (): number => {
    return answers.reduce((total, answer) => total + answer.timeSpent, 0);
  };

  const completeSection = () => {
    const completedQuestions = answers.map(a => a.questionId);
    const score = calculateScore();
    const timeSpent = getTotalTimeSpent();
    
    updateSectionProgress(chapterId, sectionId, completedQuestions, score, timeSpent);
  };

  return {
    section,
    questions,
    theory,
    progress,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    addAnswer,
    calculateScore,
    getTotalTimeSpent,
    completeSection
  };
};

export default useEsperantoData;