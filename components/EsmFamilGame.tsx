
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { generateLetter } from '../services/geminiService';
import { ESM_FAMIL_FIELDS } from '../constants';
import { audioManager } from '../services/audioService';

interface Props {
  players: Player[];
  onEndGame: (winnerId: number | null) => void;
}

export const EsmFamilGame: React.FC<Props> = ({ players, onEndGame }) => {
  const [letter, setLetter] = useState<string>('...');
  const [currentField, setCurrentField] = useState<string>('');
  const [scores, setScores] = useState<Record<number, number>>({});
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'LOADING' | 'READY' | 'PLAYING' | 'VALIDATING'>('LOADING');
  const [buzzedPlayer, setBuzzedPlayer] = useState<number | null>(null);

  const TOTAL_ROUNDS = 5; // Reduced for quicker party play

  useEffect(() => {
    const init = async () => {
       const l = await generateLetter();
       setLetter(l);
       setCurrentField(ESM_FAMIL_FIELDS[Math.floor(Math.random() * ESM_FAMIL_FIELDS.length)]);
       setGameState('READY');
    };
    init();
  }, []);

  const nextRound = async () => {
    if (round >= TOTAL_ROUNDS - 1) {
      const sorted = players.slice().sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
      onEndGame(sorted[0].id);
      return;
    }

    setGameState('LOADING');
    setBuzzedPlayer(null);
    const l = await generateLetter();
    setLetter(l);
    setCurrentField(ESM_FAMIL_FIELDS[Math.floor(Math.random() * ESM_FAMIL_FIELDS.length)]);
    setRound(r => r + 1);
    setGameState('READY');
  };

  const handleBuzz = (playerId: number) => {
    if (gameState !== 'READY') return;
    audioManager.playBuzzer();
    setBuzzedPlayer(playerId);
    setGameState('VALIDATING');
  };

  const confirmPoint = (correct: boolean) => {
    if (buzzedPlayer !== null && correct) {
      audioManager.playWin();
      setScores(prev => ({ ...prev, [buzzedPlayer]: (prev[buzzedPlayer] || 0) + 10 }));
    } else if (buzzedPlayer !== null && !correct) {
       audioManager.playLose();
       setScores(prev => ({ ...prev, [buzzedPlayer]: (prev[buzzedPlayer] || 0) - 5 }));
    }
    nextRound();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 text-center shadow-lg z-10 rounded-b-3xl">
        <h2 className="text-xl font-bold opacity-80">دور {round + 1} از {TOTAL_ROUNDS}</h2>
        <div className="flex justify-center gap-2 mt-3 overflow-x-auto pb-2">
           {players.map(p => (
             <div key={p.id} className="flex flex-col items-center bg-white/20 p-2 rounded-xl min-w-[60px]">
                <span className="text-xs mb-1">{p.name}</span>
                <span className="font-bold text-lg">{scores[p.id] || 0}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Game Center */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {gameState === 'LOADING' && <div className="animate-spin text-6xl">🎲</div>}
        
        {(gameState === 'READY' || gameState === 'VALIDATING') && (
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-4 border-indigo-100 w-full max-w-xs transform hover:scale-105 transition-transform duration-300">
            <div className="mb-6">
              <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold">موضوع</span>
              <h3 className="text-4xl text-gray-800 font-black mt-2">{currentField}</h3>
            </div>
            
            <div className="w-full h-0.5 bg-gray-100 mb-6"></div>
            
            <div>
              <span className="bg-pink-100 text-pink-700 px-4 py-1 rounded-full text-sm font-bold">حرف</span>
              <h1 className="text-8xl text-indigo-600 font-black mt-2 drop-shadow-md">{letter}</h1>
            </div>
          </div>
        )}

        {gameState === 'VALIDATING' && buzzedPlayer && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 px-6">
              <div className="bg-white p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl animate-float">
                 <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                   <span className="text-4xl">{players.find(p => p.id === buzzedPlayer)?.avatarId}</span>
                   پاسخ داد؟
                 </h3>
                 <p className="mb-8 text-gray-500 font-medium">آیا کلمه درست بود؟</p>
                 <div className="flex gap-4 justify-center">
                    <button onClick={() => confirmPoint(true)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-2xl text-xl font-bold flex-1 shadow-lg active:scale-95 transition-all">
                      ✅ بله
                    </button>
                    <button onClick={() => confirmPoint(false)} className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-2xl text-xl font-bold flex-1 shadow-lg active:scale-95 transition-all">
                      ❌ خیر
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Buzzer Buttons */}
      {gameState === 'READY' && (
        <div className="grid grid-cols-2 gap-3 p-3 h-48 pb-6">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => handleBuzz(p.id)}
              className={`${p.color} text-white rounded-2xl shadow-[0_5px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center border-t border-white/20`}
            >
              <span className="text-3xl mb-1">{p.avatarId}</span>
              <span className="font-bold text-sm">جواب دارم!</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
