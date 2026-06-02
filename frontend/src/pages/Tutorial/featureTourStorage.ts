// 操作導覽「不再顯示」偏好的 localStorage 存取工具。
// 沿用 ThemeContext 的具名常數 + try/catch 慣例，避免隱私模式存取拋錯。

const STORAGE_KEY = 'codepulse:tutorial-tour-dismissed';

/**
 * 讀取使用者是否已按過「不再顯示」。
 * 讀取失敗（如隱私模式）一律視為「未關閉」，讓導覽照常自動彈出。
 */
export function getTourDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * 記下使用者已按「不再顯示」，之後不再自動彈出導覽。
 * 寫入失敗時靜默忽略（不影響當次關閉導覽的行為）。
 */
export function setTourDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {
    // 隱私模式等情境寫入失敗：忽略，當次仍會關閉導覽
  }
}
