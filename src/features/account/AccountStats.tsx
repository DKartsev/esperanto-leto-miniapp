import { FC } from 'react'
import { Clock, Trophy, TrendingUp, CheckCircle } from 'lucide-react'
import ProgressBar from '../../components/ui/ProgressBar'

interface AccountStatsProps {
  totalTime: number
  averageAccuracy: number
  progress: number
  completedChapters: number
  totalChapters: number
}

const AccountStats: FC<AccountStatsProps> = ({ totalTime, averageAccuracy, progress, completedChapters, totalChapters }) => (
  <div className="mt-2 bg-neutral-100 rounded p-2 text-sm text-gray-600 space-y-1">
    <div className="flex items-center">
      <Clock className="w-4 h-4 mr-1" />
      <span>Время обучения: {totalTime}м</span>
    </div>
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
    <ProgressBar percent={progress} />
  </div>
)

export default AccountStats
