import { FC } from 'react'

interface SectionProgressListProps {
  progress: Array<any>
}

const SectionProgressList: FC<SectionProgressListProps> = ({ progress }) => (
  <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
    <h2 className="text-xl font-semibold text-emerald-900 mb-4">Прогресс по разделам</h2>
    <ul className="space-y-1 text-sm text-emerald-700">
      {progress.map(p => (
        <li key={p.section_id} className="flex justify-between">
          <span>Раздел {p.section_id}</span>
          <span className="flex items-center space-x-2">
            <span>{p.accuracy}%</span>
            <span className={p.completed ? 'text-green-600' : 'text-red-600'}>
              {p.completed ? 'Завершён' : 'Не завершён'}
            </span>
          </span>
        </li>
      ))}
    </ul>
  </div>
)

export default SectionProgressList
