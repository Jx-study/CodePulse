// 共用導覽引擎的型別定義。
// 互動欄位皆為選用：不傳時 step 為傳統線性步驟（Next/Previous）。

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** 目標元素的 CSS selector，例：[data-tour="run-button"] */
  targetSelector: string;
  /** 選用：第二個 spotlight 目標，用於需要同時標記兩個元素的步驟 */
  secondaryTargetSelector?: string;
  placement: 'top' | 'bottom' | 'left' | 'right';

  // ── 互動模式（方向 B）選用欄位 ──
  /** true 時隱藏 Next 按鈕，改顯示「等待操作…」提示與「跳過此步」連結 */
  interactive?: boolean;
  /**
   * 互動 step 的前進條件。引擎在 rAF loop 內檢查，回傳 true 時自動前進。
   * 由呼叫端傳入閉包（例：() => runStage !== 'idle'）。
   */
  advanceWhen?: () => boolean;
  /** 進入此 step 時觸發一次，用來驅動 UI（例：切 tab、展開面板） */
  onEnter?: () => void;
  /**
   * 互動 step 按「跳過此步」時呼叫。
   * 通常用來跳過後面所有資料相依步驟、直接關閉導覽。
   */
  onSkipStep?: () => void;
  /**
   * 互動 step 等待期間的子狀態。引擎用來切換吉祥物 running / error 外觀。
   * 回傳 'error' 顯示報錯吉祥物與提示；其餘（'running' / 'idle'）顯示陪伴等待。
   * 由呼叫端傳入閉包（例：() => lastRunOutcome === 'error' ? 'error' : 'running'）。
   */
  waitingState?: () => 'running' | 'error' | 'idle';
}

export interface TourEngineProps {
  isOpen: boolean;
  steps: TourStep[];
  /** 完成最後一步（按收尾卡主按鈕）時呼叫 */
  onComplete: () => void;
  /** 關閉導覽（×／Esc／收尾卡次按鈕）時呼叫 */
  onSkip: () => void;
  /** 收尾卡主按鈕文字，預設「完成」 */
  finalPrimaryLabel?: string;
  /** 收尾卡次按鈕文字，預設「關閉」 */
  finalSecondaryLabel?: string;
  /** 收尾卡標題，預設「準備好了嗎？」 */
  finalTitle?: string;
  /** 收尾卡說明文字 */
  finalDescription?: string;
  /** 選用：底部加「不再顯示」按鈕，按下時呼叫 */
  onDontShowAgain?: () => void;
  /**
   * 選用：暫停導覽。為 true 時隱藏 spotlight/tooltip 並停止 rAF 追蹤，
   * 但**不重設步驟**（與 isOpen 分離）。用於外層彈出對話框等情境暫時讓位，
   * 對話框關閉後（isPaused 回 false）恢復停在原本的 step。
   */
  isPaused?: boolean;
}
