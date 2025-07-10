import { logger } from './utils/logger.js';
import { formatAIResponse } from './utils/formatter.js';
import { 
  getUserState, 
  updateUserState, 
  addToConversationHistory, 
  getConversationHistory 
} from './utils/userManager.js';
import { getMainMenuKeyboard } from './utils/keyboard.js';
import { basicPhrases } from './data/esperantoData.js';

/**
 * Handle incoming messages
 * @param {TelegramBot} bot - The bot instance
 * @param {Object} msg - The message object
 * @param {Object} openAIService - The OpenAI service
 */
export async function handleMessage(bot, msg, openAIService) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;
  
  // Skip empty messages
  if (!messageText) return;
  
  // Get user state
  const userState = getUserState(userId);
  
  // Handle custom keyboard buttons
  if (messageText === '📚 Главы') {
    bot.sendMessage(chatId, 'Загружаю список глав...').then(() => {
      bot.sendCommand(chatId, 'chapters');
    });
    return;
  }
  
  if (messageText === '🧠 AI-помощник') {
    const aiHelpMessage = `
*AI-помощник по эсперанто*

Я могу ответить на ваши вопросы об эсперанто и помочь с изучением языка.

Просто задайте вопрос, например:
• Как сказать "привет" на эсперанто?
• Объясни правило множественного числа
• Как спрягаются глаголы в настоящем времени?

Я постараюсь дать подробный ответ с примерами!
    `;
    
    updateUserState(userId, { currentState: 'ai_chat' });
    bot.sendMessage(chatId, aiHelpMessage, { parse_mode: 'Markdown' });
    return;
  }
  
  if (messageText === '📝 Тест') {
    bot.sendCommand(chatId, 'test');
    return;
  }
  
  if (messageText === '👤 Мой профиль') {
    bot.sendCommand(chatId, 'profile');
    return;
  }
  
  if (messageText === '🔙 Назад в меню' || messageText === '🔙 К списку глав' || messageText === '🔙 Назад к разделу') {
    // Return to main menu
    updateUserState(userId, { 
      currentState: 'browsing',
      currentChapter: null,
      currentSection: null
    });
    
    bot.sendMessage(
      chatId, 
      'Вернулись в главное меню. Чем я могу помочь?',
      { reply_markup: getMainMenuKeyboard() }
    );
    return;
  }
  
  // If user is in AI chat mode, process with OpenAI
  if (userState.currentState === 'ai_chat') {
    await processAIMessage(bot, msg, openAIService, userId, chatId, messageText);
    return;
  }
  
  // Check for basic phrase requests
  const phraseMatch = basicPhrases.find(
    phrase => messageText.toLowerCase().includes(phrase.russian.toLowerCase()) ||
              messageText.toLowerCase().includes(phrase.esperanto.toLowerCase())
  );
  
  if (phraseMatch) {
    bot.sendMessage(
      chatId,
      `*${phraseMatch.esperanto}* — ${phraseMatch.russian}`,
      { parse_mode: 'Markdown' }
    );
    return;
  }
  
  // If no specific handler matched, process with AI
  await processAIMessage(bot, msg, openAIService, userId, chatId, messageText);
}

/**
 * Process message with OpenAI
 * @param {TelegramBot} bot - The bot instance
 * @param {Object} msg - The message object
 * @param {Object} openAIService - The OpenAI service
 * @param {number} userId - User ID
 * @param {number} chatId - Chat ID
 * @param {string} messageText - Message text
 */
async function processAIMessage(bot, msg, openAIService, userId, chatId, messageText) {
  // Add user message to conversation history
  addToConversationHistory(userId, 'user', messageText);
  
  // Get conversation history
  const conversationHistory = getConversationHistory(userId);
  
  // Send typing action
  bot.sendChatAction(chatId, 'typing');
  
  try {
    // Check if OpenAI is configured
    if (!openAIService.isConfigured()) {
      bot.sendMessage(
        chatId, 
        'Извините, AI-помощник временно недоступен. Пожалуйста, попробуйте позже.'
      );
      return;
    }
    
    // Get response from OpenAI
    const response = await openAIService.sendMessage(
      messageText,
      conversationHistory
    );
    
    // Add AI response to conversation history
    addToConversationHistory(userId, 'assistant', response.response);
    
    // Format and send the response
    const formattedResponse = formatAIResponse(response);
    
    bot.sendMessage(chatId, formattedResponse, { parse_mode: 'Markdown' });
    
    logger.info(`Sent AI response to user ${userId}`);
    
  } catch (error) {
    logger.error(`Error sending AI response: ${error.message}`);
    
    // Send error message to user
    bot.sendMessage(
      chatId,
      `Извините, произошла ошибка: ${error.message}\n\nПожалуйста, попробуйте позже.`
    );
  }
}