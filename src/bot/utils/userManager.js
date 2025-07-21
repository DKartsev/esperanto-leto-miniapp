/**
 * User management utilities for the Telegram bot
 * ИСПРАВЛЕНО: Все новые пользователи инициализируются с прогрессом 0
 */

// In-memory user storage (в реальном приложении это была бы база данных)
const users = new Map();

/**
 * User state object structure
 * @typedef {Object} UserState
 * @property {string} currentState - Current state (e.g., 'browsing', 'chapter', 'section', 'quiz')
 * @property {number} currentChapter - Current chapter ID
 * @property {number} currentSection - Current section ID
 * @property {Array} quizAnswers - Array of user's quiz answers
 * @property {number} quizScore - Current quiz score
 * @property {Array} conversationHistory - Array of conversation messages
 * @property {Object} stats - User statistics
 */

/**
 * Get or create user state with ZERO initial progress
 * @param {number} userId - Telegram user ID
 * @returns {UserState} User state object
 */
export function getUserState(userId) {
  if (!users.has(userId)) {
    // ИСПРАВЛЕНО: Создаем нового пользователя с НУЛЕВЫМ прогрессом
    const newUser = {
      currentState: 'browsing',
      currentChapter: null,
      currentSection: null,
      quizAnswers: [],
      quizScore: 0,
      conversationHistory: [],
      stats: {
        level: 'Начинающий',
        chaptersCompleted: 0,        // ВСЕГДА 0 для новых пользователей
        testsCompleted: 0,           // ВСЕГДА 0 для новых пользователей
        progress: 0,                 // ВСЕГДА 0 для новых пользователей
        totalTimeSpent: 0,           // ВСЕГДА 0 для новых пользователей
        completedChapters: [],       // ВСЕГДА пустой массив
        quizResults: [],             // ВСЕГДА пустой массив
        lastActive: new Date(),
        registrationDate: new Date()
      }
    };
    
    users.set(userId, newUser);
    console.log(`[UserManager] ✅ Создан новый пользователь ${userId} с НУЛЕВЫМ прогрессом:`, {
      chaptersCompleted: newUser.stats.chaptersCompleted,
      testsCompleted: newUser.stats.testsCompleted,
      progress: newUser.stats.progress,
      totalTimeSpent: newUser.stats.totalTimeSpent,
      achievements: newUser.stats.completedChapters.length
    });
  }
  
  return users.get(userId);
}

/**
 * Update user state
 * @param {number} userId - Telegram user ID
 * @param {Object} updates - Object with properties to update
 */
export function updateUserState(userId, updates) {
  const currentState = getUserState(userId);
  const updatedState = { ...currentState, ...updates };
  
  // Обновляем время последней активности
  if (updatedState.stats) {
    updatedState.stats.lastActive = new Date();
  }
  
  users.set(userId, updatedState);
  console.log(`[UserManager] Обновлен пользователь ${userId}:`, Object.keys(updates));
}

/**
 * Add message to user's conversation history
 * @param {number} userId - Telegram user ID
 * @param {string} role - Message role ('user' or 'assistant')
 * @param {string} content - Message content
 */
export function addToConversationHistory(userId, role, content) {
  const userState = getUserState(userId);
  
  userState.conversationHistory.push({ 
    role, 
    content, 
    timestamp: new Date() 
  });
  
  // Keep only the last 20 messages
  if (userState.conversationHistory.length > 20) {
    userState.conversationHistory = userState.conversationHistory.slice(-20);
  }
  
  users.set(userId, userState);
}

/**
 * Get user's conversation history
 * @param {number} userId - Telegram user ID
 * @returns {Array} Conversation history
 */
export function getConversationHistory(userId) {
  const userState = getUserState(userId);
  return userState.conversationHistory;
}

/**
 * Reset user's conversation history
 * @param {number} userId - Telegram user ID
 */
export function resetConversationHistory(userId) {
  const userState = getUserState(userId);
  userState.conversationHistory = [];
  users.set(userId, userState);
}

