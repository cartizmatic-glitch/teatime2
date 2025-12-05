
import React, { useState, useEffect } from 'react';
import { AppScreen, GameConfig, GameType, Player, Character, UniversalGameType } from './types';
import { CHARACTERS, GAMES } from './constants';
import { SplashScreen } from './components/SplashScreen';
import { JengaGame } from './components/JengaGame';
import { FishingGame } from './components/FishingGame';
import { EsmFamilGame } from './components/EsmFamilGame';
import { UniversalGame } from './components/UniversalGame';
import { audioManager } from './services/audioService';

// UI Components
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ className = '', variant = 'primary', ...props }) => {
  const baseStyle = "w-full py-4 rounded-2xl font-black text-xl btn-3d mb-4 flex items-center justify-center relative overflow-hidden";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-b-indigo-800",
    secondary: "bg-white text-indigo-600 border border-gray-200",
    danger: "bg-gradient-to-r from-red-500 to-orange-500 text-white",
  };
  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      onMouseDown={() => audioManager.playClick()}
      onTouchStart={() => audioManager.playClick()}
      {...props} 
    />
  );
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [selectedGame, setSelectedGame] = useState<GameConfig | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | '1P' | '2P' | '4P'>('ALL');
  const [muted, setMuted] = useState(false);

  const setupPlayers = (count: number) => {
    const newPlayers: Player[] = [];
    const shuffledChars = [...CHARACTERS].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
      const char = shuffledChars[i];
      newPlayers.push({
        id: i + 1,
        name: `بازیکن ${i + 1}`,
        avatarId: char.svg,
        color: char.color,
        score: 0
      });
    }
    setPlayers(newPlayers);
  };

  const handleGameSelect = (game: GameConfig) => {
    setSelectedGame(game);
    audioManager.playClick();
    setScreen(AppScreen.CHAR_SELECT);
  };

  const startGame = (playerCount: number) => {
    setupPlayers(playerCount);
    audioManager.playWin(); // Start sound
    setScreen(AppScreen.PLAYING);
  };

  const handleEndGame = (wId: number | null) => {
    setWinnerId(wId);
    if (wId) audioManager.playWin();
    else audioManager.playLose();
    setScreen(AppScreen.RESULTS);
  };

  const toggleMute = () => {
    const isMuted = audioManager.toggleMute();
    setMuted(isMuted);
  };

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.SPLASH:
        return <SplashScreen onComplete={() => setScreen(AppScreen.MAIN_MENU)} />;
      
      case AppScreen.MAIN_MENU:
        return (
          <div className="h-full bg-party flex flex-col justify-center max-w-md mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="flex-1 flex flex-col items-center justify-center z-10 p-6">
              <div className="animate-float mb-6">
                 <span className="text-8xl drop-shadow-2xl">🎪</span>
              </div>
              <h1 className="text-6xl font-black text-white text-center mb-2 drop-shadow-lg tracking-tighter">پارتی</h1>
              <h2 className="text-3xl font-extrabold text-yellow-300 text-center mb-12 drop-shadow-md">امیرعلی و النا</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                 <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-white/30 text-center text-4xl animate-bounce">🎮</div>
                 <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-white/30 text-center text-4xl animate-bounce delay-100">🔥</div>
              </div>
            </div>
            
            <div className="p-6 z-10 bg-white/10 backdrop-blur-xl rounded-t-3xl border-t border-white/20">
              <Button onClick={() => setScreen(AppScreen.GAME_SELECT)}>شروع بازی</Button>
              <div className="flex gap-4">
                 <Button variant="secondary" onClick={() => alert('لیدربرد هنوز خالی است!')} className="flex-1">🏆 رکوردها</Button>
                 <Button variant="secondary" onClick={toggleMute} className="w-16 flex-none text-2xl">
                   {muted ? '🔇' : '🔊'}
                 </Button>
              </div>
            </div>
          </div>
        );

      case AppScreen.GAME_SELECT:
        const filteredGames = GAMES.filter(g => {
          if (activeTab === 'ALL') return true;
          if (activeTab === '1P') return g.maxPlayers === 1;
          if (activeTab === '2P') return g.maxPlayers === 2;
          if (activeTab === '4P') return g.maxPlayers === 4;
          return true;
        });

        return (
          <div className="h-full bg-slate-100 flex flex-col">
            <div className="p-4 bg-white shadow-md z-10 rounded-b-3xl">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-indigo-900">انتخاب بازی</h2>
                  <button onClick={() => setScreen(AppScreen.MAIN_MENU)} className="text-indigo-500 font-bold bg-indigo-50 px-3 py-1 rounded-full">خانه 🏠</button>
               </div>
               
               {/* Tabs */}
               <div className="flex bg-gray-100 p-1 rounded-2xl">
                  {([
                    { id: 'ALL', label: 'همه' },
                    { id: '1P', label: '۱ نفره' },
                    { id: '2P', label: '۲ نفره' },
                    { id: '4P', label: '۴ نفره' },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); audioManager.playClick(); }}
                      className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg transform scale-105' : 'text-gray-400'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredGames.map(game => (
                <div key={game.id} onClick={() => handleGameSelect(game)} className="bg-white p-4 rounded-3xl shadow-sm border-2 border-transparent hover:border-indigo-200 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer">
                   <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner">
                     {game.icon}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-lg text-gray-800 truncate">{game.name}</h3>
                     <p className="text-xs text-gray-400 truncate mt-1">{game.description}</p>
                     <div className="flex gap-2 mt-2">
                        {game.type === GameType.GENERIC && game.universalType !== UniversalGameType.NONE && (
                           <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">آماده بازی</span>
                        )}
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{game.maxPlayers} نفره</span>
                     </div>
                   </div>
                   <div className="text-indigo-200 font-bold text-xl">❮</div>
                </div>
              ))}
              <div className="h-20"></div>
            </div>
          </div>
        );

      case AppScreen.CHAR_SELECT:
        return (
          <div className="h-full bg-indigo-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-xl text-center">
              <div className="text-6xl mb-4 animate-bounce">{selectedGame?.icon}</div>
              <h2 className="text-2xl font-black text-gray-800 mb-6">{selectedGame?.name}</h2>
              
              <div className="space-y-3">
                 <Button onClick={() => startGame(1)}>۱ نفر (تمرینی)</Button>
                 {selectedGame?.maxPlayers && selectedGame.maxPlayers >= 2 && (
                   <Button onClick={() => startGame(2)} className="bg-gradient-to-r from-pink-500 to-rose-500">۲ نفر (دوئل)</Button>
                 )}
                 {selectedGame?.maxPlayers && selectedGame.maxPlayers >= 4 && (
                   <Button onClick={() => startGame(4)} className="bg-gradient-to-r from-yellow-400 to-orange-500">۴ نفر (پارتی)</Button>
                 )}
              </div>
              <button onClick={() => setScreen(AppScreen.GAME_SELECT)} className="mt-6 text-gray-400 font-bold text-sm">بازگشت</button>
            </div>
          </div>
        );

      case AppScreen.PLAYING:
        if (!selectedGame) return null;
        switch (selectedGame.type) {
          case GameType.JENGA:
            return <JengaGame players={players} onEndGame={handleEndGame} />;
          case GameType.FISHING:
            return <FishingGame players={players} onEndGame={handleEndGame} />;
          case GameType.ESM_FAMIL:
            return <EsmFamilGame players={players} onEndGame={handleEndGame} />;
          case GameType.GENERIC:
          default:
            return <UniversalGame game={selectedGame} players={players} onEndGame={handleEndGame} onBack={() => setScreen(AppScreen.GAME_SELECT)} />;
        }

      case AppScreen.RESULTS:
        const winner = players.find(p => p.id === winnerId);
        return (
           <div className="h-full bg-party flex flex-col items-center justify-center text-white p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              
              <div className="text-9xl mb-4 animate-bounce drop-shadow-2xl z-10">🏆</div>
              <h2 className="text-5xl font-black mb-4 z-10 drop-shadow-md">پایان بازی!</h2>
              
              <div className={`text-4xl font-black px-8 py-6 rounded-3xl bg-white text-black mb-12 shadow-[0_10px_0_rgba(0,0,0,0.2)] transform rotate-3 z-10 ${winner?.color?.replace('bg-', 'text-') || 'text-black'}`}>
                {winner ? `برنده: ${winner.name}` : 'همه برنده!'}
              </div>
              
              <div className="w-full max-w-sm space-y-4 z-10">
                <Button variant="secondary" onClick={() => setScreen(AppScreen.GAME_SELECT)}>بازی دوباره 🔄</Button>
                <Button onClick={() => setScreen(AppScreen.MAIN_MENU)}>منوی اصلی 🏠</Button>
              </div>
           </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white h-[100dvh] shadow-2xl overflow-hidden relative font-vazir text-right">
       {renderScreen()}
    </div>
  );
};

export default App;
