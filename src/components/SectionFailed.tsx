// src/components/SectionFailed.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import videoFile from '../assets/Failed.mp4'; // убедись, что файл загружен в эту папку

const SectionFailed = ({ sectionId }: { sectionId: string }) => {
  const [showRetry, setShowRetry] = useState(false);
  const [dots, setDots] = useState('');
  const navigate = useNavigate();

  // Анимация точек и смена кнопки
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
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
    <div className="relative w-screen h-screen bg-black">
      <video
        src={videoFile}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {showRetry ? (
        <>
          <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 text-center">
            <div className="mb-3 px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
              Fiasko
            </div>
            <button
              onClick={handleRetry}
              className="bg-gray-400 hover:bg-gray-500 transition-all text-white px-6 py-3 rounded-full text-lg font-semibold"
            >
              Попробовать еще раз
            </button>
          </div>
        </>
      ) : (
        <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2">
          <button
            disabled
            className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold opacity-80"
          >
            Загрузка{dots}
          </button>
        </div>
      )}
    </div>
  );
};

export default SectionFailed;
