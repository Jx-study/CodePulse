import type { PopupType, PopupSize } from "@/types/games/stackGameTypes";

export interface PopupDefinition {
  type: PopupType;
  title: string;
  size: PopupSize;
}

export interface SpawnChildItem {
  def: PopupDefinition;
  position?: { x: number; y: number };
}

// Push 順序：index 0 = 最先推入（在 stack 底部，最後關閉）
export const POPUP_SEQUENCE: PopupDefinition[] = [
  { type: "speed-test", title: "⏱️ 手速測驗", size: { w: 300, h: 200 } },
  { type: "random-walk", title: "🏃 抓不到我！", size: { w: 280, h: 180 } },
  { type: "quiz", title: "📚 資料結構小測驗", size: { w: 340, h: 240 } },
  { type: "boss", title: "👾 大魔王彈窗", size: { w: 320, h: 220 } },
  { type: "sine-wave", title: "〰️ 正弦波攻擊！", size: { w: 260, h: 160 } },
  { type: "corner-teleport", title: "🔀 角落鬼影", size: { w: 280, h: 180 } },
  { type: "tv-bouncing", title: "📺 老舊電視", size: { w: 300, h: 200 } },
  { type: "bouncing-h", title: "⬅️ 彈彈彈！", size: { w: 280, h: 160 } },
  { type: "hidden-close", title: "🔍 找找關閉按鈕", size: { w: 300, h: 220 } },
];

export const RULES_POPUP: PopupDefinition = {
  type: "rules",
  title: "📋 遊戲規則",
  size: { w: 380, h: 300 },
};

export const CONGRATS_POPUP: PopupDefinition = {
  type: "congrats",
  title: "🎉 恭喜過關！",
  size: { w: 340, h: 240 },
};

export const GAME_DURATION_SECONDS = 120;
export const POPUP_PUSH_INTERVAL_MS = 250;
export const TIMER_BAR_H = 36; // 計時列高度（做下界用）

export const MINION_POPUP_SIZE = { w: 220, h: 120 };
export const SINE_CHILD_POPUP_SIZE = { w: 180, h: 100 };
export const NORMAL_POPUP_SIZE = { w: 200, h: 140 };
