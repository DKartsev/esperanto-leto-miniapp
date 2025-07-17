// Утилиты для извлечения и организации данных

import { Chapter } from '../data/esperantoData';

// Интерфейс для экспорта данных
export interface ExportedData {
  chapters: Chapter[];
  totalQuestions: number;
  totalTheoryBlocks: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  estimatedTotalTime: string;
}

// Функция для извлечения всех данных курса
export const extractCourseData = (chapters: Chapter[]): ExportedData => {
  let totalQuestions = 0;
  let totalTheoryBlocks = 0;
  let totalMinutes = 0;
  
  const difficultyCount = {
    easy: 0,
    medium: 0,
    hard: 0
  };

  chapters.forEach(chapter => {
    chapter.sections.forEach(section => {
      totalQuestions += section.questions.length;
      totalTheoryBlocks += section.theoryBlocks.length;
      
      // Подсчет времени (извлекаем числа из строки типа "30 мин")
      const timeMatch = section.duration.match(/(\d+)/);
      if (timeMatch) {
        totalMinutes += parseInt(timeMatch[1]);
      }
      
      // Подсчет сложности вопросов
      section.questions.forEach(question => {
        difficultyCount[question.difficulty]++;
      });
    });
  });

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const estimatedTotalTime = hours > 0 ? `${hours}ч ${minutes}м` : `${minutes}м`;

  return {
    chapters,
    totalQuestions,
    totalTheoryBlocks,
    difficultyDistribution: difficultyCount,
    estimatedTotalTime
  };
};

// Функция для извлечения данных конкретной главы
export const extractChapterData = (chapter: Chapter) => {
  const sections = chapter.sections.map(section => ({
    id: section.id,
    title: section.title,
    description: section.description,
    duration: section.duration,
    theoryBlocksCount: section.theoryBlocks.length,
    questionsCount: section.questions.length,
    theoryBlocks: section.theoryBlocks.map(block => ({
      title: block.title,
      contentLength: block.content.length,
      examplesCount: block.examples.length,
      keyTermsCount: block.keyTerms.length
    })),
    questions: section.questions.map(question => ({
      id: question.id,
      type: question.type,
      difficulty: question.difficulty,
      hasHints: question.hints.length > 0,
      optionsCount: question.options?.length || 0
    }))
  }));

  return {
    chapterInfo: {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      difficulty: chapter.difficulty,
      estimatedTime: chapter.estimatedTime,
      sectionsCount: chapter.sections.length
    },
    sections
  };
};

// Функция для создания индекса поиска
export const createSearchIndex = (chapters: Chapter[]) => {
  const searchIndex: Array<{
    type: 'chapter' | 'section' | 'theory' | 'question';
    id: string;
    title: string;
    content: string;
    chapterId: number;
    sectionId?: number;
    keywords: string[];
  }> = [];

  chapters.forEach(chapter => {
    // Индексируем главу
    searchIndex.push({
      type: 'chapter',
      id: `chapter-${chapter.id}`,
      title: chapter.title,
      content: chapter.description,
      chapterId: chapter.id,
      keywords: [chapter.title, chapter.description, chapter.difficulty].filter(Boolean)
    });

    chapter.sections.forEach(section => {
      // Индексируем раздел
      searchIndex.push({
        type: 'section',
        id: `section-${chapter.id}-${section.id}`,
        title: section.title,
        content: section.description,
        chapterId: chapter.id,
        sectionId: section.id,
        keywords: [section.title, section.description].filter(Boolean)
      });

      // Индексируем теоретические блоки
      section.theoryBlocks.forEach((block, blockIndex) => {
        searchIndex.push({
          type: 'theory',
          id: `theory-${chapter.id}-${section.id}-${blockIndex}`,
          title: block.title,
          content: block.content,
          chapterId: chapter.id,
          sectionId: section.id,
          keywords: [...block.keyTerms, block.title, ...block.examples]
        });
      });

      // Индексируем вопросы
      section.questions.forEach(question => {
        searchIndex.push({
          type: 'question',
          id: `question-${chapter.id}-${section.id}-${question.id}`,
          title: question.question,
          content: question.explanation,
          chapterId: chapter.id,
          sectionId: section.id,
          keywords: [question.question, question.explanation, ...(question.options || []), question.correctAnswer]
        });
      });
    });
  });

  return searchIndex;
};

// Функция для экспорта в JSON
export const exportToJSON = (data: unknown): string => {
  return JSON.stringify(data, null, 2);
};

