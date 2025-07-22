import type { FC } from 'react';
import { Play } from 'lucide-react';

interface ChapterCardProps {
  number: number;
  title: string;
  subtitle?: string;
  level?: string;
  onStart: () => void;
}

// Remove common prefixes like "Глава 1" or "1." from the title
const cleanTitle = (title: string): string => {
  return title
    .replace(/^\s*Глава\s*\d+[:.-]?\s*/i, '')
    .replace(/^\s*\d+[:.-]?\s*/, '')
    .trim();
};

const ChapterCard: FC<ChapterCardProps> = ({ number, title, subtitle, level, onStart }) => {
  const displayTitle = cleanTitle(title);

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 mb-4 flex flex-col items-center text-center w-full">
      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg font-bold mb-2">
        {number}
      </div>
      <h3 className="text-base font-semibold leading-snug text-ellipsis">{displayTitle}</h3>
      {subtitle && <p className="text-sm text-gray-600 mt-1 text-ellipsis">{subtitle}</p>}
      {level && (
        <span className="text-xs mt-2 inline-block bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
          {level}
        </span>
      )}
      <button
        onClick={onStart}
        className="mt-4 max-w-xs w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 hover:scale-105 hover:shadow-md transition-transform duration-200 active:scale-100"
      >
        <Play className="w-4 h-4" />
        <span>Начать</span>
        <span className="ml-2 text-xs text-white/80">+20 XP</span>
      </button>
    </div>
  );
};

export default ChapterCard;
