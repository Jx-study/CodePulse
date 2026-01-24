import styles from './PathConnection.module.scss';
import type { PrerequisiteType } from '@/types';
import { getCurrentNodeRadius } from '../LevelNode/constants';

interface NodePosition {
  x: string;
  y: number;
  alignment: 'left' | 'right' | 'center';
}

interface PathConnectionProps {
  fromNode: NodePosition;
  toNode: NodePosition;
  isCompleted: boolean;
  containerWidth?: number;
  /** v2.0: 連線類型 - AND(實線) / OR(虛線) / NONE(預設) */
  connectionType?: PrerequisiteType;
}

function PathConnection({
  fromNode,
  toNode,
  isCompleted,
  containerWidth,
  connectionType = 'AND',
}: PathConnectionProps) {
  // 獲取實際容器寬度（使用 window.innerWidth 如果未提供）
  const actualWidth = containerWidth || window.innerWidth;

  // 將 calc() 表達式或百分比轉換為像素值
  const resolvePosition = (calcStr: string): number => {
    // 處理純百分比（如 '50%'）
    if (calcStr === '50%') return actualWidth / 2;

    const match = calcStr.match(/calc\(50%\s*([+-])\s*(\d+)px\)/);
    if (!match) return actualWidth / 2;

    const operator = match[1];
    const offset = parseInt(match[2]);
    const halfWidth = actualWidth / 2;

    return operator === '-' ? halfWidth - offset : halfWidth + offset;
  };

  // 決定連線樣式類別
  const getConnectionClass = (): string => {
    if (connectionType === 'OR') return styles.orConnection;
    return styles.andConnection;
  };

  // 獲取當前節點半徑（根據響應式斷點自動調整）
  const nodeRadius = getCurrentNodeRadius();

  const fromX = resolvePosition(fromNode.x);
  const fromY = fromNode.y; // 節點中心 Y 座標
  const toX = resolvePosition(toNode.x);
  const toY = toNode.y;

  // 連線起點和終點（從節點邊緣開始）
  const startY = fromY - nodeRadius;
  const endY = toY + nodeRadius;

  // 計算貝塞爾曲線控制點（基於節點間距）
  const deltaY = endY - startY;
  const controlPointOffset = Math.abs(deltaY) * 0.7;
  const cp1x = fromX;
  const cp1y = startY - controlPointOffset;
  const cp2x = toX;
  const cp2y = endY + controlPointOffset;

  // 計算 SVG viewBox
  const minX = Math.min(fromX, toX, cp1x, cp2x) - 20;
  const maxX = Math.max(fromX, toX, cp1x, cp2x) + 20;
  const minY = Math.min(startY, endY, cp1y, cp2y) - 20;
  const maxY = Math.max(startY, endY, cp1y, cp2y) + 20;
  const width = maxX - minX;
  const height = maxY - minY;

  // 調整座標到 SVG 本地空間
  const localFromX = fromX - minX;
  const localStartY = startY - minY;
  const localToX = toX - minX;
  const localEndY = endY - minY;
  const localCp1x = cp1x - minX;
  const localCp1y = cp1y - minY;
  const localCp2x = cp2x - minX;
  const localCp2y = cp2y - minY;

  // 貝塞爾曲線路徑
  const pathD = `M ${localFromX} ${localStartY} C ${localCp1x} ${localCp1y}, ${localCp2x} ${localCp2y}, ${localToX} ${localEndY}`;

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
        className={`${styles.path} ${getConnectionClass()} ${isCompleted ? styles.completed : styles.incomplete}`}
        fill="none"
      />
    </svg>
  );
}

export default PathConnection;
