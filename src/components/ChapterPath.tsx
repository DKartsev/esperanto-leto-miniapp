import { useEffect, useState, type FC } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { fetchChapters, fetchSections } from '../services/courseService'
import { useAuth } from './SupabaseAuthProvider'
import useUserProgress from '../hooks/useUserProgress'
import { getChapterTitle } from '../utils/courseTitles'

interface ChapterPathProps {
  onSectionSelect: (chapterId: number, sectionId: number) => void
}

interface SectionInfo {
  id: number
  index: number
  unlocked: boolean
  completed: boolean
  xp: number
}

interface ChapterData {
  id: number
  title: string
  sections: SectionInfo[]
}

const circleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05 } })
}

const ChapterPath: FC<ChapterPathProps> = ({ onSectionSelect }) => {
  const { profile } = useAuth()
  const { sectionProgressMap = {} } = useUserProgress(profile?.id)

  const [chapters, setChapters] = useState<ChapterData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const ch = await fetchChapters()
        const sectionLists = await Promise.all(ch.map(c => fetchSections(c.id)))

        const list: ChapterData[] = ch.map((c, idx) => {
          const secs = sectionLists[idx] as Array<{ id: number }>
          const sections: SectionInfo[] = secs.map((s, sIdx) => {
            const progress = sectionProgressMap[s.id] || { accuracy: 0, completed: false }
            return {
              id: s.id,
              index: sIdx + 1,
              completed: progress.completed || progress.accuracy >= 70,
              unlocked: false,
              xp: 20
            }
          })

          for (let i = 0; i < sections.length; i++) {
            sections[i].unlocked = i === 0 || sections[i - 1].completed
          }

          return { id: c.id, title: c.title || getChapterTitle(c.id), sections }
        })

        setChapters(list)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [sectionProgressMap])

  if (loading) {
    return <p className="p-6 text-gray-500">Загрузка...</p>
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  const circleSize = 96
  const marginY = 48
  const step = circleSize + marginY

  return (
    <div
      className="min-h-screen overflow-y-auto pb-safe px-4 pt-4 space-y-8 max-w-screen-sm mx-auto"
    >
      {chapters.map(ch => {
        const containerHeight = step * (ch.sections.length - 1) + circleSize

        return (
          <div key={ch.id} className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h2 className="text-lg font-semibold text-emerald-900 text-center mb-4">
              {`${ch.id} ${ch.title}`}
            </h2>
            <div className="relative" style={{ height: containerHeight }}>
              {ch.sections.map((sec, idx) => {
                const alignLeft = idx % 2 === 0
                const wrapperClass = clsx(
                  'absolute flex flex-col items-center',
                  alignLeft ? 'left-4' : 'right-4'
                )
                const btnClass = clsx(
                  'w-24 h-24 rounded-full border-2 flex items-center justify-center text-2xl font-bold bg-transparent',
                  sec.completed
                    ? 'border-emerald-600 text-emerald-600'
                    : sec.unlocked
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-gray-300 text-gray-400 opacity-50 pointer-events-none cursor-not-allowed'
                )
                return (
                  <motion.div
                    key={sec.id}
                    className={wrapperClass}
                    style={{ top: idx * step }}
                    variants={circleVariants}
                    initial="hidden"
                    animate="visible"
                    custom={idx}
                  >
                    <button
                      onClick={() => sec.unlocked && onSectionSelect(ch.id, sec.id)}
                      className={btnClass}
                    >
                      {sec.index}
                    </button>
                    {sec.completed && (
                      <span className="mt-1 text-[10px] text-emerald-600">+{sec.xp} XP</span>
                    )}
                  </motion.div>
                )
              })}
              </div>
          </div>
        )
      })}
    </div>
  )
}

export default ChapterPath
