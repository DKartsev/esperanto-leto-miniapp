import { FC } from 'react'

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
  <div className="grid grid-cols-3 gap-2">
    {ACHIEVEMENTS.map(a => {
      const done = completed.includes(a.type)
      return (
        <div
          key={a.type}
          className={`flex flex-col items-center gap-y-1 bg-white rounded-2xl shadow-sm p-4 ${done ? '' : 'opacity-50'}`}
        >
          <span className="text-xl">{a.icon}</span>
          <p className="text-xs text-center text-gray-500">{a.title}</p>
        </div>
      )
    })}
  </div>
)

export default Achievements
