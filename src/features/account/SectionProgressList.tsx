import { FC } from 'react'
import clsx from 'clsx'

interface SectionProgressListProps {
  progress: Array<any>
}

const SectionProgressList: FC<SectionProgressListProps> = ({ progress }) => (
  <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
    <h2 className="text-xl font-semibold text-emerald-900 mb-4">Прогресс по разделам</h2>
    <div className="space-y-3">
      {progress.map(section => (
        <div key={section.section_id} className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-800">Раздел {section.section_id}</p>
            <span className="text-sm text-gray-500">{section.accuracy}%</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-500',
                section.accuracy <= 30
                  ? 'bg-red-400'
                  : section.accuracy <= 70
                    ? 'bg-yellow-400'
                    : 'bg-green-500'
              )}
              style={{ width: `${section.accuracy}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default SectionProgressList
