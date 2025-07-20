import { FC } from 'react'
import { BookOpen, Clock, Trophy } from 'lucide-react'
import ProgressCard from '../ui/ProgressCard'
import { formatMinutes } from '../../utils/formatTime'

interface SummaryCardsProps {
  stats?: {
    completedChapters: number
    totalTimeSpent: number
    accuracy: number
  }
  startDate: string | null
}

const SummaryCards: FC<SummaryCardsProps> = ({ stats, startDate }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <ProgressCard
      icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
      value={stats?.completedChapters || 0}
      label="Глав завершено"
    />
    <ProgressCard
      icon={<Clock className="w-6 h-6 text-green-600" />}
      value={formatMinutes(Math.round(stats?.totalTimeSpent || 0))}
      label="Время изучения"
    />
    <ProgressCard
      icon={<Trophy className="w-6 h-6 text-yellow-600" />}
      value={`${stats?.accuracy || 0}%`}
      label="Точность ответов"
    />
    <ProgressCard
      icon={<Clock className="w-6 h-6 text-blue-600" />}
      value={startDate ? new Date(startDate).toLocaleDateString('ru-RU') : '-'}
      label="Дата начала"
    />
  </div>
)

export default SummaryCards
