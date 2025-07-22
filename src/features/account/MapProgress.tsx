import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { supabase } from '../../services/supabaseClient'

interface MapItem {
  id: number
  title: string
  completed: boolean
  locked: boolean
}

const MapProgress: FC = () => {
  const navigate = useNavigate()
  const [items, setItems] = useState<MapItem[]>([])

  useEffect(() => {
    const loadData = async () => {
      const userId = localStorage.getItem('user_id')
      const [chaptersRes, progressRes] = await Promise.all([
        supabase.from('chapters').select('id, title').order('id'),
        userId
          ? supabase
              .from('user_chapter_progress')
              .select('chapter_id, completed')
              .eq('user_id', userId)
          : Promise.resolve({ data: [] })
      ])

      if (chaptersRes.error) {
        console.error('Ошибка загрузки глав:', chaptersRes.error.message)
        return
      }
      if ('error' in progressRes && progressRes.error) {
        console.error('Ошибка загрузки прогресса:', progressRes.error.message)
        return
      }

      const progressMap: Record<number, boolean> = {}
      ;(progressRes.data || []).forEach((row: any) => {
        progressMap[row.chapter_id] = row.completed
      })

      const all = chaptersRes.data || []
      const processed: MapItem[] = all.map((ch, idx) => {
        const completed = progressMap[ch.id] || false
        const prevCompleted = idx === 0 || progressMap[all[idx - 1].id]
        return {
          id: ch.id,
          title: ch.title || `Глава ${ch.id}`,
          completed,
          locked: idx !== 0 && !prevCompleted
        }
      })
      setItems(processed)
    }

    loadData()
  }, [])

  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <div key={item.id} className="relative flex flex-col items-center gap-1">
          {index !== 0 && (
            <div className="absolute top-6 -left-1/2 w-full border-t border-gray-300" />
          )}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={item.locked ? undefined : () => navigate(`/chapter/${item.id}`)}
            className={clsx('cursor-pointer', item.locked && 'opacity-50 pointer-events-none')}
          >
            <div
              className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                item.completed ? 'bg-emerald-500' : item.locked ? 'bg-gray-300' : 'bg-blue-400'
              )}
            >
              {index + 1}
            </div>
            <p className="text-xs text-center">{item.title}</p>
          </motion.div>
        </div>
      ))}
    </div>
  )
}

export default MapProgress
