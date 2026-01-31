import type { Level } from '@/types';
import {
  getLayoutConfig,
  getHorizontalOffset,
  getVerticalSpacing,
  type LayoutConfig,
} from './layoutConfig';

export interface NodePosition {
  x: string;              // CSS 位置（例：'calc(50% - 120px)'）
  y: number;              // 像素值
  alignment: 'left' | 'right' | 'center'; // 水平對齊方式
}

// 向後兼容：使用響應式配置的預設值
const getDefaultVerticalSpacing = () => getVerticalSpacing();
const getDefaultHorizontalOffset = () => getHorizontalOffset();

/**
 * 計算關卡節點的位置（由下而上，左右交錯）- v1.0 兼容模式
 * @param levelIndex 關卡索引（0-based）
 * @param totalLevels 總關卡數
 * @param config 可選的佈局配置（不提供則使用響應式預設值）
 * @returns NodePosition 節點位置資訊
 */
export const calculateNodePosition = (
  levelIndex: number,
  totalLevels: number,
  config?: LayoutConfig
): NodePosition => {
  const verticalSpacing = config ? config.layerSpacing : getDefaultVerticalSpacing();
  const horizontalOffset = config ? getHorizontalOffset(config) : getDefaultHorizontalOffset();

  // 由下而上：第一關（index 0）在最底部
  // y 座標 = (總關卡數 - 當前索引 - 1) × 垂直間距
  const y = (totalLevels - levelIndex - 1) * verticalSpacing;

  // 左右交錯：偶數索引在左，奇數索引在右
  const alignment = levelIndex % 2 === 0 ? 'left' : 'right';
  const x = alignment === 'left'
    ? `calc(50% - ${horizontalOffset}px)`
    : `calc(50% + ${horizontalOffset}px)`;

  return { x, y, alignment };
};

/**
 * 多分支佈局計算
 * 根據 graphPosition 計算節點位置
 * @param level 目標關卡
 * @param levels 所有關卡
 * @param config 可選的佈局配置（不提供則使用響應式預設值）
 */
export const calculateGraphNodePosition = (
  level: Level,
  levels: Level[],
  config?: LayoutConfig
): NodePosition => {
  const layoutConfig = config ?? getLayoutConfig();
  const graphPos = level.graphPosition;

  // 如果沒有 graphPosition，退回到舊邏輯
  if (!graphPos) {
    const index = levels.findIndex((l) => l.id === level.id);
    return calculateNodePosition(index, levels.length, layoutConfig);
  }

  // 只計算同一類別的關卡
  const sameCategoryLevels = levels.filter((l) => l.category === level.category);

  // 計算該類別的最大 layer
  const maxLayer = Math.max(
    ...sameCategoryLevels.map((l) => l.graphPosition?.layer ?? 0)
  );

  // y 座標：由下而上，layer 0 在最底部（y=0）
  // 注意：這裡不使用 categoryOffset，因為我們希望所有類別都從底部開始
  const y = (maxLayer - graphPos.layer) * layoutConfig.layerSpacing;

  // x 座標：基於前置節點的位置繼承
  const { x, alignment } = calculateBranchX(level, sameCategoryLevels, layoutConfig);

  return { x, y, alignment };
};


/**
 * 從 calc 表達式中提取偏移量（像素值）
 * @param calcStr CSS calc 字串
 * @returns 相對於 50% 的偏移量（負數表示左，正數表示右，0 表示中心）
 */
function extractOffsetFromCalc(calcStr: string): number {
  if (calcStr === '50%') {
    return 0;
  }

  const match = calcStr.match(/calc\(50%\s*([+-])\s*(-?\d+)px\)/);
  if (!match) {
    return 0;
  }

  const operator = match[1];
  const offset = parseInt(match[2]);
  return operator === '-' ? -offset : offset;
}

/**
 * 將偏移量轉換為 calc 表達式
 * @param offset 相對於 50% 的偏移量
 * @returns CSS calc 字串和對齊方式
 */
