import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import videoFile from '../assets/Complete.mp4';

interface SectionSuccessProps {
  sectionId: string;
  nextSectionId?: string;
  nextChapterId?: string;
}

const SectionSuccess = ({
  sectionId,
  nextSectionId,
  nextChapterId
}: SectionSuccessProps) => {
  const [ready, setReady] = useState(false);
  const [dots, setDots] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev === '...' ? '' : prev + '.'));
    }, 400);

    const timeout = setTimeout(() => {
      clearInterval(dotInterval);
      setReady(true);
    }, 2000);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timeout);
    };
  }, []);

  const handleNext = () => {
    if (!ready) return;
    if (nextSectionId) {
      navigate(`/section/${nextSectionId}`);
    } else if (nextChapterId) {
      navigate(`/chapter/${nextChapterId}`);
    } else {
      navigate(`/section/${sectionId}`);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black z-50">
      <video
        src={videoFile}
        autoPlay
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-[12%] left-1/2 transform -translate-x-1/2 text-center px-4 w-full max-w-xs">
        <div
          className={`mb-3 px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold w-fit mx-auto transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
        >
          Sukcese
        </div>
        <button
          onClick={handleNext}
          disabled={!ready}
          className={`transition-colors text-white px-6 py-3 rounded-full text-lg font-semibold w-full ${
            ready
              ? 'bg-gray-400 hover:bg-gray-500 cursor-pointer'
              : 'bg-green-600 opacity-80 cursor-not-allowed'
          }`}
        >
          {ready ? 'Далее' : `Загрузка${dots}`}
        </button>
      </div>
    </div>
  );
};

export default SectionSuccess;
