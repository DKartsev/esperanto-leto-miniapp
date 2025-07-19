import { FC } from 'react';

interface VisualLogProps {
  logs: string[];
}

const VisualLog: FC<VisualLogProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-white text-xs px-4 py-2 z-50 max-h-40 overflow-y-auto">
      {logs.map((log, idx) => (
        <div key={idx}>{log}</div>
      ))}
    </div>
  );
};

export default VisualLog;
