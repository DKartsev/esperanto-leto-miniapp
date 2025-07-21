/**
 * Formatting utilities for the Telegram bot
 */

/**
 * Format chapter list message
 * @param {Array} chapters - Array of chapter objects
 * @returns {string} Formatted message
 */
export function formatChapterList(chapters) {
  let message = '📚 *Главы курса эсперанто*\n\n';
  
  chapters.forEach(chapter => {
    message += `*${chapter.id}.* ${chapter.title}\n`;
  });
  
  message += '\nВыберите главу из списка или отправьте номер главы.';
  
  return message;
}

/**
 * Format section list message
 * @param {Object} chapter - Chapter object
 * @returns {string} Formatted message
 */
export function formatSectionList(chapter) {
  let message = `📖 *Глава ${chapter.id}: ${chapter.title}*\n\n`;
  message += 'Разделы:\n';
  
  chapter.sections.forEach(section => {
    message += `*${section.id}.* ${section.title}\n`;
  });
  
  message += '\nВыберите раздел из списка или отправьте номер в формате \'1.2\' (где 1 - глава, 2 - раздел).';
  
  return message;
}

/**
 * Format section content message
 * @param {number} chapterId - Chapter ID
 * @param {number} sectionId - Section ID
 * @param {Object} content - Section content object
 * @returns {string} Formatted message
 */
export function formatSectionContent(chapterId, sectionId, content) {
  let message = `📝 *Глава ${chapterId}, Раздел ${sectionId}: ${content.title}*\n\n`;
  
  message += content.content;
  
  if (content.examples && content.examples.length > 0) {
    message += '\n\n*Примеры:*\n';
    content.examples.forEach(example => {
      message += `• ${example}\n`;
    });
  }
  
  message += '\n\nДля практики отправьте: practice';
  
  return message;
}

/**
 * Format quiz question message
 * @param {Object} question - Question object
 * @param {number} questionNumber - Current question number
 * @param {number} totalQuestions - Total number of questions
 * @returns {string} Formatted message
 */
export function formatQuizQuestion(question, questionNumber, totalQuestions) {
  let message = `*Вопрос ${questionNumber}/${totalQuestions}*\n\n`;
  
  message += question.question + '\n\n';
  
  question.options.forEach((option, index) => {
    message += `*${String.fromCharCode(65 + index)}.* ${option}\n`;
  });
  
  return message;
}

/**
 * Format quiz result message
 * @param {number} score - Score (number of correct answers)
 * @param {number} total - Total number of questions
 * @returns {string} Formatted message
 */
export function formatQuizResult(score, total) {
  const percentage = Math.round((score / total) * 100);
  
  let message = '*Результаты теста*\n\n';
  message += `Правильных ответов: *${score}/${total}* (${percentage}%)\n\n`;
  
  if (percentage >= 90) {
    message += '🏆 Отличный результат! Вы отлично знаете эсперанто!';
  } else if (percentage >= 70) {
    message += '👍 Хороший результат! Вы хорошо знаете эсперанто.';
  } else if (percentage >= 50) {
    message += '👌 Неплохой результат. Продолжайте изучение!';
  } else {
    message += '🤔 Вам стоит больше практиковаться. Не сдавайтесь!';
  }
  
  return message;
}

/**
 * Format AI response message
 * @param {Object} response - Response object from OpenAI
 * @returns {string} Formatted message
 */
export function formatAIResponse(response) {
  let message = response.response;
  
  if (response.examples && response.examples.length > 0) {
    message += '\n\n*Примеры:*\n';
    response.examples.forEach(example => {
      message += `• ${example}\n`;
    });
  }
  
  if (response.tips && response.tips.length > 0) {
    message += '\n\n*Советы:*\n';
    response.tips.forEach(tip => {
      message += `• ${tip}\n`;
    });
  }
  
  return message;
}

/**
 * Format user profile message
 * @param {Object} user - User object
 * @param {Object} stats - User statistics
 * @returns {string} Formatted message
 */
export function formatUserProfile(user, stats) {
  const { first_name, username } = user;
  const { level, chaptersCompleted, testsCompleted, progress } = stats;
  
  let message = '*Профиль пользователя*\n\n';
  message += `Имя: ${first_name}\n`;
  if (username) message += `Имя пользователя: @${username}\n`;
  message += `Уровень: ${level}\n`;
  message += `Изучено глав: ${chaptersCompleted}/14\n`;
  message += `Пройдено тестов: ${testsCompleted}\n`;
  message += `Общий прогресс: ${progress}%\n\n`;
  
  message += '_Продолжайте изучение, чтобы улучшить свои показатели!_';
  
  return message;
}
