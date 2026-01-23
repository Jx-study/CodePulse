import type { Level, GraphPosition } from '@/types';

export interface NodePosition {
  x: string;              // CSS 位置（例：'calc(50% - 120px)'）
  y: number;              // 像素值
  alignment: 'left' | 'right' | 'center'; // 水平對齊方式
}

// 佈局配置
const VERTICAL_SPACING = 150;      // 垂直間距（px）
const HORIZONTAL_OFFSET = 140;     // 左右偏移量（px）

/**
 * 計算關卡節點的位置（由下而上，左右交錯）- v1.0 兼容模式
 * @param levelIndex 關卡索引（0-based）
 * @param totalLevels 總關卡數
 * @returns NodePosition 節點位置資訊
 */
export const calculateNodePosition = (
  levelIndex: number,
  totalLevels: number
): NodePosition => {
  // 由下而上：第一關（index 0）在最底部
  // y 座標 = (總關卡數 - 當前索引 - 1) × 垂直間距
  const y = (totalLevels - levelIndex - 1) * VERTICAL_SPACING;

  // 左右交錯：偶數索引在左，奇數索引在右
  const alignment = levelIndex % 2 === 0 ? 'left' : 'right';
  const x = alignment === 'left'
    ? `calc(50% - ${HORIZONTAL_OFFSET}px)`
    : `calc(50% + ${HORIZONTAL_OFFSET}px)`;

  return { x, y, alignment };
};

// 類別順序（用於計算垂直偏移）
const CATEGORY_ORDER: Record<string, number> = {
  'sorting': 0,
  'searching': 1,
  'graph': 2,
  'dynamic-programming': 3,
  'data-structures': 4,
};

// 類別間距（當顯示多個類別時）
const CATEGORY_GAP = 80;

/**
 * v2.0 多分支佈局計算
 * 根據 graphPosition 計算節點位置
 */
export const calculateGraphNodePosition = (
  level: Level,
  levels: Level[]
): NodePosition => {
  const graphPos = level.graphPosition;

  // 如果沒有 graphPosition，退回到舊邏輯
  if (!graphPos) {
    const index = levels.findIndex((l) => l.id === level.id);
    return calculateNodePosition(index, levels.length);
  }

  // 只計算同一類別的關卡
  const sameCategoryLevels = levels.filter((l) => l.category === level.category);

  // 計算該類別的最大 layer
  const maxLayer = Math.max(
    ...sameCategoryLevels.map((l) => l.graphPosition?.layer ?? 0)
  );

  // 計算該類別在當前 levels 中的偏移量（當顯示多個類別時）
  const categoryOffset = calculateCategoryOffset(level.category, levels);

  // y 座標：由下而上，layer 0 在最底部，加上類別偏移
  const y = (maxLayer - graphPos.layer) * VERTICAL_SPACING + categoryOffset;

  // x 座標：根據 branch 和 horizontalIndex 計算（只看同類別同層）
  const { x, alignment } = calculateBranchX(graphPos, sameCategoryLevels);

  return { x, y, alignment };
};

/**
 * 計算類別的垂直偏移量
 * 當顯示多個類別時，需要將不同類別垂直分開
 */
function calculateCategoryOffset(category: string, levels: Level[]): number {
  // 找出當前 levels 包含的所有類別
  const categories = [...new Set(levels.map((l) => l.category))];

  // 如果只有一個類別，不需要偏移
  if (categories.length <= 1) return 0;

  // 按順序排列類別
  const sortedCategories = categories.sort(
    (a, b) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99)
  );

  // 計算當前類別之前所有類別的總高度
  let offset = 0;
  for (const cat of sortedCategories) {
    if (cat === category) break;

    // 計算該類別的高度
    const catLevels = levels.filter((l) => l.category === cat);
    const maxLayer = Math.max(
      ...catLevels.map((l) => l.graphPosition?.layer ?? 0)
    );
    offset += (maxLayer + 1) * VERTICAL_SPACING + CATEGORY_GAP;
  }

  return offset;
}

/**
 * 計算分支的 X 座標
 * @param graphPos 當前節點的圖位置
 * @param sameCategoryLevels 同類別的所有關卡（已篩選）
 */
function calculateBranchX(
  graphPos: GraphPosition,
  sameCategoryLevels: Level[]
): { x: string; alignment: 'left' | 'right' | 'center' } {
  const { branch, layer, horizontalIndex } = graphPos;

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
      x: `calc(50% - ${HORIZONTAL_OFFSET}px)`,
      alignment: 'left',
    };
  }

  if (branch === 'right') {
    return {
      x: `calc(50% + ${HORIZONTAL_OFFSET}px)`,
      alignment: 'right',
    };
  }

  // main branch 或其他：置中或根據 horizontalIndex 偏移
  if (sameLayerLevels.length > 1 && horizontalIndex !== undefined) {
    const totalNodes = sameLayerLevels.length;
    const centerIndex = (totalNodes - 1) / 2;
    const offset = (horizontalIndex - centerIndex) * HORIZONTAL_OFFSET;
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
