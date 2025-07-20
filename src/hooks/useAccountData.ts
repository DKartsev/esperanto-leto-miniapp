import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient.js'

export interface ChapterStat {
  chapterId: number
  title: string
  percent: number
}

export function useAccountData(userId?: string | null) {
  const [progress, setProgress] = useState<ChapterStat[]>([])

  useEffect(() => {
    const load = async () => {
      if (!userId) return
      const { data: chapters } = await supabase.from('chapters').select('id, title')
      if (!chapters) return
      const { data: completed } = await supabase
        .from('user_progress')
        .select('chapter_id, section_id, completed')
        .eq('user_id', userId)
        .eq('completed', true)
      if (!completed) return
      const result = chapters.map((ch: any) => {
        const sections = completed.filter(c => c.chapter_id === ch.id)
        const percent = sections.length ? 100 : 0
        return { chapterId: ch.id, title: ch.title, percent }
      })
      setProgress(result)
    }
    load()
  }, [userId])

  return { progress }
}