/**
 * Update user's quiz progress
 * @param {number} userId - Telegram user ID
 * @param {boolean} isCorrect - Whether the answer was correct
 */
export function updateQuizProgress(userId, isCorrect) {
  const userState = getUserState(userId);
  
  userState.quizAnswers.push({
    isCorrect,
    timestamp: new Date()
  });
  
  if (isCorrect) {
    userState.quizScore += 1;
  }
  
  users.set(userId, userState);
}

/**
 * Complete a quiz for a user
 * @param {number} userId - Telegram user ID
 */
export function completeQuiz(userId) {
  const userState = getUserState(userId);
  
  userState.stats.testsCompleted += 1;
  userState.currentState = 'browsing';
  
  // Сохраняем результат теста
  const quizResult = {
    score: userState.quizScore,
    totalQuestions: userState.quizAnswers.length,
    completedAt: new Date()
  };
  
  if (!userState.stats.quizResults) {
    userState.stats.quizResults = [];
  }
  userState.stats.quizResults.push(quizResult);
  
  // Сбрасываем текущий тест
  userState.quizAnswers = [];
  userState.quizScore = 0;
  
  // Update progress based on completed tests
  updateProgress(userId);
  
  users.set(userId, userState);
  console.log(`[UserManager] Пользователь ${userId} завершил тест. Новый прогресс: ${userState.stats.progress}%`);
}

/**
 * Complete a chapter for a user
 * @param {number} userId - Telegram user ID
 * @param {number} chapterId - Chapter ID
 */
export function completeChapter(userId, chapterId) {
  const userState = getUserState(userId);
  
  // Check if chapter is already completed
  const completedChapters = userState.stats.completedChapters || [];
  if (!completedChapters.includes(chapterId)) {
    completedChapters.push(chapterId);
    userState.stats.completedChapters = completedChapters;
    userState.stats.chaptersCompleted = completedChapters.length;
    
    console.log(`[UserManager] Пользователь ${userId} завершил главу ${chapterId}`);
  }
  
  // Update progress
  updateProgress(userId);
  
  users.set(userId, userState);
}

/**
 * Update user's overall progress
 * @param {number} userId - Telegram user ID
 */
function updateProgress(userId) {
  const userState = getUserState(userId);
  
  // Calculate progress based on completed chapters and tests
  const chaptersWeight = 0.8; // 80% of progress from chapters
  const testsWeight = 0.2; // 20% of progress from tests
  
  const totalChapters = 14; // Total chapters in the course
  const maxTests = 10; // Maximum tests to consider for progress
  
  const chapterProgress = (userState.stats.chaptersCompleted / totalChapters) * 100;
  const testProgress = Math.min(userState.stats.testsCompleted / maxTests, 1) * 100;
  
  const totalProgress = Math.round(
    (chapterProgress * chaptersWeight) + (testProgress * testsWeight)
  );
  
  userState.stats.progress = Math.max(0, Math.min(100, totalProgress)); // Ensure 0-100 range
  
  // Update level based on progress
  if (userState.stats.progress >= 80) {
    userState.stats.level = 'Продвинутый';
  } else if (userState.stats.progress >= 40) {
    userState.stats.level = 'Средний';
  } else {
    userState.stats.level = 'Начинающий';
  }
  
  console.log(`[UserManager] Обновлен прогресс пользователя ${userId}: ${userState.stats.progress}% (${userState.stats.level})`);
}

/**
 * Get user statistics
 * @param {number} userId - Telegram user ID
 * @returns {Object} User statistics
 */
export function getUserStats(userId) {
  const userState = getUserState(userId);
  return userState.stats;
}

/**
 * Reset user progress (for testing purposes)
 * @param {number} userId - Telegram user ID
 */
