import { FC } from 'react'
import { BookOpen, CheckCircle, Target } from 'lucide-react'
import Card from '../../components/ui/Card'

interface SummaryCardsProps {
  completedChapters: number
  totalChapters: number
  completedSections: number
  totalSections: number
  averageAccuracy: number
  
}

const SummaryCards: FC<SummaryCardsProps> = ({
  completedChapters,
  totalChapters,
  completedSections,
  totalSections,
  averageAccuracy
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
        <Target className="w-6 h-6" />
        <span className="font-medium">Средняя точность</span>
      </div>
      <div className="text-2xl font-bold mt-2">{averageAccuracy}%</div>
    </Card>
  </div>
)

export default SummaryCards
