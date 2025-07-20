import React from 'react';
import loadingVideo from '../assets/loading.mp4';

const LoadingVideo: React.FC = () => (
  <div className="fixed inset-0 z-40 bg-black pb-[70px]">
    <video
      src={loadingVideo}
      autoPlay
      muted
      loop
      playsInline
      className="w-full h-full object-cover"
    />
  </div>
);

export default LoadingVideo;
