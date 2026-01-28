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
  return levels.filter((level) => level.category === category);
}

/**
 * 驗證關卡依賴圖是否有循環依賴（使用 Kahn's Algorithm - BFS 拓撲排序）
 * @returns { isValid: boolean, cycle?: string[] } - 是否有效，若無效則返回循環路徑
 */
export function validateGraphAcyclic(
  levels: Level[]
): { isValid: boolean; cycle?: string[] } {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  // 初始化入度和鄰接表
  for (const level of levels) {
    inDegree.set(level.id, 0);
    adjList.set(level.id, []);
  }

  // 建立圖結構：從前置關卡指向當前關卡
  for (const level of levels) {
    const prereq = level.prerequisites;
    if (prereq && prereq.type !== 'NONE') {
      for (const prereqId of prereq.levelIds) {
        // prereqId -> level.id
        adjList.get(prereqId)?.push(level.id);
        inDegree.set(level.id, (inDegree.get(level.id) || 0) + 1);
      }
    }
  }

  // BFS - Kahn's Algorithm
  const queue: string[] = [];
  const processed: string[] = [];

  // 將所有入度為 0 的節點加入隊列
  for (const [levelId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(levelId);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    processed.push(current);

    // 處理所有鄰接節點
    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // 如果處理的節點數量不等於總節點數，表示有循環
  if (processed.length !== levels.length) {
    // 找出未被處理的節點（即參與循環的節點）
    const unprocessed = levels
      .map((l) => l.id)
      .filter((id) => !processed.includes(id));

    return { isValid: false, cycle: unprocessed };
  }

  return { isValid: true };
}

/**
 * 取得所有依賴某關卡的後續關卡（反向依賴查詢）
 * @param levelId - 目標關卡 ID
 * @param levels - 所有關卡
 * @returns 依賴該關卡的所有關卡 ID 列表
 */
export function getDependentLevels(levelId: string, levels: Level[]): string[] {
  const dependents: string[] = [];

  for (const level of levels) {
    const prereq = level.prerequisites;
    if (!prereq || prereq.type === 'NONE') continue;

    if (prereq.levelIds.includes(levelId)) {
      dependents.push(level.id);
    }
  }

  return dependents;
}