export function resetUserProgress(userId) {
  const userState = getUserState(userId);
  
  userState.stats = {
    level: 'Начинающий',
    chaptersCompleted: 0,
    testsCompleted: 0,
    progress: 0,
    totalTimeSpent: 0,
    completedChapters: [],
    quizResults: [],
    lastActive: new Date(),
    registrationDate: userState.stats.registrationDate || new Date()
  };
  
  userState.currentState = 'browsing';
  userState.currentChapter = null;
  userState.currentSection = null;
  userState.quizAnswers = [];
  userState.quizScore = 0;
  
  users.set(userId, userState);
  console.log(`[UserManager] Сброшен прогресс пользователя ${userId}`);
}

/**
 * Get all users (for admin purposes)
 * @returns {Map} All users
 */
export function getAllUsers() {
  return users;
}

/**
 * Get user count
 * @returns {number} Number of registered users
 */
export function getUserCount() {
  return users.size;
}

/**
 * Initialize user with ZERO progress (explicit function)
 * @param {number} userId - Telegram user ID
 * @param {Object} userInfo - Additional user info from Telegram
 */
export function initializeUser(userId, userInfo = {}) {
  if (!users.has(userId)) {
    const newUser = {
      currentState: 'browsing',
      currentChapter: null,
      currentSection: null,
      quizAnswers: [],
      quizScore: 0,
      conversationHistory: [],
      userInfo: {
        firstName: userInfo.first_name || 'Пользователь',
        lastName: userInfo.last_name || '',
        username: userInfo.username || '',
        languageCode: userInfo.language_code || 'ru'
      },
      stats: {
        level: 'Начинающий',
        chaptersCompleted: 0,        // КРИТИЧНО: ВСЕГДА 0
        testsCompleted: 0,           // КРИТИЧНО: ВСЕГДА 0
        progress: 0,                 // КРИТИЧНО: ВСЕГДА 0
        totalTimeSpent: 0,           // КРИТИЧНО: ВСЕГДА 0
        completedChapters: [],       // КРИТИЧНО: ВСЕГДА пустой массив
        quizResults: [],             // КРИТИЧНО: ВСЕГДА пустой массив
        lastActive: new Date(),
        registrationDate: new Date()
      }
    };
    
    users.set(userId, newUser);
    console.log(`[UserManager] ✅ ИНИЦИАЛИЗИРОВАН новый пользователь ${userId} (${userInfo.first_name || 'Unknown'}) с НУЛЕВЫМ прогрессом:`, {
      chaptersCompleted: newUser.stats.chaptersCompleted,
      testsCompleted: newUser.stats.testsCompleted,
      progress: newUser.stats.progress,
      totalTimeSpent: newUser.stats.totalTimeSpent,
      level: newUser.stats.level
    });
    return newUser;
  }
  
  // Если пользователь уже существует, возвращаем его без изменений
  const existingUser = users.get(userId);
  console.log(`[UserManager] Пользователь ${userId} уже существует. Текущий прогресс: ${existingUser.stats.progress}%`);
  return existingUser;
}

/**
 * Force reset all users to zero progress (for debugging)
 */
export function resetAllUsersProgress() {
  console.log(`[UserManager] 🔄 СБРОС ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (${users.size} пользователей)`);
  
  for (const [userId, userState] of users.entries()) {
    userState.stats = {
      level: 'Начинающий',
      chaptersCompleted: 0,
      testsCompleted: 0,
      progress: 0,
      totalTimeSpent: 0,
      completedChapters: [],
      quizResults: [],
      lastActive: new Date(),
      registrationDate: userState.stats.registrationDate || new Date()
    };
    
    userState.currentState = 'browsing';
    userState.currentChapter = null;
    userState.currentSection = null;
    userState.quizAnswers = [];
    userState.quizScore = 0;
    
    users.set(userId, userState);
    console.log(`[UserManager] ✅ Сброшен пользователь ${userId} к нулевому прогрессу`);
  }
  
  console.log('[UserManager] ✅ Все пользователи сброшены к нулевому прогрессу');
}
