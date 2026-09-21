/**
 * 共用的 motion/react 動畫時間常數。
 *
 * 只收錄「多個元件各自重複寫出同一個字面值」的情況（duration、ease 曲線）。
 * stagger 節奏（如 idx * 0.01 vs index * 0.05）與 spring 的 stiffness/damping
 * 等每個元件只用一次、明顯是針對該情境調過的數值，刻意不歸納到這裡——
 * 那些差異看起來是刻意設計（密集網格需要更快的 stagger、不同互動想要不同的
 * 彈性手感），沒有實際視覺比對前不應該被silently 統一掉。
 */

// 對應 SCSS 的 $ease-smooth（見 frontend/src/shared/styles/_variables.scss）
export const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const;

export const DURATION_FAST = 0.2;
export const DURATION_BASE = 0.3; // 對應 SCSS 的 $transition-base 時長
export const DURATION_SLOW = 0.4;
