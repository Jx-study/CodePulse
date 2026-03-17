export interface CardItem {
  id: number;
  type: 'cat' | 'dog';
  url: string;
}

export interface GameConfig {
  spawnRateMs: number;
  maxQueueSize: number;
  surviveSeconds: number;
}

export type GameStatus = 'idle' | 'playing' | 'survived' | 'gameover';
export type SwipeDir = 'left' | 'right';
export type FeedbackType = 'correct' | 'wrong' | 'overflow' | null;

export interface GameState {
  status: GameStatus;
  queue: CardItem[];
  hp: number;
  score: number;
  timeLeft: number;
  feedback: FeedbackType;
}
