
import { Character, GameConfig, GameType, UniversalGameType } from './types';

export const CHARACTERS: Character[] = [
  { id: 'c1', name: 'شیر', svg: '🦁', color: 'bg-yellow-400' },
  { id: 'c2', name: 'خرگوش', svg: '🐰', color: 'bg-pink-300' },
  { id: 'c3', name: 'روباه', svg: '🦊', color: 'bg-orange-500' },
  { id: 'c4', name: 'خرس', svg: '🐻', color: 'bg-amber-600' },
  { id: 'c5', name: 'پاندا', svg: '🐼', color: 'bg-slate-700' },
  { id: 'c6', name: 'ببر', svg: '🐯', color: 'bg-orange-400' },
  { id: 'c7', name: 'قورباغه', svg: '🐸', color: 'bg-green-500' },
  { id: 'c8', name: 'اختاپوس', svg: '🐙', color: 'bg-purple-500' },
  { id: 'c9', name: ' تک‌شاخ', svg: '🦄', color: 'bg-indigo-300' },
  { id: 'c10', name: 'دایناسور', svg: '🦖', color: 'bg-emerald-600' },
  { id: 'c11', name: 'کوالا', svg: '🐨', color: 'bg-slate-400' },
  { id: 'c12', name: 'موش', svg: '🐭', color: 'bg-zinc-300' },
];

export const ESM_FAMIL_FIELDS = [
  'اسم', 'فامیل', 'میوه', 'رنگ', 'ماشین', 'حیوان', 'شهر', 'کشور', 'غذا', 'اشیا'
];

// Helper
const createGame = (id: string, name: string, icon: string, players: number, description: string, uniType: UniversalGameType = UniversalGameType.NONE): GameConfig => ({
  id, name, icon, 
  minPlayers: players === 1 ? 1 : players === 2 ? 2 : 1, 
  maxPlayers: players, 
  description, 
  type: GameType.GENERIC,
  universalType: uniType
});