function offsetToCalc(offset: number): { x: string; alignment: 'left' | 'right' | 'center' } {
  if (offset === 0) {
    return { x: '50%', alignment: 'center' };
  }

  const operator = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);

  return {
    x: `calc(50% ${operator} ${absOffset}px)`,
    alignment: offset < 0 ? 'left' : 'right',
  };
}

/**
 * 計算分支的 X 座標 - v3.0 優先使用 horizontalIndex，否則基於前置節點繼承
 *
 * 計算邏輯優先順序：
 * 1. 如果有 horizontalIndex：使用精確定位（支援同層多節點，如 ghost nodes）
 * 2. 如果無前置節點（Portal/起點）：置中
 * 3. 如果有前置節點：繼承父節點位置，choice-point 時根據兄弟節點數量分配
 *
 * @param currentLevel 當前關卡
 * @param sameCategoryLevels 同類別的所有關卡（已篩選）
 * @param config 佈局配置
 */
function calculateBranchX(
  currentLevel: Level,
  sameCategoryLevels: Level[],
  config: LayoutConfig
): { x: string; alignment: 'left' | 'right' | 'center' } {
  const graphPos = currentLevel.graphPosition;

  if (!graphPos) {
    return { x: '50%', alignment: 'center' };
  }

  const { layer, horizontalIndex } = graphPos;
  const nodeSpacing = config.nodeSpacing;
  const horizontalOffset = getHorizontalOffset(config);
  const spacing = nodeSpacing > 0 ? nodeSpacing : horizontalOffset;

  // ========== 1. 優先檢查 horizontalIndex（精確定位） ==========
  if (horizontalIndex !== undefined) {
    // 找出同一層的所有有 horizontalIndex 的節點
    const sameLayerLevels = sameCategoryLevels.filter(
      (l) => l.graphPosition?.layer === layer && l.graphPosition?.horizontalIndex !== undefined
    );

    // 按 horizontalIndex 排序
    const sortedLevels = [...sameLayerLevels].sort(
      (a, b) => (a.graphPosition?.horizontalIndex ?? 0) - (b.graphPosition?.horizontalIndex ?? 0)
    );

    const totalNodes = sortedLevels.length;

    // 找到當前節點在排序後的位置
    const currentIndex = sortedLevels.findIndex((l) =>
      l.graphPosition?.horizontalIndex === horizontalIndex && l.id === currentLevel.id
    );

    if (currentIndex !== -1 && totalNodes > 0) {
      // 計算中心點（0-based）
      const centerIndex = (totalNodes - 1) / 2;
      const offset = (currentIndex - centerIndex) * spacing;

      return offsetToCalc(offset);
    }
  }

  // ========== 2. 檢查前置節點 ==========
  const prerequisites = currentLevel.prerequisites;
  const prerequisiteNodes = prerequisites?.levelIds
    ?.map(id => sameCategoryLevels.find(l => l.id === id))
    .filter(Boolean) as Level[] | undefined;

  // 2a. 無前置節點（Portal Node / 起點）：置中
  if (!prerequisiteNodes || prerequisiteNodes.length === 0) {
    return { x: '50%', alignment: 'center' };
  }

  // 2b. 單一前置節點：檢查是否為 choice-point
  if (prerequisiteNodes.length === 1) {
    const parentNode = prerequisiteNodes[0];

    // 找出所有從該前置節點分出的同層子節點（且沒有 horizontalIndex）
    const siblingNodes = sameCategoryLevels.filter(l =>
      l.prerequisites?.levelIds.includes(parentNode.id) &&
      l.graphPosition?.layer === layer &&
      l.graphPosition?.horizontalIndex === undefined
    );

    // 只有一個子節點：直接繼承父節點的 x 位置
    if (siblingNodes.length === 1) {
      return calculateBranchX(parentNode, sameCategoryLevels, config);
    }

    // 多個子節點（choice-point）：根據兄弟節點分配位置
    const sortedSiblings = [...siblingNodes].sort((a, b) => a.id.localeCompare(b.id));
    const currentIndex = sortedSiblings.findIndex(l => l.id === currentLevel.id);

    if (currentIndex !== -1) {
      // 獲取父節點的偏移量
      const parentX = calculateBranchX(parentNode, sameCategoryLevels, config);
      const parentOffset = extractOffsetFromCalc(parentX.x);

      // 計算子節點的分布（以父節點為中心）
      const totalNodes = sortedSiblings.length;
      const centerIndex = (totalNodes - 1) / 2;
      const relativeOffset = (currentIndex - centerIndex) * spacing;
      const finalOffset = parentOffset + relativeOffset;

      return offsetToCalc(finalOffset);
    }
  }

  // 2c. 多個前置節點（convergence）：計算它們的中心位置
  if (prerequisiteNodes.length > 1) {
    const parentOffsets = prerequisiteNodes.map(node => {
      const pos = calculateBranchX(node, sameCategoryLevels, config);
      return extractOffsetFromCalc(pos.x);
    });

    const averageOffset = parentOffsets.reduce((sum, offset) => sum + offset, 0) / parentOffsets.length;

    return offsetToCalc(averageOffset);
  }

  // Fallback: 置中
  return { x: '50%', alignment: 'center' };
}

