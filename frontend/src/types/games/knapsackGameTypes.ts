export interface InvestmentItem {
  id: number;
  name: string;
  weight: number;
  value: number;
  emoji: string;
}

export interface DPResult {
  maxValue: number;
  selectedIds: number[];
}

export interface SelectionStat {
  totalWeight: number;
  totalValue: number;
}

export type GameStatus = "idle" | "playing" | "won";

export interface GameState {
  status: GameStatus;
  selectedIds: Set<number>;
  budget: number;
  showOptimal: boolean;
}
