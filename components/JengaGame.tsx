
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { audioManager } from '../services/audioService';

interface Props {
  players: Player[];
  onEndGame: (winnerId: number | null) => void;
}

export const JengaGame: React.FC<Props> = ({ players, onEndGame }) => {
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [instability, setInstability] = useState(0);
  const [blocks, setBlocks] = useState<number[]>(Array.from({ length: 18 }, (_, i) => i)); 
  const [message, setMessage] = useState('شروع بازی!');
  const [gameOver, setGameOver] = useState(false);

  const currentPlayer = players[currentPlayerIdx];

  const handlePullBlock = (blockId: number) => {
    if (gameOver) return;
    audioManager.playClick();

    const risk = Math.random() * 15 + 5; 
    const newInstability = instability + risk;
    
    setBlocks(prev => prev.filter(b => b !== blockId));

    if (newInstability >= 100) {
      setInstability(100);
      setGameOver(true);
      setMessage(`برج ریخت! ${currentPlayer.name} باخت! 😱`);
      audioManager.playLose();
      setTimeout(() => {
         onEndGame(null); 
      }, 3000);
    } else {
      setInstability(newInstability);
      setMessage(`خوبه! ناپایداری: ${Math.round(newInstability)}%`);
      setTimeout(() => {
        setCurrentPlayerIdx((prev) => (prev + 1) % players.length);
        setMessage('');
      }, 1000);
    }
  };

  const getBlockColor = (index: number) => {
    // Wood texture simulation using colors
    const colors = ['bg-amber-600', 'bg-amber-500', 'bg-orange-700'];
    return colors[index % 3];
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 relative overflow-hidden">
      {/* HUD */}
      <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md mb-4 text-white flex justify-between items-center z-10 border border-white/20">
        <div>
           <span className="text-gray-300 text-xs block mb-1">نوبت:</span>
           <span className={`text-lg font-bold ${currentPlayer?.color} px-3 py-1 rounded-xl text-white shadow-lg`}>
             {currentPlayer?.name}
           </span>
        </div>
        <div className="text-center">
          <span className="text-xs block text-gray-300 mb-1">خطر ریزش</span>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
            <div 
              className={`h-full transition-all duration-500 ${instability > 70 ? 'bg-red-500' : instability > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${instability}%` }}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none w-full text-center">
          <div className="bg-black/80 text-white px-6 py-4 rounded-2xl text-xl font-bold animate-bounce inline-block border-2 border-white/20">
            {message}
          </div>
        </div>
      )}

      {/* The Tower */}
      <div className="flex-1 flex flex-col-reverse items-center justify-center pb-20 perspective-1000">
         <div className="w-56 h-4 bg-gray-700 rounded mb-1 shadow-2xl"></div>
         
         <div className={`flex flex-col-reverse transition-transform duration-700 transform-style-3d ${gameOver ? 'rotate-12 translate-y-32 opacity-50' : ''}`}>
           {Array.from({ length: 6 }).map((_, rowIndex) => {
             return (
               <div key={rowIndex} className="flex gap-1 mb-1 transform hover:scale-105 transition-transform duration-200">
                 {[0, 1, 2].map((colIndex) => {
                   const blockId = rowIndex * 3 + colIndex;
                   const exists = blocks.includes(blockId);
                   return (
                     <button
                        key={blockId}
                        disabled={!exists || gameOver}
                        onClick={() => handlePullBlock(blockId)}
                        className={`
                          w-16 h-10 rounded-sm shadow-[2px_2px_0_rgba(0,0,0,0.3)] relative
                          ${exists ? getBlockColor(blockId) : 'opacity-0 pointer-events-none'}
                          transition-all duration-200 active:scale-95 border-t border-white/20
                        `}
                     >
                        {exists && (
                          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
                        )}
                     </button>
                   );
                 })}
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
};
