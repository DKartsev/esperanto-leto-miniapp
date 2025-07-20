import { useEffect, useState } from 'react';
import videoFile from '../assets/Failed.mp4';

interface SectionFailedProps {
  sectionId: string;
  delay?: number;
  onRetry?: () => void;
}

const SectionFailed = ({ sectionId, delay = 2000, onRetry }: SectionFailedProps) => {
  const [showRetry, setShowRetry] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev === '...' ? '' : prev + '.'));
    }, 400);

    const timeout = setTimeout(() => {
      clearInterval(dotInterval);
      setShowRetry(true);
    }, delay);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timeout);
    };
  }, []);

  // При нажатии вызываем переданный callback
  const handleRetry = () => {
    if (onRetry) onRetry();
  };

  return (
    <div className="fixed inset-0 min-h-screen w-screen overflow-hidden bg-black z-50">
      <video
        src={videoFile}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-[12%] left-1/2 transform -translate-x-1/2 text-center px-4 w-full max-w-xs">
        {showRetry && (
          <div className="mb-3 px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold w-fit mx-auto">
            Fiasko
          </div>
        )}
        <button
          onClick={showRetry ? handleRetry : undefined}
          disabled={!showRetry}
          className={`transition-all text-white px-6 py-3 rounded-full text-lg font-semibold w-full ${
            showRetry
              ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer'
              : 'bg-green-600 opacity-80 cursor-not-allowed'
          }`}
        >
          {showRetry ? 'Попробовать ещё раз' : `Загрузка${dots}`}
        </button>
      </div>
    </div>
  );
}; 

export default SectionFailed;
