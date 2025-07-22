import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'
import { findOrCreateUserProfile } from '../services/authService'
import { getTelegramUser } from '../utils/telegram'

export interface ChapterProgress {
  chapterId: number
  title: string
  totalSections: number
  completedSections: number
  percent: number
}

export const useUserProgress = (userId?: string | null) => {
  const [resolvedId, setResolvedId] = useState<string | null>(null)

  useEffect(() => {
    const resolve = async () => {
      if (!userId) {
        setResolvedId(null)
        return
      }
      if (/^\d+$/.test(String(userId))) {
        const tgUser = getTelegramUser()
        const uuid = await findOrCreateUserProfile(
          String(userId),
          tgUser?.username || null,
          tgUser?.first_name || null,
          tgUser?.last_name || null
        )
        setResolvedId(uuid)
      } else {
        setResolvedId(userId)
      }
    }
    void resolve()
  }, [userId])

  const { data, isLoading } = useQuery(
    ['user-progress', resolvedId],
    async () => {
      if (!resolvedId) return null
      const [progressRes, chaptersRes] = await Promise.all([
        supabase
          .from('user_progress')
          .select(
            'chapter_id, section_id, question_id, is_correct, time_spent, answered_at, completed, accuracy'
          )
          .eq('user_id', resolvedId),
        supabase.from('chapters').select('id, title, sections(id)')
      ])

      if (progressRes.error) throw progressRes.error
      if (chaptersRes.error) throw chaptersRes.error

      const progress = progressRes.data || []
      const chapters = chaptersRes.data || []

      let firstDate: Date | null = null
      let correctAnswers = 0
      const completedPerChapter: Record<number, Set<number>> = {}
      const sectionProgressMap: Record<number, { accuracy: number; completed: boolean }> = {}

      progress.forEach(row => {
        if (row.is_correct) correctAnswers += 1
        if (row.answered_at) {
          const d = new Date(row.answered_at as string)
          if (!firstDate || d < firstDate) firstDate = d
        }
        if (row.section_id && !row.question_id) {
          sectionProgressMap[row.section_id] = {
            accuracy: row.accuracy ?? 0,
            completed: row.completed ?? false
          }
        }
        if (row.completed) {
          if (!completedPerChapter[row.chapter_id]) {
            completedPerChapter[row.chapter_id] = new Set()
          }
          completedPerChapter[row.chapter_id].add(row.section_id)
        }
      })

      const sectionsByChapter = new Map<number, number>()
      chapters.forEach(ch => {
        sectionsByChapter.set(ch.id, ch.sections ? ch.sections.length : 0)
      })

      const chapterProgress: ChapterProgress[] = chapters.map(ch => {
        const total = sectionsByChapter.get(ch.id) || 0
        const done = completedPerChapter[ch.id]?.size || 0
        const percent = total ? Math.round((done / total) * 100) : 0
        return {
          chapterId: ch.id,
          title: ch.title,
          totalSections: total,
          completedSections: done,
          percent
        }
      })

      const completedChapters = chapterProgress.filter(c => c.percent === 100).length
      const recommended = chapterProgress.find(c => c.percent < 100)
      const totalTime = progress.reduce((sum, p) => sum + (p.time_spent || 0), 0)
      const avgAccuracy = progress.length ? Math.round((correctAnswers / progress.length) * 100) : 0

      return {
        startDate: firstDate ? firstDate.toISOString() : null,
        completedChapters,
        totalStudyMinutes: Math.floor(totalTime / 60),
        averageAccuracy: avgAccuracy,
        chapterProgress,
        recommendedChapter: recommended
          ? { chapterId: recommended.chapterId, title: recommended.title }
          : null,
        progressData: progress,
        sectionProgressMap
      }
    },
    { enabled: !!resolvedId, staleTime: 60 * 1000 }
  )

  return {
    progressLoading: isLoading,
    ...(data || {
      startDate: null,
      completedChapters: 0,
      totalStudyMinutes: 0,
      averageAccuracy: 0,
      chapterProgress: [] as ChapterProgress[],
      recommendedChapter: null as { chapterId: number; title: string } | null,
      progressData: [] as any[],
      sectionProgressMap: {} as Record<number, { accuracy: number; completed: boolean }>
    })
  }
}

export default useUserProgress
