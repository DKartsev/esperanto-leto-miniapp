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
 * @param {import('telegraf').Context} ctx - Telegraf context
 */
export function startQuiz(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  // Initialize quiz state
  updateUserState(userId, {
    currentState: 'quiz',
    currentQuestionIndex: 0,
    quizAnswers: [],
    quizScore: 0
  });
  
  // Send first question
  sendQuizQuestion(ctx);
  
  logger.info(`User ${userId} started a quiz`);
}

/**
 * Send a quiz question to the user
 * @param {import('telegraf').Context} ctx - Telegraf context
 */
export function sendQuizQuestion(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const userState = getUserState(userId);
  const { currentQuestionIndex } = userState;
  
  // Check if we've reached the end of the quiz
  if (currentQuestionIndex >= quizQuestions.length) {
    finishQuiz(ctx);
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
  ctx.telegram.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    reply_markup: getQuizKeyboard(question.options)
  });
}

/**
 * Handle a quiz answer
 * @param {import('telegraf').Context} ctx - Telegraf context
 */
export function handleQuizAnswer(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const userState = getUserState(userId);
  const { currentQuestionIndex } = userState;
  
  // Get current question
  const question = quizQuestions[currentQuestionIndex];
  
  // Parse answer (format: "A. Option text")
  const answerText = ctx.message.text;
  const answerLetter = answerText.charAt(0).toUpperCase();
  const answerIndex = answerLetter.charCodeAt(0) - 65; // Convert A-D to 0-3
  
  // Check if answer is valid
  if (answerIndex < 0 || answerIndex >= question.options.length) {
    ctx.telegram.sendMessage(
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
  
  ctx.telegram.sendMessage(chatId, feedbackMessage, { parse_mode: 'Markdown' })
    .then(() => {
      // Move to next question
      updateUserState(userId, { currentQuestionIndex: currentQuestionIndex + 1 });
      
      // Short delay before next question
      setTimeout(() => {
        sendQuizQuestion(ctx);
      }, 1000);
    });
}

/**
 * Finish a quiz and show results
 * @param {import('telegraf').Context} ctx - Telegraf context
 */
export function finishQuiz(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const userState = getUserState(userId);
  const { quizScore } = userState;
  
  // Format result message
  const resultMessage = formatQuizResult(quizScore, quizQuestions.length);
  
  // Complete the quiz
  completeQuiz(userId);
  
  // Send results
  ctx.telegram.sendMessage(chatId, resultMessage, {
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
