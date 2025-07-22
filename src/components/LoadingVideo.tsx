import { useEffect, useRef } from 'react';

interface LoadingVideoProps {
  onFinish: () => void;
}

const LoadingVideo: React.FC<LoadingVideoProps> = ({ onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const fallback = setTimeout(() => onFinish(), 12000);

    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const resume = () => {
            video.play().catch(() => {});
          };
          document.addEventListener('click', resume, { once: true });
        });
      }
    }

    return () => {
      clearTimeout(fallback);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50">
      <video
        ref={videoRef}
        src="/start-loading.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onFinish}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default LoadingVideo;
