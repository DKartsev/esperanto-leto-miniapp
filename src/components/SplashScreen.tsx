import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SplashScreenProps {
  onFinish: () => void;
}

// Expose window.hideLoadingScreen typing
declare global {
  interface Window {
    hideLoadingScreen?: () => void;
  }
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const resume = () => {
          video.play().catch(() => {});
        };
        document.addEventListener('click', resume, { once: true });
      });
    }
  }, []);

  const handleEnd = () => {
    if (window.hideLoadingScreen) {
      window.hideLoadingScreen();
    }
    onFinish();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleEnd}
        className="w-full h-screen object-cover"
      >
        <source src="/start-loading.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default SplashScreen;
