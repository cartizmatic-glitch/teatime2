
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { audioManager } from '../services/audioService';

interface Props {
  players: Player[];
  onEndGame: (winnerId: number | null) => void;
}

interface Fish {
  id: number;
  x: number;
  y: number;
  type: 'small' | 'medium' | 'large' | 'gold';
  speed: number;
  direction: 1 | -1;
  points: number;
}

export const FishingGame: React.FC<Props> = ({ players, onEndGame }) => {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [fishes, setFishes] = useState<Fish[]>([]);
  
  useEffect(() => {
    const initialScores: Record<number, number> = {};
    players.forEach(p => initialScores[p.id] = 0);
    setScores(initialScores);
  }, [players]);

  useEffect(() => {
    if (timeLeft <= 0) {
      const sorted = players.slice().sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
      onEndGame(sorted[0].id);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, players, scores, onEndGame]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      if (fishes.length < 5) {
        const typeRand = Math.random();
        let type: Fish['type'] = 'small';
        let points = 10;
        if (typeRand > 0.9) { type = 'gold'; points = 50; }
        else if (typeRand > 0.7) { type = 'large'; points = 30; }
        else if (typeRand > 0.4) { type = 'medium'; points = 20; }

        const newFish: Fish = {
          id: Date.now() + Math.random(),
          x: Math.random() < 0.5 ? -10 : 110,
          y: Math.random() * 60 + 10,
          type,
          points,
          direction: Math.random() < 0.5 ? 1 : -1,
          speed: Math.random() * 1.5 + 0.5,
        };
        if (newFish.x < 0) newFish.direction = 1;
        else newFish.direction = -1;

        setFishes(prev => [...prev, newFish]);
      }
    }, 1500);

    const loop = setInterval(() => {
      setFishes(prev => prev.map(f => ({
        ...f,
        x: f.x + (f.speed * f.direction)
      })).filter(f => f.x > -20 && f.x < 120));
    }, 50);

    return () => {
      clearInterval(interval);
      clearInterval(loop);
    };
  }, [timeLeft, fishes.length]);

  const handleCatch = (playerId: number) => {
    audioManager.playBuzzer(); // Sound of hook drop
    const catchableFishIndex = fishes.findIndex(f => f.x > 35 && f.x < 65);
    
    if (catchableFishIndex !== -1) {
      audioManager.playPop(); // Sound of catch
      const fish = fishes[catchableFishIndex];
      setScores(prev => ({
        ...prev,
        [playerId]: (prev[playerId] || 0) + fish.points
      }));
      setFishes(prev => prev.filter((_, i) => i !== catchableFishIndex));
    }
  };

  const getFishEmoji = (type: Fish['type']) => {
    switch(type) {
      case 'gold': return '🐡';
      case 'large': return '🦈';
      case 'medium': return '🐟';
      default: return '🐠';
    }
  };

  return (
    <div className="flex flex-col h-full bg-blue-300 relative overflow-hidden">
      <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
        <div className="bg-white/90 px-6 py-2 rounded-full font-black text-blue-900 border-4 border-blue-500 shadow-lg text-xl">
          ⏰ {timeLeft}
        </div>
      </div>

      <div className="flex-1 relative bg-gradient-to-b from-cyan-300 to-blue-600 overflow-hidden">
        {/* Animated Waves CSS could go here, simplified for now */}
        <div className="absolute top-0 bottom-0 left-[35%] right-[35%] bg-white/5 border-x-2 border-dashed border-white/20 pointer-events-none z-0"></div>

        {fishes.map(fish => (
          <div
            key={fish.id}
            className="absolute text-5xl transition-transform drop-shadow-lg"
            style={{
              left: `${fish.x}%`,
              top: `${fish.y}%`,
              transform: `scaleX(${fish.direction === 1 ? -1 : 1})`,
            }}
          >
            {getFishEmoji(fish.type)}
          </div>
        ))}
      </div>

      <div className="h-48 bg-amber-100 grid grid-cols-2 md:grid-cols-4 gap-3 p-3 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.1)]">
        {players.map(p => (
          <button
            key={p.id}
            onClick={() => handleCatch(p.id)}
            className={`${p.color} rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-transform border-b-4 border-black/20 shadow-md relative overflow-hidden`}
          >
             <span className="text-3xl mb-1 drop-shadow-md">{p.avatarId}</span>
             <span className="absolute top-2 right-2 bg-white text-black px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
              {scores[p.id] || 0}
            </span>
            <div className="mt-1 text-3xl">🎣</div>
          </button>
        ))}
      </div>
    </div>
  );
};
