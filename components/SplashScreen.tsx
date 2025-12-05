import React, { useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      
      <div className="animate-bounce mb-8 text-8xl filter drop-shadow-lg">
        🎉
      </div>
      
      <h1 className="text-4xl md:text-6xl font-black mb-4 text-center px-4 drop-shadow-xl animate-pulse">
        پارتی امیرعلی النا
      </h1>
      
      <p className="text-xl opacity-90 font-bold mt-4">بارگذاری بازی‌ها...</p>
      
      <div className="mt-8 flex gap-2">
        <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-75"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  );
};