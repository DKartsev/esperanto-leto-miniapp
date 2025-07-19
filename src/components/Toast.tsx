import { FC, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: FC<ToastProps> = ({ message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
      <Trophy className="w-5 h-5" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
