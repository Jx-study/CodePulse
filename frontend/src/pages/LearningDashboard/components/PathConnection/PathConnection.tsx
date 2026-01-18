import styles from './PathConnection.module.scss';

interface NodePosition {
  x: string;
  y: number;
  position: 'left' | 'right';
}

interface PathConnectionProps {
  fromNode: NodePosition;
  toNode: NodePosition;
  isCompleted: boolean;
  containerWidth?: number;
}

function PathConnection({
  fromNode,
  toNode,
  isCompleted,
  containerWidth
}: PathConnectionProps) {
  // 獲取實際容器寬度（使用 window.innerWidth 如果未提供）
  const actualWidth = containerWidth || window.innerWidth;

  // 將 calc() 表達式轉換為像素值
  const resolvePosition = (calcStr: string): number => {
    const match = calcStr.match(/calc\(50%\s*([+-])\s*(\d+)px\)/);
    if (!match) return actualWidth / 2;

    const operator = match[1];
    const offset = parseInt(match[2]);
    const halfWidth = actualWidth / 2;

    return operator === '-' ? halfWidth - offset : halfWidth + offset;
  };

  const fromX = resolvePosition(fromNode.x);
  const fromY = fromNode.y + 50; // 節點中心（半徑50px）
  const toX = resolvePosition(toNode.x);
  const toY = toNode.y + 50;

  // 計算貝塞爾曲線控制點
  const controlPointOffset = 50;
  const cp1x = fromX;
  const cp1y = fromY - controlPointOffset;
  const cp2x = toX;
  const cp2y = toY + controlPointOffset;

  // 計算 SVG viewBox
  const minX = Math.min(fromX, toX, cp1x, cp2x) - 20;
  const maxX = Math.max(fromX, toX, cp1x, cp2x) + 20;
  const minY = Math.min(fromY, toY, cp1y, cp2y) - 20;
  const maxY = Math.max(fromY, toY, cp1y, cp2y) + 20;
  const width = maxX - minX;
  const height = maxY - minY;

  // 調整座標到 SVG 本地空間
  const localFromX = fromX - minX;
  const localFromY = fromY - minY;
  const localToX = toX - minX;
  const localToY = toY - minY;
  const localCp1x = cp1x - minX;
  const localCp1y = cp1y - minY;
  const localCp2x = cp2x - minX;
  const localCp2y = cp2y - minY;

  const pathD = `M ${localFromX} ${localFromY} C ${localCp1x} ${localCp1y}, ${localCp2x} ${localCp2y}, ${localToX} ${localToY}`;

  return (
    <svg
      className={styles.pathConnection}
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width,
        height,
        pointerEvents: 'none'
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={pathD}
        className={`${styles.path} ${isCompleted ? styles.completed : styles.incomplete}`}
        fill="none"
      />
    </svg>
  );
}

export default PathConnection;
