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
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 }
  })
}

interface SectionItemProps {
  chapterId: number
  section: SectionInfo
  index: number
  isLast: boolean
  onSelect: (chapterId: number, sectionId: number) => void
}

const SectionItem: FC<SectionItemProps> = ({
  chapterId,
  section,
  index,
  isLast,
  onSelect
}) => {
  const alignLeft = index % 2 === 0
  const wrapperClass = clsx(
    'relative flex flex-col items-center mt-12',
    alignLeft ? 'self-start' : 'self-end'
  )
  const btnClass = clsx(
    'w-24 h-24 rounded-full border-2 flex items-center justify-center text-3xl font-bold bg-transparent transition-transform hover:scale-105',
    section.completed || section.unlocked
      ? 'border-emerald-600 text-emerald-600'
      : 'border-gray-300 text-gray-400 opacity-50 pointer-events-none cursor-not-allowed'
  )
  const gradId = `grad-${section.id}`
  return (
    <motion.div
      data-testid="section-item"
      className={wrapperClass}
      variants={circleVariants}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <button
        onClick={() => onSelect(chapterId, section.id)}
        className={btnClass}
      >
        {section.index}
      </button>
      {section.completed && (
        <span className="mt-1 text-[10px] text-emerald-600">+{section.xp} XP</span>
      )}
      {!isLast && (
        <svg
          className="absolute top-full left-1/2 -translate-x-1/2 w-1 h-12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <line
            x1="0.5"
            y1="0"
            x2="0.5"
            y2="48"
            stroke={`url(#${gradId})`}
            strokeWidth="2"
          />
        </svg>
      )}
    </motion.div>
  )
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

  const listItems = chapters.flatMap((c, cIdx) => [
    { type: 'chapter' as const, chapter: c, chapterIndex: cIdx },
    ...c.sections.map((s, sIdx) => ({
      type: 'section' as const,
      chapter: c,
      section: s,
      sectionIndex: sIdx
    }))
  ])

  return (
    <div className="min-h-screen overflow-y-auto pb-safe pt-4 space-y-8 max-w-screen-sm mx-auto pl-4 pr-4">
      <div className="relative flex flex-col items-center">
        <svg
          className="absolute inset-0 pointer-events-none w-full h-full -z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="route-grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="url(#route-grad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </svg>
        {listItems.map(item =>
          item.type === 'chapter' ? (
            <h2
              key={`chapter-${item.chapter.id}`}
              className="text-lg font-semibold text-emerald-900 text-center mb-4 w-full"
            >
              {`${item.chapter.id} ${item.chapter.title}`}
            </h2>
          ) : (
            <SectionItem
              key={`section-${item.section.id}`}
              chapterId={item.chapter.id}
              section={item.section}
              index={item.sectionIndex}
              isLast={item.sectionIndex === item.chapter.sections.length - 1}
              onSelect={onSectionSelect}
            />
          )
        )}
      </div>
    </div>
  )
}

export default ChapterPath
