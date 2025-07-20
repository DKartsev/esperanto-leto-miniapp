import { supabase } from './supabaseClient.js'
import { getCurrentUser, findOrCreateUserProfile } from './authService.js'

/**
 * Сохранить ответ пользователя
 * @param {number} chapterId - ID главы
 * @param {number} sectionId - ID раздела
 * @param {number} questionId - ID вопроса
 * @param {boolean} isCorrect - Правильность ответа
 * @param {string} selectedAnswer - Выбранный ответ
 * @param {number} timeSpent - Время на ответ (в секундах)
 * @param {number} hintsUsed - Количество использованных подсказок
 * @returns {Promise<Object>} Сохраненный ответ
 */
export async function saveProgress(
  chapterId,
  sectionId,
  questionId,
  selectedAnswer,
  isCorrect,
  timeSpent = 0,
  hintsUsed = 0
) {
  try {
    // Отмечаем вызов функции в localStorage для отладки
    localStorage.setItem('saveProgress_called', new Date().toISOString())

    const user = await getCurrentUser()
    if (!user) {
      console.warn('User not authenticated, skipping save')
      return null
    }

    let userId = user.id

    if (/^\d+$/.test(String(userId))) {
      const tgUsername =
        window?.Telegram?.WebApp?.initDataUnsafe?.user?.username || null
      const mappedId = await findOrCreateUserProfile(String(userId), tgUsername)
      if (!mappedId) {
        console.warn('Could not resolve Telegram ID to UUID')
        return null
      }
      userId = mappedId
    }

    console.log('💾 Сохранение ответа:', {
      chapterId,
      sectionId,
      questionId,
      isCorrect
    })

    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          chapter_id: chapterId,
          section_id: sectionId,
          question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_spent: timeSpent,
          hints_used: hintsUsed,
          answered_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      localStorage.setItem('saveProgress_error', error.message)
      throw error
    }

    // Отмечаем успешное сохранение
    localStorage.setItem('saveProgress_success', 'ok')
    console.log('✅ Ответ сохранен успешно')
    return data
  } catch (error) {
    console.error('❌ Ошибка сохранения ответа:', error.message)
    // Сохраняем текст ошибки для отладки
    localStorage.setItem('saveProgress_error', error.message)
    throw new Error(`Ошибка сохранения ответа: ${error.message}`)
  }
}

// Для обратной совместимости
export const saveAnswer = saveProgress

/**
 * Получить весь прогресс пользователя
 * @returns {Promise<Array>} Массив ответов пользователя
 */
export async function getUserProgress() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('answered_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Ошибка получения прогресса:', error.message)
    return []
  }
}

/**
 * Получить прогресс по конкретной главе
 * @param {number} chapterId - ID главы
 * @returns {Promise<Array>} Прогресс по главе
 */
export async function getChapterProgress(chapterId) {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .order('answered_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Ошибка получения прогресса главы:', error.message)
    return []
  }
}

/**
 * Получить прогресс по конкретному разделу
 * @param {number} chapterId - ID главы
 * @param {number} sectionId - ID раздела
 * @returns {Promise<Array>} Прогресс по разделу
 */
export async function getSectionProgress(chapterId, sectionId) {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('section_id', sectionId)
      .order('answered_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Ошибка получения прогресса раздела:', error.message)
    return []
  }
}

/**
 * Получить процент прохождения раздела
 * @param {number} chapterId - ID главы
 * @param {number} sectionId - ID раздела
 * @returns {Promise<number>} Процент завершения
 */
