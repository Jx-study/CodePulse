import type { LevelProgress } from "@/types";

/**
 * 關卡是否已開始：學完教學、提交過練習，或已進入練習頁（startLevel 會先寫入 in-progress）。
 * 節點外觀與建議節點共用這個判斷，兩邊才不會對不上。
 */
export function isLevelStarted(progress: LevelProgress | undefined): boolean {
  return (
    progress?.teachingCompleted === true ||
    (progress?.attempts ?? 0) > 0 ||
    progress?.status === "in-progress"
  );
}
