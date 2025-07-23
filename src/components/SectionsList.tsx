import { FC } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import ZigZagPath from './ui/ZigZagPath'

interface SectionInfo {
  id: number
  index: number
  unlocked: boolean
  completed: boolean
  xp: number
}

interface SectionsListProps {
  chapterId: number
  sections: SectionInfo[]
  onSectionSelect: (sectionId: number) => void
}

const getChapterTitle = (chapterId: number): string => {
  switch (chapterId) {
    case 1:
      return 'Основы эсперанто'
    case 2:
      return 'Основные глаголы и действия'
    case 3:
      return 'Грамматика'
    case 4:
      return 'Словарный запас'
    case 5:
      return 'Произношение'
    case 6:
      return 'Диалоги'
    case 7:
      return 'Культура'
    case 8:
      return 'Литература'
    case 9:
      return 'История языка'
    case 10:
      return 'Практические упражнения'
    case 11:
      return 'Итоговый тест'
    default:
      return `Глава ${chapterId}`
  }
}

const circleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05 } })
}


const SectionsList: FC<SectionsListProps> = ({ chapterId, sections, onSectionSelect }) => {
  const title = getChapterTitle(chapterId)
  const completedCount = sections.filter(s => s.completed).length

  const width = 100
  const step = 90
  const radius = 24
  const offset = 10
  const leftX = radius + offset
  const rightX = width - radius - offset

  const getPoint = (idx: number) => ({
    x: idx % 2 === 0 ? leftX : rightX,
    y: idx * step + radius
  })

  const paths = sections.slice(0, -1).map((_, idx) => {
    const start = getPoint(idx)
    const end = getPoint(idx + 1)
    const controlX = width / 2
    const controlY = (start.y + end.y) / 2
    return `M${start.x},${start.y} Q${controlX},${controlY} ${end.x},${end.y}`
  })

  const svgHeight = Math.max(step * (sections.length - 1) + radius * 2, 0)

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      <h2 className="text-lg font-semibold text-emerald-900 text-center mb-4">
        {`${chapterId} (${completedCount}/${sections.length}) ${title}`}
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
        <div className="flex flex-col items-center gap-y-8 relative">
          {sections.map((sec, idx) => {
            const alignLeft = idx % 2 === 0
            const wrapper = alignLeft ? 'self-start pl-6' : 'self-end pr-6'
            const btnClass = clsx(
              'w-12 h-12 rounded-full border flex items-center justify-center text-sm font-medium',
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
                <button onClick={() => sec.unlocked && onSectionSelect(sec.id)} className={btnClass}>
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
}

export default SectionsList