export async function getSectionProgressPercent(chapterId, sectionId) {
  try {
    const user = await getCurrentUser()
    if (!user) return 0

    const { count: answeredCount, error: progressError } = await supabase
      .from('user_progress')
      .select('question_id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('section_id', sectionId)

    if (progressError) throw progressError

    const { count: totalQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', sectionId)

    if (questionsError) throw questionsError

    if (!totalQuestions || totalQuestions === 0) return 0

    return Math.round((answeredCount / totalQuestions) * 100)
  } catch (error) {
    console.error('❌ Ошибка получения процента прогресса раздела:', error.message)
    return 0
  }
}

/**
 * Получить процент прохождения главы
 * @param {number} chapterId - ID главы
 * @returns {Promise<number>} Процент завершения
 */
export async function getChapterProgressPercent(chapterId) {
  try {
    const user = await getCurrentUser()
    if (!user) return 0

    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('id')
      .eq('chapter_id', chapterId)

    if (sectionsError) throw sectionsError

    const totalSections = sections ? sections.length : 0
    if (totalSections === 0) return 0

    const { data: completed, error: progressError } = await supabase
      .from('user_progress')
      .select('section_id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)

    if (progressError) throw progressError

    const completedCount = completed ? new Set(completed.map(p => p.section_id)).size : 0

    return Math.round((completedCount / totalSections) * 100)
  } catch (error) {
    console.error('❌ Ошибка получения процента прогресса главы:', error.message)
    return 0
  }
}

/**
 * Получить статистику пользователя
 * @returns {Promise<Object>} Статистика пользователя
 */
export async function getUserStats() {
  try {
    const user = await getCurrentUser()
    if (!user) return getDefaultStats()

    const progress = await getUserProgress()
    
    const totalAnswers = progress.length
    const correctAnswers = progress.filter(p => p.is_correct).length
    const totalTimeSpent = progress.reduce((sum, p) => sum + (p.time_spent || 0), 0)
    const totalHintsUsed = progress.reduce((sum, p) => sum + (p.hints_used || 0), 0)
    
    // Подсчет завершенных глав и разделов
    const completedSections = new Set()
    const completedChapters = new Set()
    
    progress.forEach(p => {
      const sectionKey = `${p.chapter_id}-${p.section_id}`
      completedSections.add(sectionKey)
      completedChapters.add(p.chapter_id)
    })

    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
    const averageTimePerQuestion = totalAnswers > 0 ? Math.round(totalTimeSpent / totalAnswers) : 0

    return {
      totalAnswers,
      correctAnswers,
      accuracy,
      totalTimeSpent,
      totalHintsUsed,
      averageTimePerQuestion,
      completedSections: completedSections.size,
      completedChapters: completedChapters.size,
      level: calculateLevel(accuracy, totalAnswers),
      progress: calculateOverallProgress(completedChapters.size)
    }
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error.message)
    return getDefaultStats()
  }
}

/**
 * Сохранить результат теста
 * @param {Object} testResult - Результат теста
 * @returns {Promise<Object>} Сохраненный результат
 */
export async function saveTestResult(testResult) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Пользователь не авторизован')

    const { data, error } = await supabase
      .from('test_results')
      .insert([
        {
          user_id: user.id,
          test_type: testResult.testType || 'general',
          score: testResult.score,
          total_questions: testResult.totalQuestions,
          correct_answers: testResult.correctAnswers,
          time_spent: testResult.timeSpent,
          section_scores: testResult.sectionScores || {},
          completed_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) throw error

    console.log('✅ Результат теста сохранен')
    return data
  } catch (error) {
    console.error('❌ Ошибка сохранения результата теста:', error.message)
    throw new Error(`Ошибка сохранения результата теста: ${error.message}`)
  }
}

/**
 * Получить результаты тестов пользователя
 * @returns {Promise<Array>} Результаты тестов
 */
export async function getUserTestResults() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Ошибка получения результатов тестов:', error.message)
    return []
  }
}

/**
 * Сохранить результаты прохождения раздела и выдать достижения
 * @param {number} chapterId
 * @param {number} sectionId
 * @param {number} correctAnswers
 * @param {number} totalQuestions
 * @param {number} timeSpent
 * @returns {Promise<Object>} сохраненный результат и список новых достижений
 */
export async function saveTestResults(
  chapterId,
  sectionId,
  correctAnswers,
  totalQuestions,
  timeSpent = 0
) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Пользователь не авторизован')

    const score = Math.round((correctAnswers / totalQuestions) * 100)

    const { data, error } = await supabase
      .from('test_results')
      .insert([
        {
          user_id: user.id,
          test_type: 'section',
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          score: score,
          time_spent: timeSpent,
          completed_at: new Date().toISOString(),
          section_scores: { chapter_id: chapterId, section_id: sectionId, accuracy: score, time: timeSpent }
        }
      ])
      .select()
      .single()

    if (error) throw error

    const achievements = await checkAndAssignAchievements(user.id, sectionId, chapterId, score)

    console.log('✅ Результаты раздела сохранены')
    return { result: data, achievements }
  } catch (error) {
    console.error('❌ Ошибка сохранения результатов раздела:', error.message)
    throw new Error(`Ошибка сохранения результатов: ${error.message}`)
  }
}

