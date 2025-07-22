import { FC } from 'react'

interface ProgressBarProps {
  percent: number
  color?: string
  height?: string
}

const ProgressBar: FC<ProgressBarProps> = ({
  percent,
  color = 'bg-emerald-400/60',
  height = 'h-2'
}) => (
  <div className={`w-full ${height} bg-gray-200/60 rounded-full`}>
    <div
      className={`${color} ${height} rounded-full transition-all duration-300`}
      style={{ width: `${percent}%` }}
    />
  </div>
)

export default ProgressBar
