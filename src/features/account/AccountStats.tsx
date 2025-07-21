import { FC } from 'react'
import { Calendar, Trophy, TrendingUp, CheckCircle } from 'lucide-react'
import ProgressBar from '../../components/ui/ProgressBar'

interface AccountStatsProps {
  averageAccuracy: number
  progress: number
  completedChapters: number
  totalChapters: number
  startDate: string | null
}

const AccountStats: FC<AccountStatsProps> = ({ startDate, averageAccuracy, progress, completedChapters, totalChapters }) => (
  <div className="mt-2 bg-neutral-100 rounded p-2 text-sm text-gray-600 space-y-1">
    <div className="flex items-center">
      <Trophy className="w-4 h-4 mr-1" />
      <span>Средняя точность: {averageAccuracy}%</span>
    </div>
    <div className="flex items-center">
      <TrendingUp className="w-4 h-4 mr-1" />
      <span>Общий прогресс: {progress}%</span>
    </div>
    <div className="flex items-center">
      <CheckCircle className="w-4 h-4 mr-1" />
      <span>Пройдено глав: {completedChapters} из {totalChapters}</span>
    </div>
    <div className="flex items-center">
      <Calendar className="w-4 h-4 mr-1" />
      <span>Дата начала: {startDate ? new Date(startDate).toLocaleDateString('ru-RU') : '-'}</span>
    </div>
    <ProgressBar percent={progress} />
  </div>
)

export default AccountStats
