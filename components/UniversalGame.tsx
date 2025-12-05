
import React, { useState, useEffect, useRef } from 'react';
import { Player, GameConfig, UniversalGameType } from '../types';
import { audioManager } from '../services/audioService';

interface Props {
  game: GameConfig;
  players: Player[];
  onEndGame: (winnerId: number | null) => void;
  onBack: () => void;
}

export const UniversalGame: React.FC<Props> = ({ game, players, onEndGame, onBack }) => {
  // Common State
  const [scores, setScores] = useState<Record<number, number>>({});
  const [gameState, setGameState] = useState<'PREP' | 'PLAYING' | 'ENDED'>('PREP');
  const [message, setMessage] = useState(game.description);
  const [timeLeft, setTimeLeft] = useState(0);

  // MASH State (Tapping)
  const [clicks, setClicks] = useState<Record<number, number>>({});
  const GOAL_CLICKS = 50;

  // REFLEX State
  const [reflexTarget, setReflexTarget] = useState(false);
  const [reflexWinner, setReflexWinner] = useState<number | null>(null);

  // MEMORY State
  const [cards, setCards] = useState<{id: number, val: string, flipped: boolean, matched: boolean}[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);

  // LUCK State
  const [diceValue, setDiceValue] = useState<string>('🎲');

  // QUIZ State
  const [quizPrompt, setQuizPrompt] = useState<string>('');

  useEffect(() => {
    // Init logic based on type
    if (game.universalType === UniversalGameType.MASH) {
      const initial: Record<number, number> = {};
      players.forEach(p => initial[p.id] = 0);
      setClicks(initial);
      setMessage('آماده؟ با سرعت ضربه بزنید!');
      setTimeout(() => setGameState('PLAYING'), 2000);
    } 
    else if (game.universalType === UniversalGameType.REFLEX) {
      setMessage('صبر کن... صبر کن...');
      setGameState('PLAYING');
      const delay = Math.random() * 3000 + 2000;
      setTimeout(() => {
        setReflexTarget(true);
        setMessage('حالا بزن! 🟢');
        audioManager.playPop();
      }, delay);
    }
    else if (game.universalType === UniversalGameType.LUCK) {
       setGameState('PLAYING');
       setMessage('برای امتحان شانس ضربه بزنید.');
    }
    else if (game.universalType === UniversalGameType.MEMORY) {
       const icons = ['🍎', '🍌', '🍒', '🍇', '🍉', '🥝', '🍋', '🥭'];
       // Create pairs
       const deck = [...icons.slice(0, 6), ...icons.slice(0, 6)]
          .sort(() => Math.random() - 0.5)
          .map((val, idx) => ({ id: idx, val, flipped: false, matched: false }));
       setCards(deck);
       setGameState('PLAYING');
    }
    else if (game.universalType === UniversalGameType.QUIZ) {
       setGameState('PLAYING');
       generateQuiz();
    }
  }, [game]);

  // --- LOGIC HANDLERS ---

  const handleMashClick = (pid: number) => {
    if (gameState !== 'PLAYING') return;
    audioManager.playClick();
    
    setClicks(prev => {
      const newCount = (prev[pid] || 0) + 1;
      if (newCount >= GOAL_CLICKS) {
        setGameState('ENDED');
        audioManager.playWin();
        setTimeout(() => onEndGame(pid), 1500);
      }
      return { ...prev, [pid]: newCount };
    });
  };

  const handleReflexClick = (pid: number) => {
    if (gameState !== 'PLAYING') return;
    
    if (!reflexTarget) {
      // Penalty for early click?
      setMessage(`${players.find(p=>p.id===pid)?.name} زود زد! باخت! ❌`);
      audioManager.playLose();
      setGameState('ENDED');
      // Winner is everyone else? Simple: return null
      setTimeout(() => onEndGame(null), 2000);
      return;
    }

    if (reflexWinner === null) {
      setReflexWinner(pid);
      audioManager.playWin();
      setGameState('ENDED');
      setMessage(`${players.find(p=>p.id===pid)?.name} برنده شد! ⚡`);
      setTimeout(() => onEndGame(pid), 2000);
    }
  };

  const handleLuckAction = (pid: number) => {
    audioManager.playPop();
    if (game.id.includes('dice') || game.id.includes('ludo') || game.id.includes('snakes')) {
       const val = Math.floor(Math.random() * 6) + 1;
       setDiceValue(val.toString());
       setMessage(`${players.find(p=>p.id===pid)?.name} آورد: ${val}`);
    } else if (game.id.includes('coin')) {
       const val = Math.random() > 0.5 ? 'شیر 🦁' : 'خط ➖';
       setDiceValue(val);
       setMessage(val);
    } else if (game.id.includes('spin')) {
       const target = players[Math.floor(Math.random() * players.length)];
       setDiceValue(target.avatarId);
       setMessage(`قرعه به نام: ${target.name}`);
    } else {
       // Bomb / Random
       const boom = Math.random() > 0.8;
       if (boom) {
         setDiceValue('💥');
         audioManager.playLose();
         setMessage('بوم! باختی!');
       } else {
         setDiceValue('✅');
         setMessage('امن است.');
       }
    }
  };

  const handleCardClick = (idx: number) => {
    if (flippedIndices.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    
    audioManager.playClick();
    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
       const [i1, i2] = newFlipped;
       if (newCards[i1].val === newCards[i2].val) {
          // Match
          audioManager.playWin();
          setTimeout(() => {
            newCards[i1].matched = true;
            newCards[i2].matched = true;
            setCards([...newCards]);
            setFlippedIndices([]);
            
            if (newCards.every(c => c.matched)) {
               onEndGame(players[0].id); // Solo play usually
            }
          }, 500);
       } else {
          // No Match
          setTimeout(() => {
             newCards[i1].flipped = false;
             newCards[i2].flipped = false;
             setCards([...newCards]);
             setFlippedIndices([]);
          }, 1000);
       }
    }
  };

  const generateQuiz = () => {
    const prompts = [
      'یک جوک تعریف کن.',
      'صدای یک حیوان را تقلید کن.',
      'آخرین عکسی که گرفتی را نشان بده.',
      'پنج بار سریع بگو: چیپس چسب سس.',
      'یک آهنگ بخوان.',
    ];
    setQuizPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
  };

  // --- RENDERERS ---

  const renderMash = () => (
    <div className="grid grid-cols-2 gap-4 w-full h-full p-4">
      {players.map(p => (
        <button 
          key={p.id}
          onClick={() => handleMashClick(p.id)}
          className={`${p.color} rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all shadow-xl border-b-8 border-black/20`}
        >
          <span className="text-4xl mb-2">{p.avatarId}</span>
          <span className="font-bold text-white text-lg">{p.name}</span>
          <div className="w-20 h-4 bg-black/30 rounded-full mt-2 overflow-hidden">
             <div className="h-full bg-white transition-all duration-75" style={{ width: `${(clicks[p.id] || 0) / GOAL_CLICKS * 100}%` }}></div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderReflex = () => (
     <div 
        className={`w-full h-full flex items-center justify-center transition-colors duration-100 ${reflexTarget ? 'bg-green-500' : 'bg-red-500'}`}
     >
       <div className="grid grid-cols-2 gap-4 w-full h-full p-4 z-10">
        {players.map(p => (
          <button 
            key={p.id}
            onClick={() => handleReflexClick(p.id)}
            className={`${p.color} rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all shadow-xl border-b-8 border-black/20`}
          >
            <span className="text-4xl">{p.avatarId}</span>
            <span className="font-black text-white text-2xl mt-2">{p.name}</span>
          </button>
        ))}
       </div>
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 className="text-6xl font-black text-white drop-shadow-lg">{reflexTarget ? 'بزن!' : 'صبر کن...'}</h1>
       </div>
     </div>
  );

  const renderLuck = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
       <div className="text-9xl mb-12 animate-bounce drop-shadow-2xl">{diceValue}</div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
         {players.map(p => (
            <button 
              key={p.id} 
              onClick={() => handleLuckAction(p.id)}
              className={`${p.color} p-6 rounded-2xl text-white font-bold shadow-lg active:translate-y-2 transition-transform border-b-4 border-black/10`}
            >
              <div className="text-2xl mb-2">{p.avatarId}</div>
              {p.name}
            </button>
         ))}
       </div>
    </div>
  );

  const renderMemory = () => (
    <div className="grid grid-cols-4 gap-2 p-4 h-full content-center">
       {cards.map((c, i) => (
         <button
           key={i}
           onClick={() => handleCardClick(i)}
           className={`aspect-square rounded-xl text-4xl flex items-center justify-center shadow-md transition-all duration-300 transform transform-style-3d ${c.flipped || c.matched ? 'bg-white rotate-0' : 'bg-indigo-500 [transform:rotateY(180deg)]'}`}
         >
           {(c.flipped || c.matched) ? c.val : '❓'}
         </button>
       ))}
    </div>
  );

  const renderQuiz = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-yellow-100">
       <div className="bg-white p-8 rounded-3xl shadow-xl transform -rotate-2 mb-8">
         <p className="text-2xl font-bold text-gray-800 leading-relaxed">{quizPrompt}</p>
       </div>
       <button onClick={generateQuiz} className="bg-indigo-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg active:scale-95">
         سوال بعدی 🔄
       </button>
       <button onClick={onBack} className="mt-8 text-gray-500 font-bold">خروج</button>
    </div>
  );

  return (
    <div className="h-full bg-slate-100 relative overflow-hidden flex flex-col">
       {/* Simple Header */}
       <div className="bg-white/80 backdrop-blur p-2 px-4 shadow-sm z-20 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">{game.name}</h2>
          <button onClick={onBack} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm font-bold">خروج</button>
       </div>

       <div className="flex-1 relative">
         {game.universalType === UniversalGameType.MASH && renderMash()}
         {game.universalType === UniversalGameType.REFLEX && renderReflex()}
         {game.universalType === UniversalGameType.LUCK && renderLuck()}
         {game.universalType === UniversalGameType.MEMORY && renderMemory()}
         {game.universalType === UniversalGameType.QUIZ && renderQuiz()}
         
         {game.universalType === UniversalGameType.NONE && (
           <div className="h-full flex flex-col items-center justify-center text-center p-8">
             <div className="text-6xl mb-4">🚧</div>
             <p className="text-xl font-bold text-gray-500">این بازی به زودی تکمیل می‌شود!</p>
             <button onClick={onBack} className="mt-8 bg-gray-200 px-6 py-3 rounded-xl font-bold">بازگشت</button>
           </div>
         )}
       </div>

       {message && game.universalType !== UniversalGameType.REFLEX && (
         <div className="absolute top-16 left-0 right-0 text-center pointer-events-none">
            <span className="bg-black/70 text-white px-6 py-2 rounded-full text-lg font-bold backdrop-blur-md animate-pulse">
              {message}
            </span>
         </div>
       )}
    </div>
  );
};
