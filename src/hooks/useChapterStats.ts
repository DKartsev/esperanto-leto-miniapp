import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabaseClient'
import { findOrCreateUserProfile } from '../services/authService'
import { getTelegramUser } from '../utils/telegram'

export interface ChapterStats {
  totalTime: number
  averageAccuracy: number
  completedChapters: number
  totalChapters: number
  progress: number
}

export interface UseChapterStatsResult {
  data: ChapterStats | null
  isLoading: boolean
  isError: boolean
}

export const useChapterStats = (userId: string | null): UseChapterStatsResult => {
  const query = useQuery<ChapterStats>({
    queryKey: ['chapter-stats', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('userId is required')
      }
      let resolvedId = userId
      if (/^\d+$/.test(String(userId))) {
        const tgUser = getTelegramUser()
        resolvedId = await findOrCreateUserProfile(
          String(userId),
          tgUser?.username || null,
          tgUser?.first_name || null,
          tgUser?.last_name || null
        )
      }

      const { data: chapters, error } = await supabase
        .from('user_chapter_progress')
        .select('average_accuracy, total_time, completed')
        .eq('user_id', resolvedId)

      if (error) throw error

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

      if (chaptersError) throw chaptersError

      const totalCh = totalChapters ?? 0
      const progress = totalCh ? Math.round((completedChapters / totalCh) * 100) : 0

      return {
        totalTime: Math.round(totalTime / 60),
        averageAccuracy,
        completedChapters,
        totalChapters: totalCh,
        progress
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError
  }
}

export default useChapterStats
