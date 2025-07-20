import { FC, ReactNode } from 'react'

interface ProgressCardProps {
  icon: ReactNode
  value: string | number
  label: string
  bg?: string
}

const ProgressCard: FC<ProgressCardProps> = ({ icon, value, label, bg = 'bg-white' }) => (
  <div className={`${bg} rounded-xl shadow-sm border border-emerald-200 p-6`}>\
    <div className="flex items-center space-x-3">
      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-emerald-900">{value}</div>
        <div className="text-sm text-emerald-700">{label}</div>
      </div>
    </div>
  </div>
)

export default ProgressCard
