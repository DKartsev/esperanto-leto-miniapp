import { FC } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import ZigZagPath from './ui/ZigZagPath'
import { getChapterTitle } from '../utils/courseTitles'

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

const circleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05 } })
}


const SectionsList: FC<SectionsListProps> = ({ chapterId, sections, onSectionSelect }) => {
  const title = getChapterTitle(chapterId)
  const completedCount = sections.filter(s => s.completed).length

  const width = 100
  const step = 80
  const radius = 28
  const offset = 10
  const leftX = radius + offset
  const rightX = width - radius - offset
  
  const getPoint = (idx: number) => ({
    x: idx % 2 === 0 ? leftX : rightX,
    y: idx * step + radius
  })

  const controlX = width / 2

  const paths = sections.slice(0, -1).map((_, idx) => {
    const start = getPoint(idx)
    const end = getPoint(idx + 1)
    const midY = (start.y + end.y) / 2
    return `M${start.x},${start.y} Q${controlX},${midY} ${end.x},${end.y}`
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
        <div className="flex flex-col items-center gap-y-6 relative w-full">
          {sections.map((sec, idx) => {
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
