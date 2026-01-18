export interface NodePosition {
  x: string;              // CSS 位置（例：'calc(50% - 120px)'）
  y: number;              // 像素值
  position: 'left' | 'right';
}

/**
 * 計算關卡節點的位置（由下而上，左右交錯）
 * @param levelIndex 關卡索引（0-based）
 * @param totalLevels 總關卡數
 * @returns NodePosition 節點位置資訊
 */
export const calculateNodePosition = (
  levelIndex: number,
  totalLevels: number
): NodePosition => {
  const VERTICAL_SPACING = 150;      // 垂直間距（px）
  const HORIZONTAL_OFFSET = 120;     // 左右偏移量（px）

  // 由下而上：第一關（index 0）在最底部
  // y 座標 = (總關卡數 - 當前索引 - 1) × 垂直間距
  const y = (totalLevels - levelIndex - 1) * VERTICAL_SPACING;

  // 左右交錯：偶數索引在左，奇數索引在右
  const position = levelIndex % 2 === 0 ? 'left' : 'right';
  const x = position === 'left'
    ? `calc(50% - ${HORIZONTAL_OFFSET}px)`
    : `calc(50% + ${HORIZONTAL_OFFSET}px)`;

  return { x, y, position };
};

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
