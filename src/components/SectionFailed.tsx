import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import videoFile from '../assets/Failed.mp4';

const SectionFailed = ({ sectionId }: { sectionId: string }) => {
  const [showRetry, setShowRetry] = useState(false);
  const [dots, setDots] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev === '...' ? '' : prev + '.'));
    }, 400);

    const timeout = setTimeout(() => {
      clearInterval(dotInterval);
      setShowRetry(true);
    }, 2000);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timeout);
    };
  }, []);

  // При нажатии — переход к разделу
  const handleRetry = () => {
    navigate(`/section/${sectionId}`);
  };

  return (
    <div className="relative w-screen h-screen">
      <video
        src={videoFile}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {showRetry ? (
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center">
          <div className="mb-3 inline-block px-4 py-1 rounded-full border border-red-500 text-red-600 bg-white/70 backdrop-blur-sm text-sm font-semibold">
            Fiasko
          </div>
          <button
            onClick={handleRetry}
            className="mt-2 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-full text-lg font-semibold transition-colors"
          >
            Попробовать ещё раз
          </button>
        </div>
      ) : (
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2">
          <button
            disabled
            className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold opacity-80 cursor-not-allowed"
          >
            Загрузка{dots}
          </button>
        </div>
      )}
    </div>
  );
}; 

export default SectionFailed;
