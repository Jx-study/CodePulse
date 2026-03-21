import type { IconName } from '@/shared/lib/iconMap';

export type GameStatus = 'idle' | 'intro' | 'playing' | 'congrats' | 'won' | 'failed';

export type PopupType =
  | 'rules'
  | 'normal'
  | 'hidden-close'
  | 'bouncing-h'
  | 'tv-bouncing'
  | 'corner-teleport'
  | 'boss'
  | 'minion'
  | 'sine-wave'
  | 'sine-child'
  | 'quiz'
  | 'random-walk'
  | 'speed-test'
  | 'speed-test-child'
  | 'warning'
  | 'congrats';

export interface PopupPosition {
  x: number;
  y: number;
}

export interface PopupSize {
  w: number;
  h: number;
}

export interface PopupInstance {
  id: string;
  type: PopupType;
  title: string;
  iconName: IconName;
  position: PopupPosition;
  size: PopupSize;
  isCloseable: boolean;
  typeState: PopupTypeState;
}

export type PopupTypeState =
  | { kind: 'default' }
  | { kind: 'corner-teleport'; clicksRemaining: number; cornerIndex: 0 | 1 | 2 | 3 }
  | { kind: 'boss'; minionsSpawned: boolean; minionsRemaining: number }
  | { kind: 'sine-wave'; childrenSpawned: boolean; childrenRemaining: number }
  | { kind: 'quiz'; selectedAnswer: string | null; isCorrect: boolean }
  | {
      kind: 'speed-test';
      activatedAt: number | null;
      spawnedCount: number;
      isLocked: boolean;
    }
  | { kind: 'speed-test-child'; parentId: string }
  | { kind: 'minion'; parentId: string }
  | { kind: 'sine-child'; parentId: string }
  | { kind: 'bouncing'; vx: number; vy: number }
  | { kind: 'random-walk'; targetX: number; targetY: number }
  | { kind: 'warning'; blockedPopupTitle: string };

export interface GameState {
  status: GameStatus;
  stack: string[];
  popups: Map<string, PopupInstance>;
  timeLeft: number;
  closeHistory: number[];
  lastCloseTime: number | null;
  wonAt: number | null;
  startTime: number | null;
}
