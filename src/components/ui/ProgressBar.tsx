import { FC } from 'react'

interface ProgressBarProps {
  percent: number
  color?: string
  height?: string
}

const ProgressBar: FC<ProgressBarProps> = ({ percent, color = 'bg-emerald-600', height = 'h-2' }) => (
  <div className={`w-full bg-gray-200 rounded-full ${height}`}>
    <div
      className={`${color} ${height} rounded-full transition-all duration-300`}
      style={{ width: `${percent}%` }}
    />
  </div>
)

export default ProgressBar