/**
 * Получить список достижений пользователя
 * @returns {Promise<Array>}
 */
export async function getUserAchievements() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('❌ Ошибка получения достижений:', error.message)
    return []
  }
}

/**
 * Проверить и назначить достижения после завершения раздела
 * @param {string} userId
 * @param {number} sectionId
 * @param {number} chapterId
 * @param {number} accuracy
 * @returns {Promise<string[]>} список новых достижений
 */
export async function checkAndAssignAchievements(userId, sectionId, chapterId, accuracy) {
  const earned = []

  const hasAchievement = async (type, extraFilter = {}) => {
    let query = supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_type', type)

    if (extraFilter.section_id) {
      query = query.filter('achievement_data->>section_id', 'eq', String(extraFilter.section_id))
    }
    if (extraFilter.chapter_id) {
      query = query.filter('achievement_data->>chapter_id', 'eq', String(extraFilter.chapter_id))
    }

    const { data, error } = await query

    if (error) throw error
    return data && data.length > 0
  }

  const insertAchievement = async (type, data = {}) => {
    const { error } = await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_type: type,
      achievement_data: data,
      earned_at: new Date().toISOString()
    })
    if (!error) earned.push(type)
  }

  try {
    // section_complete
    if (!(await hasAchievement('section_complete', { section_id: sectionId }))) {
      await insertAchievement('section_complete', { section_id: sectionId, chapter_id: chapterId })
    }

    // first_section
    if (!(await hasAchievement('first_section'))) {
      const { count } = await supabase
        .from('user_achievements')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('achievement_type', 'section_complete')
      if ((count || 0) === 0) {
        await insertAchievement('first_section', { section_id: sectionId, chapter_id: chapterId })
      }
    }

    // chapter_master
    const { data: allSections } = await supabase
      .from('sections')
      .select('id')
      .eq('chapter_id', chapterId)

    const { data: completed } = await supabase
      .from('user_progress')
      .select('distinct section_id')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)

    if (
      allSections &&
      completed &&
      allSections.length > 0 &&
      completed.length === allSections.length &&
      !(await hasAchievement('chapter_master', { chapter_id: chapterId }))
    ) {
      await insertAchievement('chapter_master', { chapter_id: chapterId })
    }

    // accuracy_90
    if (accuracy >= 90 && !(await hasAchievement('accuracy_90', { section_id: sectionId }))) {
      await insertAchievement('accuracy_90', { section_id: sectionId, chapter_id: chapterId })
    }

    return earned
  } catch (error) {
    console.error('❌ Ошибка проверки достижений:', error.message)
    return earned
  }
}

/**
 * Сбросить прогресс пользователя
 * @returns {Promise<void>}
 */
export async function resetUserProgress() {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Пользователь не авторизован')

    // Удаляем все ответы пользователя
    const { error: progressError } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', user.id)

    if (progressError) throw progressError

    // Удаляем результаты тестов
    const { error: testsError } = await supabase
      .from('test_results')
      .delete()
      .eq('user_id', user.id)

    if (testsError) throw testsError

    console.log('✅ Прогресс пользователя сброшен')
  } catch (error) {
    console.error('❌ Ошибка сброса прогресса:', error.message)
    throw new Error(`Ошибка сброса прогресса: ${error.message}`)
  }
}

// Вспомогательные функции
function getDefaultStats() {
  return {
    totalAnswers: 0,
    correctAnswers: 0,
    accuracy: 0,
    totalTimeSpent: 0,
    totalHintsUsed: 0,
    averageTimePerQuestion: 0,
    completedSections: 0,
    completedChapters: 0,
    level: 'Начинающий',
    progress: 0
  }
}

function calculateLevel(accuracy, totalAnswers) {
  if (totalAnswers < 10) return 'Начинающий'
  if (accuracy >= 90) return 'Эксперт'
  if (accuracy >= 80) return 'Продвинутый'
  if (accuracy >= 70) return 'Средний'
  if (accuracy >= 60) return 'Ученик'
  return 'Начинающий'
}

function calculateOverallProgress(completedChapters) {
  const totalChapters = 14 // Общее количество глав в курсе
  return Math.round((completedChapters / totalChapters) * 100)
}
