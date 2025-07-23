import { FC } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export interface Achievement {
  title: string
  icon: string
  condition: string
  type: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { title: 'Перфекционист', icon: '✅', condition: '100% точность в главе', type: 'accuracy_90' },
  { title: 'Быстрый старт', icon: '🚀', condition: 'Пройден 1 раздел', type: 'first_section' },
  { title: 'Устойчивость', icon: '⏳', condition: '30+ мин обучения', type: 'time_30' }
]

interface AchievementsProps {
  completed?: string[]
}

const Achievements: FC<AchievementsProps> = ({ completed = [] }) => (
  <div className="grid grid-cols-2 gap-3 mt-6">
    {ACHIEVEMENTS.map((a, i) => {
      const unlocked = completed.includes(a.type)
      return (
        <motion.div
          key={a.type}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={clsx(
            'p-3 rounded-xl border text-sm transition',
            unlocked
              ? 'bg-white text-emerald-700 border-emerald-300 shadow-sm'
              : 'bg-gray-100 text-gray-400 border-gray-200'
          )}
        >
          <p className="font-semibold">{a.title}</p>
          <p className="text-xs">{a.condition}</p>
        </motion.div>
      )
    })}
  </div>
)

export default Achievements
