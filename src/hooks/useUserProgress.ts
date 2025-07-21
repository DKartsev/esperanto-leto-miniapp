import { useState, useEffect } from 'react'
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
  const [progressLoading, setProgressLoading] = useState(true)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [completedChapters, setCompletedChapters] = useState(0)
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0)
  const [averageAccuracy, setAverageAccuracy] = useState(0)
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress[]>([])
  const [recommendedChapter, setRecommendedChapter] = useState<{chapterId:number; title:string} | null>(null)
  const [progressData, setProgressData] = useState<any[]>([])
  const [sectionProgressMap, setSectionProgressMap] = useState<Record<number, { accuracy: number; completed: boolean }>>({})

  useEffect(() => {
    const resolve = async () => {
      if (!userId) {
        setResolvedId(null)
        return
      }
      if (/^\d+$/.test(String(userId))) {
        const tgUser = getTelegramUser()
        const username = tgUser?.username || null
        const uuid = await findOrCreateUserProfile(String(userId), username)
        setResolvedId(uuid)
      } else {
        setResolvedId(userId)
      }
    }
    void resolve()
  }, [userId])

  useEffect(() => {
    const fetchStart = async () => {
      if (!resolvedId) return
      const { data, error } = await supabase
        .from('user_progress')
        .select('answered_at')
        .eq('user_id', resolvedId)
        .order('answered_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!error) {
        setStartDate(data?.answered_at ?? null)
      }
    }
    fetchStart()
  }, [resolvedId])

  useEffect(() => {
    const fetchActualProgress = async () => {
      setProgressLoading(true)
      if (!resolvedId) {
        setProgressLoading(false)
        return
      }

      console.log('📊 Запрос расчета прогресса для', resolvedId)
      const { data: progress, error } = await supabase
        .from('user_progress')
        .select('chapter_id, section_id, is_correct, time_spent, answered_at')
        .eq('user_id', resolvedId)

      if (error) {
        console.log('❌ Ошибка загрузки прогресса:', error)
      }
      if (progress) {
        console.log('📥 Получены данные для расчета:', progress)
        if (progress.length === 0) {
          console.log('❗ Прогресс не найден')
        }
      }

      if (error || !progress) {
        if (error) console.error('Ошибка загрузки прогресса:', error)
        setProgressLoading(false)
        return
      }

      let correctAnswers = 0
      const sectionMap = new Map<string, { correct: number; total: number; chapter: number }>()
      let firstDate: Date | null = null

      progress.forEach((row: any) => {
        if (row.is_correct) correctAnswers += 1

        const key = `${row.chapter_id}-${row.section_id}`
        if (!sectionMap.has(key)) {
          sectionMap.set(key, { correct: 0, total: 0, chapter: row.chapter_id })
        }
        const stat = sectionMap.get(key)!
        stat.total += 1
        if (row.is_correct) stat.correct += 1

        if (row.answered_at) {
          const d = new Date(row.answered_at)
          if (!firstDate || d < firstDate) firstDate = d
        }
      })

      const avgAccuracy = progress.length
        ? Math.round((correctAnswers / progress.length) * 100)
        : 0

      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('id, chapter_id')

      if (sectionsError) {
        console.error('Ошибка загрузки списка разделов:', sectionsError)
        setProgressLoading(false)
        return
      }

      const sectionsPerChapter = new Map<number, number>()
      sections?.forEach((s: any) => {
        sectionsPerChapter.set(
          s.chapter_id,
          (sectionsPerChapter.get(s.chapter_id) || 0) + 1
        )
      })

      const chapterAcc: Record<number, number[]> = {}
      sectionMap.forEach(val => {
        const acc = val.total ? val.correct / val.total : 0
        if (!chapterAcc[val.chapter]) chapterAcc[val.chapter] = []
        chapterAcc[val.chapter].push(acc)
      })

      let completed = 0
      for (const [chapterId, total] of sectionsPerChapter) {
        const arr = chapterAcc[chapterId] || []
        if (arr.length === total && arr.every(a => a >= 0.7)) {
          completed += 1
        }
      }

      setCompletedChapters(completed)
      setAverageAccuracy(avgAccuracy)
      setStartDate(firstDate ? (firstDate as Date).toISOString() : null)
      setProgressLoading(false)
    }

    fetchActualProgress()
  }, [resolvedId])

  useEffect(() => {
    const fetchProgress = async () => {
      if (!resolvedId) return
      console.log('🔄 Запрос прогресса для userId:', resolvedId)
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', resolvedId)
      if (error) {
        console.log('❌ Ошибка загрузки прогресса:', error)
      }
      if (data) {
        console.log('📥 Результат user_progress:', data)
        if (data.length === 0) {
          console.log('❗ Прогресс не найден')
        }
        setProgressData(data as any[])
        const totalTime = data.reduce(
          (sum: number, p: any) => sum + (p.time_spent || 0),
          0
        )
        setTotalStudyMinutes(Math.floor(totalTime / 60))
      }
    }
    fetchProgress()
  }, [resolvedId])

  useEffect(() => {
    const map: Record<number, { accuracy: number; completed: boolean }> = {}
    progressData.forEach((row: any) => {
      if (row.section_id && !row.question_id) {
        map[row.section_id] = {
          accuracy: row.accuracy ?? 0,
          completed: row.completed ?? false
        }
      }
    })
    setSectionProgressMap(map)
  }, [progressData])

  useEffect(() => {
    if (progressData.length > 0) {
      const totalTime = progressData.reduce(
        (sum: number, p: any) => sum + (p.time_spent || 0),
        0
      )
      setTotalStudyMinutes(Math.floor(totalTime / 60))
    }
  }, [progressData])

  useEffect(() => {
    const fetchChapterProgress = async () => {
      if (!resolvedId) return

      const { data: chapters } = await supabase
        .from('chapters')
        .select('id, title')

      const { data: sections } = await supabase
        .from('sections')
        .select('id, chapter_id')

      if (!chapters) return

      const { data: completed } = await supabase
        .from('user_progress')
        .select('chapter_id, section_id')
        .eq('user_id', resolvedId)
        .eq('completed', true)

      const sectionsByChapter = new Map<number, number>()
      sections?.forEach((s: any) => {
        sectionsByChapter.set(
          s.chapter_id,
          (sectionsByChapter.get(s.chapter_id) || 0) + 1
        )
      })

      const completedMap: Record<number, Set<number>> = {}
      completed?.forEach((c: any) => {
        if (!completedMap[c.chapter_id]) {
          completedMap[c.chapter_id] = new Set()
        }
        completedMap[c.chapter_id].add(c.section_id)
      })

      const result = chapters.map((ch: any) => {
        const total = sectionsByChapter.get(ch.id) || 0
        const done = completedMap[ch.id]?.size || 0
        const percent = total ? Math.round((done / total) * 100) : 0
        return {
          chapterId: ch.id,
          title: ch.title,
          totalSections: total,
          completedSections: done,
          percent
        }
      })

      setChapterProgress(result)
    }

    fetchChapterProgress()
  }, [resolvedId])

  useEffect(() => {
    if (chapterProgress && chapterProgress.length > 0) {
      const next = chapterProgress.find(cp => cp.percent < 100)
      setRecommendedChapter(
        next ? { chapterId: next.chapterId, title: next.title } : null
      )
    }
  }, [chapterProgress])

  return {
    progressLoading,
    startDate,
    completedChapters,
    totalStudyMinutes,
    averageAccuracy,
    chapterProgress,
    recommendedChapter,
    progressData,
    sectionProgressMap
  }
}

export default useUserProgress
