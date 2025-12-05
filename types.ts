
export enum AppScreen {
  SPLASH = 'SPLASH',
  MAIN_MENU = 'MAIN_MENU',
  CHAR_SELECT = 'CHAR_SELECT',
  GAME_SELECT = 'GAME_SELECT',
  PLAYING = 'PLAYING',
  RESULTS = 'RESULTS',
}

export enum GameType {
  JENGA = 'JENGA',
  FISHING = 'FISHING',
  ESM_FAMIL = 'ESM_FAMIL',
  GENERIC = 'GENERIC', 
  NONE = 'NONE'
}

export enum UniversalGameType {
  NONE = 'NONE',
  MASH = 'MASH', // Tap fast (Arm wrestle, Race)
  REFLEX = 'REFLEX', // Reaction time (Slap, Duel)
  LUCK = 'LUCK', // Dice, Coin, Spin
  MEMORY = 'MEMORY', // Memory cards
  QUIZ = 'QUIZ', // Simple Question/Answer or Instruction
}

export interface Player {
  id: number;
  name: string;
  avatarId: string;
  color: string;
  score: number;
}

export interface GameConfig {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  type: GameType;
  universalType?: UniversalGameType; // To map generic games to logic
  description: string;
  icon: string;
}

export interface Character {
  id: string;
  name: string; 
  svg: string; 
  color: string;
}
