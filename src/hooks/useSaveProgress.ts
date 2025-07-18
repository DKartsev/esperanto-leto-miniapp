import { useState, useEffect } from 'react'
import { saveAnswer, getSectionProgress } from '../services/progressService.js'

export interface ProgressRecord {
  id: string
  user_id: string
  chapter_id: number
  section_id: number
  question_id: number
  is_correct: boolean
  answered_at: string
  selected_answer: string
  time_spent: number
}

export default function useSaveProgress(chapterId: number, sectionId: number) {
  const [progress, setProgress] = useState<ProgressRecord[]>([])

  useEffect(() => {
    const load = async () => {
      if (!chapterId || !sectionId) return
      try {
        const data = await getSectionProgress(chapterId, sectionId)
        setProgress(data as ProgressRecord[])
      } catch (err) {
        console.error('Failed to load progress', err)
      }
    }
    load()
  }, [chapterId, sectionId])

  const saveProgress = async (
    questionId: number,
    isCorrect: boolean,
    selectedAnswer: string,
    timeSpent = 0
  ) => {
    try {
      const record = await saveAnswer(
        chapterId,
        sectionId,
        questionId,
        isCorrect,
        selectedAnswer,
        timeSpent
      )
      if (record) {
        setProgress(prev => {
          const idx = prev.findIndex(p => p.question_id === questionId)
          if (idx !== -1) {
            const updated = [...prev]
            updated[idx] = record
            return updated
          }
          return [...prev, record]
        })
      }
      return record
    } catch (err) {
      console.error('Failed to save progress', err)
      throw err
    }
  }

  return { progress, saveProgress }
}
