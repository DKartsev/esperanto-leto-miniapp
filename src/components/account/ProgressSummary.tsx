import { FC } from 'react'

interface ProgressSummaryProps {
  correct: number
  incorrect: number
  totalTime: number
  completedSections: number
}

const ProgressSummary: FC<ProgressSummaryProps> = ({
  correct,
  incorrect,
  totalTime,
  completedSections
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
    <h2 className="text-xl font-semibold text-emerald-900 mb-4">Общая статистика</h2>
    <ul className="space-y-1 text-sm text-emerald-700">
      <li>Правильных ответов: {correct}</li>
      <li>Неправильных ответов: {incorrect}</li>
      <li>Общее время: {Math.round(totalTime / 60)} мин</li>
      <li>Завершено разделов: {completedSections}</li>
    </ul>
  </div>
)

export default ProgressSummary
