import { FC } from 'react'
import { Clock, Target, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

interface AccountStatsProps {
  averageAccuracy: number
  progress: number
  completedChapters: number
  totalChapters: number
  startDate: string | null
  totalTime: number
}
const AccountStats: FC<AccountStatsProps> = ({
  totalTime,
  averageAccuracy,
  completedChapters,
  totalChapters
}) => {
  const stats = [
    { label: 'Время', value: `${Math.round(totalTime / 60)} мин`, Icon: Clock },
    { label: 'Точность', value: `${averageAccuracy}%`, Icon: Target },
    { label: 'Главы', value: `${completedChapters}/${totalChapters}`, Icon: BookOpen }
  ]

  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {stats.map(({ label, value, Icon }) => (
        <motion.div
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-y-1 bg-white rounded-2xl shadow-sm p-4"
        >
          <Icon className="w-5 h-5 text-emerald-600" />
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-base font-semibold text-gray-900">{value}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default AccountStats