// Функция для экспорта в CSV (для вопросов)
export const exportQuestionsToCSV = (chapters: Chapter[]): string => {
  const headers = [
    'Chapter ID',
    'Chapter Title', 
    'Section ID',
    'Section Title',
    'Question ID',
    'Question Type',
    'Question Text',
    'Correct Answer',
    'Difficulty',
    'Options',
    'Explanation',
    'Hints'
  ];

  const rows: string[][] = [headers];

  chapters.forEach(chapter => {
    chapter.sections.forEach(section => {
      section.questions.forEach(question => {
        rows.push([
          chapter.id.toString(),
          chapter.title,
          section.id.toString(),
          section.title,
          question.id.toString(),
          question.type,
          question.question,
          question.correctAnswer,
          question.difficulty,
          (question.options || []).join('; '),
          question.explanation,
          question.hints.join('; ')
        ]);
      });
    });
  });

  return rows.map(row => 
    row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
  ).join('\n');
};

// Функция для валидации данных
export const validateCourseData = (chapters: Chapter[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  chapters.forEach((chapter, chapterIndex) => {
    // Проверка обязательных полей главы
    if (!chapter.title) {
      errors.push(`Глава ${chapterIndex + 1}: отсутствует название`);
    }
    if (!chapter.description) {
      warnings.push(`Глава ${chapterIndex + 1}: отсутствует описание`);
    }
    if (chapter.sections.length === 0) {
      errors.push(`Глава ${chapterIndex + 1}: нет разделов`);
    }

    chapter.sections.forEach((section, sectionIndex) => {
      // Проверка обязательных полей раздела
      if (!section.title) {
        errors.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}: отсутствует название`);
      }
      if (section.questions.length === 0) {
        warnings.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}: нет вопросов`);
      }
      if (section.theoryBlocks.length === 0) {
        warnings.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}: нет теоретических блоков`);
      }

      section.questions.forEach((question, questionIndex) => {
        // Проверка вопросов
        if (!question.question) {
          errors.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}, Вопрос ${questionIndex + 1}: отсутствует текст вопроса`);
        }
        if (!question.correctAnswer) {
          errors.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}, Вопрос ${questionIndex + 1}: отсутствует правильный ответ`);
        }
        if (question.type === 'multiple-choice' && (!question.options || question.options.length < 2)) {
          errors.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}, Вопрос ${questionIndex + 1}: недостаточно вариантов ответа`);
        }
        if (question.type === 'multiple-choice' && question.options && !question.options.includes(question.correctAnswer)) {
          errors.push(`Глава ${chapterIndex + 1}, Раздел ${sectionIndex + 1}, Вопрос ${questionIndex + 1}: правильный ответ не найден среди вариантов`);
        }
      });
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Функция для генерации отчета о курсе
export const generateCourseReport = (chapters: Chapter[]): string => {
  const data = extractCourseData(chapters);
  const validation = validateCourseData(chapters);

  let report = `# Отчет о курсе "Изучение Эсперанто"\n\n`;
  
  report += `## Общая статистика\n`;
  report += `- Всего глав: ${data.chapters.length}\n`;
  report += `- Всего вопросов: ${data.totalQuestions}\n`;
  report += `- Всего теоретических блоков: ${data.totalTheoryBlocks}\n`;
  report += `- Примерное время изучения: ${data.estimatedTotalTime}\n\n`;

  report += `## Распределение по сложности\n`;
  report += `- Легкие вопросы: ${data.difficultyDistribution.easy}\n`;
  report += `- Средние вопросы: ${data.difficultyDistribution.medium}\n`;
  report += `- Сложные вопросы: ${data.difficultyDistribution.hard}\n\n`;

  report += `## Структура курса\n`;
  data.chapters.forEach(chapter => {
    report += `### ${chapter.title}\n`;
    report += `- Сложность: ${chapter.difficulty}\n`;
    report += `- Время: ${chapter.estimatedTime}\n`;
    report += `- Разделов: ${chapter.sections.length}\n`;
    
    chapter.sections.forEach(section => {
      report += `  - ${section.title} (${section.duration})\n`;
    });
    report += `\n`;
  });

  if (!validation.isValid) {
    report += `## Ошибки валидации\n`;
    validation.errors.forEach(error => {
      report += `- ❌ ${error}\n`;
    });
    report += `\n`;
  }

  if (validation.warnings.length > 0) {
    report += `## Предупреждения\n`;
    validation.warnings.forEach(warning => {
      report += `- ⚠️ ${warning}\n`;
    });
  }

  return report;
};
