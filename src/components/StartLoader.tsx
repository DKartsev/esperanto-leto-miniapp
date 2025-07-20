import { useEffect } from 'react';

interface StartLoaderProps {
  onFinish: () => void;
}

const StartLoader = ({ onFinish }: StartLoaderProps) => {
  useEffect(() => {
    const video = document.getElementById('start-video') as HTMLVideoElement | null;
    if (video) {
      video.play();
      video.onended = () => {
        onFinish();
      };
    }
  }, [onFinish]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <video
        id="start-video"
        src="/start-loading.mp4"
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
      />
    </div>
  );
};

export default StartLoader;