export const GAMES: GameConfig[] = [
  // --- MANDATORY FULL GAMES ---
  {
    id: 'jenga',
    name: 'برج هیجان',
    minPlayers: 1,
    maxPlayers: 4,
    type: GameType.JENGA,
    description: 'بلوک‌ها را با دقت بردارید تا برج نریزد!',
    icon: '🧱',
  },
  {
    id: 'fishing',
    name: 'ماهیگیری',
    minPlayers: 1,
    maxPlayers: 4,
    type: GameType.FISHING,
    description: 'بیشترین ماهی را در زمان کم صید کنید.',
    icon: '🎣',
  },
  {
    id: 'esmfamil',
    name: 'اسم و فامیل',
    minPlayers: 2,
    maxPlayers: 4,
    type: GameType.ESM_FAMIL,
    description: 'کلمات را سریع‌تر از بقیه پیدا کنید.',
    icon: '📝',
  },

  // --- PLAYABLE GENERIC GAMES ---
  // Mash Games (Tapping)
  createGame('arm_wrestle', 'مچ اندازی', '💪', 2, 'سریع ضربه بزنید تا دست حریف بخوابد!', UniversalGameType.MASH),
  createGame('tug_war', 'طناب‌کشی', '🪢', 2, 'زورآزمایی با سرعت انگشت.', UniversalGameType.MASH),
  createGame('race', 'دوی سرعت', '🏃', 4, 'کی از همه سریعتره؟', UniversalGameType.MASH),
  createGame('typing', 'تایپ سرعتی', '⌨️', 1, 'چقدر سریع میتونی تایپ کنی؟', UniversalGameType.MASH), // Simpler version
  createGame('whack_mole', 'موش‌کوب', '🔨', 1, 'ضربه بزن و امتیاز بگیر.', UniversalGameType.MASH),

  // Reflex Games
  createGame('reaction', 'سرعت عمل', '⚡', 4, 'وقتی سبز شد ضربه بزن!', UniversalGameType.REFLEX),
  createGame('slap', 'نوشابه', '✋', 2, 'اولین نفر نوشابه رو برداره!', UniversalGameType.REFLEX),
  createGame('duel', 'دوئل کابوی', '🤠', 2, 'توی لحظه مناسب شلیک کن.', UniversalGameType.REFLEX),
  createGame('musical_chairs', 'صندلی بازی', '🪑', 4, 'آهنگ قطع شد دکمه رو بزن!', UniversalGameType.REFLEX),

  // Luck / Tools
  createGame('spin_bottle', 'گردونه شانس', '🎡', 4, 'گردونه رو بچرخون ببین چی میشه.', UniversalGameType.LUCK),
  createGame('dice_roll', 'تاس‌انداز', '🎲', 4, 'برای بازی‌های فکری تاس بنداز.', UniversalGameType.LUCK),
  createGame('coin_flip', 'شیر یا خط', '🪙', 2, 'شانس خودت رو امتحان کن.', UniversalGameType.LUCK),
  createGame('ludo', 'منچ (تاس)', '🎲', 4, 'تاس دیجیتال برای منچ.', UniversalGameType.LUCK),
  createGame('snakes', 'مار و پله (تاس)', '🐍', 4, 'تاس بنداز و برو جلو.', UniversalGameType.LUCK),
  createGame('bottle', 'بطری بازی', '🍾', 4, 'بطری به سمت کی میایسته؟', UniversalGameType.LUCK),

  // Memory
  createGame('memory', 'حافظه تصویری', '🧠', 1, 'جای کارت‌ها را به خاطر بسپارید.', UniversalGameType.MEMORY),
  createGame('simon_says', 'ترتیب رنگ‌ها', '🎨', 1, 'ترتیب رنگ‌ها رو یادت بمونه.', UniversalGameType.MEMORY), // Simplified to cards

  // Quiz / Party Prompts
  createGame('pantomime', 'پانتومیم', '🎭', 4, 'سوژه رو اجرا کن!', UniversalGameType.QUIZ),
  createGame('mafia_help', 'راوی مافیا', '🕵️', 4, 'مدیریت نقش‌ها و فاز شب.', UniversalGameType.QUIZ),
  createGame('truth_dare', 'جرئت حقیقت', '😈', 4, 'سوالات چالشی بپرس.', UniversalGameType.QUIZ),
  createGame('charades', 'ادا بازی', '🤪', 4, 'ضرب‌المثل‌ها را اجرا کنید.', UniversalGameType.QUIZ),
  
  // Others (Still placeholders or mapped to nearest logic)
  createGame('bomb_squad', 'خنثی‌سازی بمب', '💣', 4, 'سیم درست رو ببر!', UniversalGameType.LUCK), // Luck based
  createGame('rps', 'سنگ کاغذ قیچی', '✂️', 2, 'مبارزه کلاسیک.', UniversalGameType.LUCK), // Can be randomized cards
  
  createGame('gol_pooch', 'گل یا پوچ', '✊', 2, 'گل دست کیه؟', UniversalGameType.LUCK),
  createGame('spy', 'جاسوس', '🕶️', 4, 'جاسوس رو پیدا کن.', UniversalGameType.QUIZ),
  
  createGame('tictactoe', 'دوز (XO)', '❌', 2, 'سه تا در یک ردیف بچینید.', UniversalGameType.NONE), // Needs custom logic later
  createGame('air_hockey', 'هاکی روی میز', '🏒', 2, 'توپ را وارد دروازه حریف کنید.', UniversalGameType.MASH), // Simplified
  createGame('pong', 'پینگ پنگ', '🏓', 2, 'توپ را در بازی نگه دارید.', UniversalGameType.REFLEX),
  createGame('dots_boxes', 'نقطه بازی', '📦', 2, 'بیشترین مربع را تصاحب کنید.', UniversalGameType.NONE),
  
  createGame('sudoku', 'سودوکو', '🔢', 1, 'جدول اعداد را حل کنید.', UniversalGameType.NONE),
  createGame('2048', '۲۰۴۸', '2️⃣', 1, 'اعداد را جمع کنید.', UniversalGameType.NONE),
  
  createGame('math_quiz', 'کوییز ریاضی', '➗', 1, 'ذهن خود را به چالش بکشید.', UniversalGameType.QUIZ),
  createGame('color_blind', 'تست کوررنگی', '👁️', 1, 'رنگ متفاوت را پیدا کنید.', UniversalGameType.NONE),
];
