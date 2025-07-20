import { Loader2 } from 'lucide-react';
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-white text-green-600">
      <Loader2 className="animate-spin w-12 h-12 mb-4" />
      <p className="text-lg font-semibold">Ŝargado...</p>
    </div>
  );
};

export default LoadingScreen;
