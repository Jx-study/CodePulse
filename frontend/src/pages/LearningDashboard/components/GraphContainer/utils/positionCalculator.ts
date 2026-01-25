import type { Level, GraphPosition } from '@/types';
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
 * v2.0 多分支佈局計算
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

  // x 座標：根據 branch 和 horizontalIndex 計算（只看同類別同層）
  const { x, alignment } = calculateBranchX(graphPos, sameCategoryLevels, layoutConfig);

  return { x, y, alignment };
};


/**
 * 計算分支的 X 座標
 * @param graphPos 當前節點的圖位置
 * @param sameCategoryLevels 同類別的所有關卡（已篩選）
 * @param config 佈局配置
 */
function calculateBranchX(
  graphPos: GraphPosition,
  sameCategoryLevels: Level[],
  config: LayoutConfig
): { x: string; alignment: 'left' | 'right' | 'center' } {
  const { branch, layer, horizontalIndex } = graphPos;
  const horizontalOffset = getHorizontalOffset(config);

  // 找出同一層的所有節點（同類別內）
  const sameLayerLevels = sameCategoryLevels.filter(
    (l) => l.graphPosition?.layer === layer
  );

  // 單一節點置中
  if (sameLayerLevels.length === 1) {
    return { x: '50%', alignment: 'center' };
  }

  // 多節點根據 branch 決定位置
  if (branch === 'left') {
    return {
      x: `calc(50% - ${horizontalOffset}px)`,
      alignment: 'left',
    };
  }

  if (branch === 'right') {
    return {
      x: `calc(50% + ${horizontalOffset}px)`,
      alignment: 'right',
    };
  }

  // main branch 或其他：置中或根據 horizontalIndex 偏移
  if (sameLayerLevels.length > 1 && horizontalIndex !== undefined) {
    const totalNodes = sameLayerLevels.length;
    const centerIndex = (totalNodes - 1) / 2;
    const offset = (horizontalIndex - centerIndex) * horizontalOffset;
    return {
      x: `calc(50% + ${offset}px)`,
      alignment: offset < 0 ? 'left' : offset > 0 ? 'right' : 'center',
    };
  }

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
  // 簡化解析：假設格式為 'calc(50% ± Xpx)'
  const match = calcStr.match(/calc\(50%\s*([+-])\s*(\d+)px\)/);

  if (!match) {
    // 如果不是 calc 表達式，嘗試直接解析數字
    const numMatch = calcStr.match(/(\d+)/);
    return numMatch ? parseInt(numMatch[1]) : 0;
  }

  const operator = match[1];
  const offset = parseInt(match[2]);
  const halfWidth = containerWidth / 2;

  return operator === '-' ? halfWidth - offset : halfWidth + offset;
};
