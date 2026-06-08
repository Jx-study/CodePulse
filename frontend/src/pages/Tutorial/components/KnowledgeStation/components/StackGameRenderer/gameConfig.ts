import type { PopupType, PopupSize } from "@/types/games/stackGameTypes";
import type { IconName } from "@/shared/lib/iconMap";

export interface PopupDefinition {
  type: PopupType;
  titleKey: string;
  iconName: IconName;
  size: PopupSize;
}

export interface ResolvedPopupDefinition extends Omit<PopupDefinition, 'titleKey'> {
  title: string;
}

export interface SpawnChildItem {
  def: ResolvedPopupDefinition;
  position?: { x: number; y: number };
}

// Push 順序：index 0 = 最先推入（在 stack 底部，最後關閉）
export const POPUP_SEQUENCE: PopupDefinition[] = [
  { type: "speed-test",      titleKey: "speedTest",      iconName: "stopwatch",        size: { w: 300, h: 200 } },
  { type: "random-walk",     titleKey: "randomWalk",     iconName: "person-running",   size: { w: 280, h: 180 } },
  { type: "quiz",            titleKey: "quiz",           iconName: "book-open",        size: { w: 340, h: 240 } },
  { type: "boss",            titleKey: "boss",           iconName: "ghost",            size: { w: 320, h: 220 } },
  { type: "sine-wave",       titleKey: "sineWave",       iconName: "wave-square",      size: { w: 260, h: 160 } },
  { type: "corner-teleport", titleKey: "cornerTeleport", iconName: "shuffle",          size: { w: 280, h: 180 } },
  { type: "tv-bouncing",     titleKey: "tvBouncing",     iconName: "tv",               size: { w: 300, h: 200 } },
  { type: "bouncing-h",      titleKey: "bouncingH",      iconName: "right-left",       size: { w: 280, h: 160 } },
  { type: "hidden-close",    titleKey: "hiddenClose",    iconName: "magnifying-glass", size: { w: 300, h: 220 } },
];

export const RULES_POPUP: PopupDefinition = {
  type: "rules",
  titleKey: "rules",
  iconName: "file-lines",
  size: { w: 380, h: 300 },
};

export const CONGRATS_POPUP: PopupDefinition = {
  type: "congrats",
  titleKey: "congrats",
  iconName: "trophy",
  size: { w: 340, h: 240 },
};

export const GAME_DURATION_SECONDS = 120;
export const POPUP_PUSH_INTERVAL_MS = 250;
export const TIMER_BAR_H = 36; // 計時列高度（做下界用）

export const MINION_POPUP_SIZE = { w: 220, h: 120 };
export const SINE_CHILD_POPUP_SIZE = { w: 180, h: 100 };
export const NORMAL_POPUP_SIZE = { w: 200, h: 140 };
