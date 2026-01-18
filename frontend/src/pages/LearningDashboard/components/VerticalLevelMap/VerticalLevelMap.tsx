import { useState, useRef, useEffect } from 'react';
import styles from './VerticalLevelMap.module.scss';
import { calculateNodePosition } from './utils/positionCalculator';
import type { Level, UserProgress } from '@/types';

interface VerticalLevelMapProps {
  levels: Level[];
  userProgress: UserProgress;
  children: (level: Level, index: number, position: { x: string; y: number; position: 'left' | 'right' }) => React.ReactNode;
}

interface DragState {
  isDragging: boolean;
  startY: number;
  scrollY: number;
  velocity: number;
  timestamp: number;
}

const DRAG_THRESHOLD = 5;        // 拖動閾值（px），小於此值視為點擊
const DECELERATION = 0.95;       // 慣性滑動減速係數
const MIN_VELOCITY = 0.5;        // 最小速度，低於此值停止慣性滑動
const LEVEL_NODE_HEIGHT = 150;   // 與 VERTICAL_SPACING 一致

function VerticalLevelMap({ levels, userProgress, children }: VerticalLevelMapProps) {
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startY: 0,
    scrollY: 0,
    velocity: 0,
    timestamp: 0
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(null);

  const maxScrollY = Math.max(0, (levels.length - 1) * LEVEL_NODE_HEIGHT);

  // ==================== 滑鼠事件 ====================

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragState({
      isDragging: true,
      startY: e.clientY,
      scrollY: currentScrollY,
      velocity: 0,
      timestamp: Date.now()
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;

    const deltaY = e.clientY - dragState.startY;
    const newScrollY = dragState.scrollY - deltaY;

    // 限制拖動範圍
    const clampedScrollY = Math.max(0, Math.min(newScrollY, maxScrollY));
    setCurrentScrollY(clampedScrollY);

    // 計算速度（用於慣性滑動）
    const now = Date.now();
    const timeDelta = now - dragState.timestamp;
    if (timeDelta > 0) {
      const velocity = -deltaY / timeDelta;
      setDragState(prev => ({ ...prev, velocity, timestamp: now }));
    }
  };

  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  // ==================== 觸控事件 ====================

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragState({
      isDragging: true,
      startY: touch.clientY,
      scrollY: currentScrollY,
      velocity: 0,
      timestamp: Date.now()
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - dragState.startY;
    const newScrollY = dragState.scrollY - deltaY;

    const clampedScrollY = Math.max(0, Math.min(newScrollY, maxScrollY));
    setCurrentScrollY(clampedScrollY);

    const now = Date.now();
    const timeDelta = now - dragState.timestamp;
    if (timeDelta > 0) {
      const velocity = -deltaY / timeDelta;
      setDragState(prev => ({ ...prev, velocity, timestamp: now }));
    }
  };

  const handleTouchEnd = () => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  // ==================== 慣性滑動 ====================

  useEffect(() => {
    if (!dragState.isDragging && Math.abs(dragState.velocity) > MIN_VELOCITY) {
      const animate = () => {
        setDragState(prev => {
          const newVelocity = prev.velocity * DECELERATION;

          // 速度過小時停止
          if (Math.abs(newVelocity) < MIN_VELOCITY) {
            return { ...prev, velocity: 0 };
          }

          // 更新位置
          const newScrollY = currentScrollY + newVelocity * 10;
          const clampedScrollY = Math.max(0, Math.min(newScrollY, maxScrollY));
          setCurrentScrollY(clampedScrollY);

          animationFrameRef.current = requestAnimationFrame(animate);
          return { ...prev, velocity: newVelocity };
        });
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dragState.isDragging, dragState.velocity, currentScrollY, maxScrollY]);

  // ==================== 渲染 ====================

  return (
    <div
      ref={mapRef}
      className={`${styles.verticalLevelMap} ${dragState.isDragging ? styles.dragging : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.mapContent}
        style={{ transform: `translateY(-${currentScrollY}px)` }}
      >
        {/* 中央路徑線 */}
        <div className={styles.pathLine} />

        {/* 渲染關卡節點 */}
        {levels.map((level, index) => {
          const position = calculateNodePosition(index, levels.length);
          return (
            <div key={level.id}>
              {children(level, index, position)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VerticalLevelMap;
