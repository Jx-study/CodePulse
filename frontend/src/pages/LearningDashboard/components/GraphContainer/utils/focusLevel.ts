import type { Level, UserProgress } from "@/types";

/**
 * 初始鏡頭要對準的關卡 index。
 * 有建議節點就對準它；沒有（全部通過或沒有可練的）就找第一個沒通過的已開發關卡，再沒有就對準最後一關。
 */
export function getFocusLevelIndex(
  levels: Level[],
  userProgress: UserProgress,
  focusLevelId: string | null | undefined,
): number {
  if (focusLevelId) {
    const index = levels.findIndex((level) => level.id === focusLevelId);
    if (index !== -1) return index;
  }

  const firstUnfinished = levels.findIndex(
    (level) =>
      level.isDeveloped &&
      level.pathMetadata?.pathType !== "portal" &&
      userProgress.levels[level.id]?.status !== "completed",
  );
  return firstUnfinished !== -1 ? firstUnfinished : levels.length - 1;
}
