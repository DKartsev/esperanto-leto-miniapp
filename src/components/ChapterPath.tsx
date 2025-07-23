import { useEffect, useState, type FC } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { fetchChapters, fetchSections } from '../services/courseService'
import { useAuth } from './SupabaseAuthProvider'
import useUserProgress from '../hooks/useUserProgress'
import ZigZagPath from './ui/ZigZagPath'
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

  const width = 100
  const step = 80
  const radius = 28
  const offset = 10
  const leftX = radius + offset
  const rightX = width - radius - offset
  const controlX = width / 2

  const getPoint = (idx: number) => ({
    x: idx % 2 === 0 ? leftX : rightX,
    y: idx * step + radius
  })

  return (
    <div className="min-h-screen overflow-y-auto pb-safe px-4 pt-4 space-y-8 max-w-screen-sm mx-auto">
      {chapters.map(ch => {
        const completedCount = ch.sections.filter(s => s.completed).length
        const paths = ch.sections.slice(0, -1).map((_, idx) => {
          const start = getPoint(idx)
          const end = getPoint(idx + 1)
          const midY = (start.y + end.y) / 2
          return `M${start.x},${start.y} Q${controlX},${midY} ${end.x},${end.y}`
        })
        const svgHeight = Math.max(step * (ch.sections.length - 1) + radius * 2, 0)

        return (
          <div key={ch.id} className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <h2 className="text-lg font-semibold text-emerald-900 text-center mb-4">
              {`${ch.id} (${completedCount}/${ch.sections.length}) ${ch.title}`}
            </h2>
            <div className="relative">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${width} ${svgHeight}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {paths.map((d, i) => (
                  <ZigZagPath key={i} d={d} index={i} />
                ))}
              </svg>
              <div className="flex flex-col items-center gap-y-6 relative w-full">
                {ch.sections.map((sec, idx) => {
                  const alignLeft = idx % 2 === 0
                  const wrapper = clsx('px-6 w-full flex', alignLeft ? 'justify-end' : 'justify-start')
                  const btnClass = clsx(
                    'w-14 h-14 rounded-full border flex items-center justify-center text-base font-medium',
                    sec.completed
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : sec.unlocked
                        ? 'bg-white text-emerald-600 border-emerald-600'
                        : 'bg-gray-200 text-gray-400 border-gray-300 opacity-50 pointer-events-none'
                  )
                  return (
                    <motion.div
                      key={sec.id}
                      className={clsx('flex flex-col items-center', wrapper)}
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
          </div>
        )
      })}
    </div>
  )
}

export default ChapterPath
