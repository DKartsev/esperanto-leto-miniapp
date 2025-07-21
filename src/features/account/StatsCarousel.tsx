import { FC } from 'react'
import { Clock, Target, BookOpen, ListChecks, Calendar } from 'lucide-react'
import Card from '../../components/ui/Card'

interface StatsCarouselProps {
  totalTime: number
  averageAccuracy: number
  completedChapters: number
  totalChapters: number
  completedSections: number
  totalSections: number
  startDate: string | null
}

const StatsCarousel: FC<StatsCarouselProps> = ({
  totalTime,
  averageAccuracy,
  completedChapters,
  totalChapters,
  completedSections,
  totalSections,
  startDate
}) => {
  const stats = [
    {
      label: 'Время обучения',
      value: `${Math.round(totalTime / 60)} мин`,
      Icon: Clock
    },
    {
      label: 'Точность',
      value: `${averageAccuracy}%`,
      Icon: Target
    },
    {
      label: 'Главы',
      value: `${completedChapters}/${totalChapters}`,
      Icon: BookOpen
    },
    {
      label: 'Разделы',
      value: `${completedSections}/${totalSections}`,
      Icon: ListChecks
    },
    {
      label: 'Начало',
      value: startDate ? new Date(startDate).toLocaleDateString('ru-RU') : '-',
      Icon: Calendar
    }
  ]

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-2 p-2 w-max">
        {stats.map(({ label, value, Icon }) => (
          <Card
            key={label}
            className="min-w-[140px] flex-shrink-0 p-3 flex flex-col items-start"
          >
            <Icon className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-xs text-gray-500">{label}</span>
            <span className="text-lg font-semibold">{value}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default StatsCarousel
