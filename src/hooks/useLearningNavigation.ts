import { useState } from 'react'
import { useAuth } from '../components/SupabaseAuthProvider'
import { findOrCreateUserProfile } from '../services/authService'
import { supabase } from '../services/supabaseClient'
import { saveTestResults } from '../services/progressService'
import type { QuestionResults } from '../components/QuestionInterface'

export type LearningView =
  | 'chapters'
  | 'sections'
  | 'questions'
  | 'section-complete'
  | 'chapter-complete'

export function useLearningNavigation() {
  const [currentView, setCurrentView] = useState<LearningView>('chapters')
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [sectionResults, setSectionResults] = useState<QuestionResults | null>(null)
  const [sectionStartTime, setSectionStartTime] = useState<number | null>(null)

  const { profile, refreshStats } = useAuth()

  const saveProgressToSupabase = async (
    chapterId: number,
    sectionId: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpent: number
  ) => {
    let userId: string | null | number | undefined =
      localStorage.getItem('user_id') || (profile as any)?.id
    if (userId && /^\d+$/.test(String(userId))) {
      const telegramId = String(userId)
      const newId = await findOrCreateUserProfile(
        telegramId,
        window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null
      )
      if (!newId) {
        console.error('Не удалось создать профиль через RPC')
        return
      }
      userId = newId
    }
    if (!userId || /^\d+$/.test(String(userId))) {
      return
    }

    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    const completed = accuracy >= 70

    const upsertData = {
      user_id: userId,
      chapter_id: chapterId,
      section_id: sectionId,
      completed,
      accuracy,
      time_spent: timeSpent
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(upsertData, { onConflict: 'user_id, section_id' })

    if (error) {
      console.error('Ошибка при сохранении прогресса:', error.message)
    }
  }

  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId)
    setCurrentView('sections')
  }

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSection(sectionId)
    setSectionStartTime(Date.now())
    setCurrentView('questions')
  }

  const handleQuestionComplete = async (results: QuestionResults) => {
    setSectionResults(results)
    if (selectedChapter && selectedSection) {
      try {
        const timeSpent = sectionStartTime ? Math.round((Date.now() - sectionStartTime) / 1000) : 0
        await saveProgressToSupabase(
          selectedChapter,
          selectedSection,
          results.correctAnswers,
          results.totalQuestions,
          timeSpent
        )
        await saveTestResults(
          selectedChapter,
          selectedSection,
          results.correctAnswers,
          results.totalQuestions,
          timeSpent
        )
        await refreshStats()
      } catch (err) {
        console.error('Ошибка сохранения результатов раздела:', err)
      }
    }
    setSectionStartTime(null)
    setCurrentView('section-complete')
  }

  const handleNextChapter = () => {
    if (selectedChapter) {
      setSelectedChapter(selectedChapter + 1)
      setCurrentView('sections')
    }
  }

  const handleBackToChapters = () => {
    setCurrentView('chapters')
    setSelectedChapter(null)
    setSelectedSection(null)
    setSectionResults(null)
  }

  const handleBackToSections = () => {
    setCurrentView('sections')
    setSelectedSection(null)
  }

  const handleRetrySection = () => {
    setSectionResults(null)
    setSectionStartTime(Date.now())
    setCurrentView('questions')
  }

  const handleNextStep = (nextSectionId?: string, nextChapterId?: string) => {
    setSectionResults(null)
    setSectionStartTime(null)
    if (nextSectionId) {
      setSelectedSection(parseInt(nextSectionId))
      setCurrentView('questions')
    } else if (nextChapterId) {
      setSelectedChapter(parseInt(nextChapterId))
      setSelectedSection(null)
      setCurrentView('sections')
    } else {
      setCurrentView('chapters')
    }
  }

  return {
    currentView,
    selectedChapter,
    selectedSection,
    sectionResults,
    profile,
    handleChapterSelect,
    handleSectionSelect,
    handleQuestionComplete,
    handleNextChapter,
    handleBackToChapters,
    handleBackToSections,
    handleRetrySection,
    handleNextStep
  }
}
