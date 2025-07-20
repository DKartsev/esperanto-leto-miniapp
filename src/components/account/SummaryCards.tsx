import { FC } from 'react'
import { BookOpen, CheckCircle, Clock, Target, Calendar } from 'lucide-react'
import Card from '../ui/Card'
import { formatHoursMinutes } from '../../utils/formatTime'

interface SummaryCardsProps {
  completedChapters: number
  totalChapters: number
  completedSections: number
  totalSections: number
  totalTimeMinutes: number
  averageAccuracy: number
  startDate: string | null
}

const SummaryCards: FC<SummaryCardsProps> = ({
  completedChapters,
  totalChapters,
  completedSections,
  totalSections,
  totalTimeMinutes,
  averageAccuracy,
  startDate
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-6 h-6" />
        <span className="font-medium">Пройдено глав</span>
      </div>
      <div className="text-2xl font-bold mt-2">
        {completedChapters} / {totalChapters}
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-6 h-6" />
        <span className="font-medium">Пройдено разделов</span>
      </div>
      <div className="text-2xl font-bold mt-2">
        {completedSections} / {totalSections}
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6" />
        <span className="font-medium">Общее время</span>
      </div>
      <div className="text-2xl font-bold mt-2">
        {formatHoursMinutes(totalTimeMinutes)}
      </div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Target className="w-6 h-6" />
        <span className="font-medium">Средняя точность</span>
      </div>
      <div className="text-2xl font-bold mt-2">{averageAccuracy}%</div>
    </Card>
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        <span className="font-medium">Дата начала</span>
      </div>
      <div className="text-2xl font-bold mt-2">
        {startDate ? new Date(startDate).toLocaleDateString('ru-RU') : '-'}
      </div>
    </Card>
  </div>
)

export default SummaryCards
