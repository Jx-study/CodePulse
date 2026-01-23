import type { Level, UserProgress } from '@/types';

/**
 * 檢查關卡是否解鎖（根據 AND/OR 前置邏輯）
 */
export function isLevelUnlocked(
  level: Level,
  userProgress: UserProgress
): boolean {
  const prereq = level.prerequisites;

  // 無前置條件 = 永遠解鎖
  if (!prereq || prereq.type === 'NONE' || prereq.levelIds.length === 0) {
    return true;
  }

  const isCompleted = (levelId: string): boolean => {
    return userProgress.levels[levelId]?.status === 'completed';
  };

  if (prereq.type === 'AND') {
    // AND 邏輯：需要完成所有前置關卡
    return prereq.levelIds.every(isCompleted);
  }

  if (prereq.type === 'OR') {
    // OR 邏輯：完成任一前置關卡即可
    return prereq.levelIds.some(isCompleted);
  }

  return false;
}

/**
 * 計算所有關卡的解鎖狀態
 */
export function computeAllUnlockStatus(
  levels: Level[],
  userProgress: UserProgress
): (Level & { isUnlocked: boolean })[] {
  return levels.map((level) => ({
    ...level,
    isUnlocked: isLevelUnlocked(level, userProgress),
  }));
}

/**
 * 取得關卡的未完成前置關卡名稱（用於顯示提示）
 */
export function getUncompletedPrerequisites(
  level: Level,
  levels: Level[],
  userProgress: UserProgress
): string[] {
  const prereq = level.prerequisites;
  if (!prereq || prereq.type === 'NONE') return [];

  const levelMap = new Map(levels.map((l) => [l.id, l]));

  return prereq.levelIds
    .filter((id) => userProgress.levels[id]?.status !== 'completed')
    .map((id) => levelMap.get(id)?.name || id);
}

/**
 * 根據 category 篩選關卡
 */
export function filterLevelsByCategory(
  levels: Level[],
  category: string
): Level[] {
  if (category === 'all') return levels;
  return levels.filter((level) => level.category === category);
}
