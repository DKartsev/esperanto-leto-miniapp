import { FC } from 'react'
import ProgressBar from '../../components/ui/ProgressBar'

interface ChapterProgressItem {
  chapterId: number
  title: string
  percent: number
}

interface AccountProgressProps {
  progress: ChapterProgressItem[]
  onStart?: (chapterId: number) => void
}

const AccountProgress: FC<AccountProgressProps> = ({ progress, onStart }) => (
  <div className="space-y-2">
    {progress.map(cp => (
      <div key={cp.chapterId} className="space-y-1">
        <div className="flex justify-between items-center">
          <span>{cp.title} — {cp.percent}%</span>
          {cp.percent === 100 && <span className="text-green-600">✓</span>}
        </div>
        <ProgressBar percent={cp.percent} />
        {onStart && cp.percent < 100 && (
          <button onClick={() => onStart(cp.chapterId)} className="text-sm text-emerald-600">Начать</button>
        )}
      </div>
    ))}
  </div>
)

export default AccountProgress
