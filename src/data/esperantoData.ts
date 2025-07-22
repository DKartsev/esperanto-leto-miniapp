export interface Question {
  id: number;
  type: 'multiple-choice' | 'text-input' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TheoryBlock {
  id: number;
  title: string;
  content: string;
  examples: string[];
  keyTerms: string[];
  practicalTips: string[];
}

export interface Section {
  id: number;
  title: string;
  description: string;
  duration: string;
  theoryBlocks: TheoryBlock[];
  questions: Question[];
  prerequisites?: number[];
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  difficulty: 'Легкий' | 'Средний' | 'Сложный';
  estimatedTime: string;
  sections: Section[];
  prerequisites?: number[];
}

let cache: Chapter[] | null = null;

export const fetchEsperantoData = async (): Promise<Chapter[]> => {
  if (cache) return cache;
  const res = await fetch('/esperantoData.json');
  if (!res.ok) throw new Error('Failed to load esperanto data');
  cache = (await res.json()) as Chapter[];
  return cache ?? [];
};

export const getChapterById = (
  chapters: Chapter[],
  id: number
): Chapter | undefined => chapters.find(ch => ch.id === id);

export const getSectionById = (
  chapters: Chapter[],
  chapterId: number,
  sectionId: number
): Section | undefined => {
  const chapter = getChapterById(chapters, chapterId);
  return chapter?.sections.find(sec => sec.id === sectionId);
};

export const getQuestionsBySection = (
  chapters: Chapter[],
  chapterId: number,
  sectionId: number
): Question[] => {
  const section = getSectionById(chapters, chapterId, sectionId);
  return section?.questions ?? [];
};

export const getTheoryBySection = (
  chapters: Chapter[],
  chapterId: number,
  sectionId: number
): TheoryBlock[] => {
  const section = getSectionById(chapters, chapterId, sectionId);
  return section?.theoryBlocks ?? [];
};

export const getTotalQuestions = (chapters: Chapter[]): number =>
  chapters.reduce(
    (total, ch) =>
      total + ch.sections.reduce((sTotal, sec) => sTotal + sec.questions.length, 0),
    0
  );

export const getQuestionsByDifficulty = (
  chapters: Chapter[],
  difficulty: 'easy' | 'medium' | 'hard'
): Question[] => {
  const all: Question[] = [];
  chapters.forEach(ch => {
    ch.sections.forEach(sec => {
      all.push(...sec.questions.filter(q => q.difficulty === difficulty));
    });
  });
  return all;
};

export interface LearningProgress {
  chapterId: number;
  sectionId: number;
  completedQuestions: number[];
  score: number;
  timeSpent: number;
  lastAccessed: Date;
}

export const calculateSectionProgress = (
  chapters: Chapter[],
  chapterId: number,
  sectionId: number,
  completedQuestions: number[]
): number => {
  const section = getSectionById(chapters, chapterId, sectionId);
  if (!section) return 0;
  const total = section.questions.length;
  const completed = completedQuestions.length;
  return Math.round((completed / total) * 100);
};

export const getRecommendedNextSection = (
  chapters: Chapter[],
  currentChapter: number,
  currentSection: number
): { chapterId: number; sectionId: number } | null => {
  const chapter = getChapterById(chapters, currentChapter);
  if (!chapter) return null;
  if (currentSection < chapter.sections.length) {
    return { chapterId: currentChapter, sectionId: currentSection + 1 };
  }
  const nextChapter = getChapterById(chapters, currentChapter + 1);
  if (nextChapter) {
    return { chapterId: currentChapter + 1, sectionId: 1 };
  }
  return null;
};
