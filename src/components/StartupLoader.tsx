import { FC, useEffect, useRef, useState } from 'react';

interface StartupLoaderProps {
  onFinish: () => void;
}

const StartupLoader: FC<StartupLoaderProps> = ({ onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((e) => console.warn('❌ Видео не проигрывается:', e));
      const handleEnded = () => {
        setHidden(true);
        onFinish();
      };
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [onFinish]);

  if (hidden) return <p className="text-center text-gray-400">Контент загружается...</p>;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 9999,
      }}
    >
      <video
        ref={videoRef}
        src="/start-loading.mp4"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        autoPlay
        muted
        playsInline
      />
    </div>
  );
};

export default StartupLoader;
