import { useState, useRef, useEffect } from 'react';
import styles from './VerticalLevelMap.module.scss';
import {
  calculateNodePosition,
  calculateGraphNodePosition,
  type NodePosition,
} from './utils/positionCalculator';
import type { Level, UserProgress, Point2D } from '@/types';

interface VerticalLevelMapProps {
  levels: Level[];
  userProgress: UserProgress;
  children: (level: Level, index: number, position: NodePosition) => React.ReactNode;
}

const LEVEL_NODE_HEIGHT = 150;
const LEVEL_NODE_WIDTH = 80;

function VerticalLevelMap({ levels, userProgress, children }: VerticalLevelMapProps) {
  const [currentScroll, setCurrentScroll] = useState<Point2D>({ x: 0, y: 0 });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Point2D | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  const maxScrollY = Math.max(0, (levels.length - 1) * LEVEL_NODE_HEIGHT);
  const maxScrollX = 300; // 允許左右各移動約 300px

  // 動態計算 header 高度
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      const updateHeaderHeight = () => {
        setHeaderHeight(header.offsetHeight);
      };

      updateHeaderHeight();

      // 監聽視窗大小變化
      window.addEventListener('resize', updateHeaderHeight);
      return () => window.removeEventListener('resize', updateHeaderHeight);
    }
  }, []);

  // ==================== 滑鼠事件 ====================

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - currentScroll.x,
      y: e.clientY - currentScroll.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    e.preventDefault();
    const newScroll = {
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    };

    setCurrentScroll({
      x: Math.max(-maxScrollX, Math.min(maxScrollX, newScroll.x)), // X 軸左右滾動限制
      y: Math.max(-maxScrollY, Math.min(0, newScroll.y)) // Y 軸向上滾動是負值
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // ==================== 觸控事件 ====================

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX - currentScroll.x,
      y: touch.clientY - currentScroll.y
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const touch = e.touches[0];
    const newScroll = {
      x: touch.clientX - dragStartRef.current.x,
      y: touch.clientY - dragStartRef.current.y
    };

    setCurrentScroll({
      x: Math.max(-maxScrollX, Math.min(maxScrollX, newScroll.x)), // X 軸左右滾動限制
      y: Math.max(-maxScrollY, Math.min(0, newScroll.y))
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };


  // ==================== 渲染 ====================

  return (
    <div
      ref={mapRef}
      className={`${styles.verticalLevelMap} ${isDragging ? styles.dragging : ''}`}
      style={{
        top: `${headerHeight}px`,
        height: `calc(100% - ${headerHeight}px)`,
      }}
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
        style={{ transform: `translate(${currentScroll.x}px, ${currentScroll.y}px)` }}
      >

        {/* 渲染關卡節點 */}
        {levels.map((level, index) => {
          // v2.0: 使用 graphPosition 計算位置，否則退回到舊邏輯
          const position = level.graphPosition
            ? calculateGraphNodePosition(level, levels)
            : calculateNodePosition(index, levels.length);
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
