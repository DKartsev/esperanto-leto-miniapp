import { logger } from '../utils/logger.js';
import { formatQuizQuestion, formatQuizResult } from '../utils/formatter.js';
import { getQuizKeyboard } from '../utils/keyboard.js';
import { quizQuestions } from '../data/esperantoData.js';
import { 
  getUserState, 
  updateUserState, 
  updateQuizProgress, 
  completeQuiz 
} from '../utils/userManager.js';

/**
 * Start a quiz for a user
 * @param {TelegramBot} bot - The bot instance
 * @param {number} chatId - Chat ID
 * @param {number} userId - User ID
 */
export function startQuiz(bot, chatId, userId) {
  // Initialize quiz state
  updateUserState(userId, {
    currentState: 'quiz',
    currentQuestionIndex: 0,
    quizAnswers: [],
    quizScore: 0
  });
  
  // Send first question
  sendQuizQuestion(bot, chatId, userId);
  
  logger.info(`User ${userId} started a quiz`);
}

/**
 * Send a quiz question to the user
 * @param {TelegramBot} bot - The bot instance
 * @param {number} chatId - Chat ID
 * @param {number} userId - User ID
 */
export function sendQuizQuestion(bot, chatId, userId) {
  const userState = getUserState(userId);
  const { currentQuestionIndex } = userState;
  
  // Check if we've reached the end of the quiz
  if (currentQuestionIndex >= quizQuestions.length) {
    finishQuiz(bot, chatId, userId);
    return;
  }
  
  // Get current question
  const question = quizQuestions[currentQuestionIndex];
  
  // Format question message
  const message = formatQuizQuestion(
    question, 
    currentQuestionIndex + 1, 
    quizQuestions.length
  );
  
  // Send question with options keyboard
  bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: getQuizKeyboard(question.options)
  });
}

/**
 * Handle a quiz answer
 * @param {TelegramBot} bot - The bot instance
 * @param {Object} msg - Message object
 * @param {number} userId - User ID
 */
export function handleQuizAnswer(bot, msg, userId) {
  const chatId = msg.chat.id;
  const userState = getUserState(userId);
  const { currentQuestionIndex } = userState;
  
  // Get current question
  const question = quizQuestions[currentQuestionIndex];
  
  // Parse answer (format: "A. Option text")
  const answerText = msg.text;
  const answerLetter = answerText.charAt(0).toUpperCase();
  const answerIndex = answerLetter.charCodeAt(0) - 65; // Convert A-D to 0-3
  
  // Check if answer is valid
  if (answerIndex < 0 || answerIndex >= question.options.length) {
    bot.sendMessage(
      chatId, 
      'Пожалуйста, выберите один из предложенных вариантов ответа.'
    );
    return;
  }
  
  // Check if answer is correct
  const isCorrect = answerIndex === question.correctAnswer;
  
  // Update quiz progress
  updateQuizProgress(userId, isCorrect);
  
  // Send feedback
  let feedbackMessage;
  if (isCorrect) {
    feedbackMessage = '✅ Правильно!';
  } else {
    const correctOption = question.options[question.correctAnswer];
    feedbackMessage = `❌ Неправильно. Правильный ответ: *${String.fromCharCode(65 + question.correctAnswer)}. ${correctOption}*`;
  }
  
  bot.sendMessage(chatId, feedbackMessage, { parse_mode: 'Markdown' })
    .then(() => {
      // Move to next question
      updateUserState(userId, { currentQuestionIndex: currentQuestionIndex + 1 });
      
      // Short delay before next question
      setTimeout(() => {
        sendQuizQuestion(bot, chatId, userId);
      }, 1000);
    });
}

/**
 * Finish a quiz and show results
 * @param {TelegramBot} bot - The bot instance
 * @param {number} chatId - Chat ID
 * @param {number} userId - User ID
 */
export function finishQuiz(bot, chatId, userId) {
  const userState = getUserState(userId);
  const { quizScore } = userState;
  
  // Format result message
  const resultMessage = formatQuizResult(quizScore, quizQuestions.length);
  
  // Complete the quiz
  completeQuiz(userId);
  
  // Send results
  bot.sendMessage(chatId, resultMessage, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        [{ text: '🔄 Пройти тест снова' }],
        [{ text: '🔙 Назад в меню' }]
      ],
      resize_keyboard: true
    }
  });
  
  logger.info(`User ${userId} completed quiz with score ${quizScore}/${quizQuestions.length}`);
}
