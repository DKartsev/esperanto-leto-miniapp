import { FC } from 'react'
import { Play } from 'lucide-react'
import ProgressBar from './ui/ProgressBar'

interface SectionCardProps {
  id: number
  title: string
  progress: number
  locked?: boolean
  onSelect: () => void
}

const SectionCard: FC<SectionCardProps> = ({ id, title, progress, locked = false, onSelect }) => {
  const isCompleted = progress >= 100
  let status = '🔓'
  if (locked) status = '🔒'
  else if (isCompleted) status = '✅'

  return (
    <button
      onClick={onSelect}
      disabled={locked}
      className="relative w-full rounded-2xl shadow-sm bg-white px-3 py-2 flex items-center justify-between hover:scale-105 transition-transform"
    >
      <div className="flex flex-col flex-grow pr-2 gap-y-1 text-left">
        <span className="text-sm truncate text-emerald-900">
          {`Раздел ${id} — ${title}`}
        </span>
        <ProgressBar percent={progress} />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-emerald-600 font-medium">+20 XP</span>
        <Play className="w-5 h-5 text-emerald-600" />
      </div>
      <span className="absolute top-2 right-2 text-sm opacity-70">{status}</span>
    </button>
  )
}

export default SectionCard
