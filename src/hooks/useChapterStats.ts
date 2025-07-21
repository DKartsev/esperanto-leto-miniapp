import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { findOrCreateUserProfile } from '../services/authService'

export interface ChapterStats {
  totalTime: number
  averageAccuracy: number
  completedChapters: number
  totalChapters: number
  progress: number
}

export const useChapterStats = (userId?: string | null) => {
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const [stats, setStats] = useState<ChapterStats | null>(null)

  useEffect(() => {
    const resolve = async () => {
      if (!userId) {
        setResolvedId(null)
        return
      }
      if (/^\d+$/.test(String(userId))) {
        const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null
        const uuid = await findOrCreateUserProfile(String(userId), username)
        setResolvedId(uuid)
      } else {
        setResolvedId(userId)
      }
    }
    void resolve()
  }, [resolvedId])

  useEffect(() => {
    const load = async () => {
      if (!resolvedId) return

      const { data: chapters, error } = await supabase
        .from('user_chapter_progress')
        .select('average_accuracy, total_time, completed')
        .eq('user_id', resolvedId)

      if (error) {
        console.error('Ошибка загрузки прогресса глав:', error)
        return
      }

      let totalTime = 0
      let averageAccuracy = 0
      let completedChapters = 0

      if (chapters && chapters.length > 0) {
        totalTime = chapters.reduce((sum, row) => sum + row.total_time, 0)
        averageAccuracy = Math.round(
          chapters.reduce((sum, row) => sum + row.average_accuracy, 0) /
            chapters.length
        )
        completedChapters = chapters.filter(row => row.completed).length
      }

      const { count: totalChapters, error: chaptersError } = await supabase
        .from('chapters')
        .select('id', { count: 'exact', head: true })

      if (chaptersError) {
        console.error('Ошибка получения количества глав:', chaptersError)
      }

      const totalCh = totalChapters ?? 0
      const progress = totalCh ? Math.round((completedChapters / totalCh) * 100) : 0

      setStats({
        totalTime: Math.round(totalTime / 60),
        averageAccuracy,
        completedChapters,
        totalChapters: totalCh,
        progress
      })
    }

    load()
  }, [resolvedId])

  return stats
}

export default useChapterStats