/**
 * 計算貝塞爾曲線控制點
 * @param from 起始節點位置
 * @param to 目標節點位置
 * @returns SVG path 的 d 屬性值
 */
export const calculatePathD = (
  from: { x: number; y: number },
  to: { x: number; y: number }
): string => {
  const controlPointOffset = 50; // 控制點偏移量

  // 計算控制點（讓曲線更平滑）
  const cp1x = from.x;
  const cp1y = from.y - controlPointOffset;
  const cp2x = to.x;
  const cp2y = to.y + controlPointOffset;

  // 使用三次貝塞爾曲線
  return `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;
};

/**
 * 將 CSS calc 表達式轉換為實際像素值（用於 SVG 路徑計算）
 * @param calcStr CSS calc 字串（例：'calc(50% - 120px)'）
 * @param containerWidth 容器寬度
 * @returns 計算後的像素值
 */
export const resolveCalcToPixels = (calcStr: string, containerWidth: number): number => {
  // 增強版 Regex：支援標準格式 'calc(50% ± Xpx)' 以及可能的負數
  const match = calcStr.match(/calc\(50%\s*([+-])\s*(-?\d+)px\)/);

  if (!match) {
    // 如果不是 calc 表達式，檢查是否為純 50%
    if (calcStr === '50%') {
      return containerWidth / 2;
    }
    // Fallback: 回傳容器中心
    return containerWidth / 2;
  }

  const operator = match[1];
  const offset = parseInt(match[2]); // parseInt 會自動處理負號
  const halfWidth = containerWidth / 2;

  // 處理運算符：如果原本是 calc(50% + -120px)，operator 是 '+'，offset 是 -120
  return operator === '-' ? halfWidth - offset : halfWidth + offset;
};

/**
 * 計算內容的邊界範圍
 * @param levels 所有關卡
 * @param config 可選的佈局配置
 * @returns 內容的最小和最大 y 座標（考慮節點高度和偏移）
 */
export const calculateContentBounds = (
  levels: Level[],
  config?: LayoutConfig
): { minY: number; maxY: number } => {
  if (levels.length === 0) {
    return { minY: 0, maxY: 0 };
  }

  const layoutConfig = config ?? getLayoutConfig();
  let minY = Infinity;
  let maxY = -Infinity;

  levels.forEach((level, index) => {
    const position = level.graphPosition
      ? calculateGraphNodePosition(level, levels, layoutConfig)
      : calculateNodePosition(index, levels.length, layoutConfig);

    // 節點使用 translateY(-50%) 偏移，所以需要考慮節點高度的一半
    // PortalNode: 100px, LevelNode: 80px，取最大值 100px
    const nodeHalfHeight = 50; // 100px / 2

    // 實際的頂部位置 = position.y - nodeHalfHeight
    // 實際的底部位置 = position.y + nodeHalfHeight
    minY = Math.min(minY, position.y - nodeHalfHeight);
    maxY = Math.max(maxY, position.y + nodeHalfHeight);
  });

  return { minY, maxY };
};
