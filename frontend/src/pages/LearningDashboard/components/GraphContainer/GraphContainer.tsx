import { useState, useRef, useEffect } from 'react';
import styles from './GraphContainer.module.scss';
import {
  calculateNodePosition,
  calculateGraphNodePosition,
} from './utils/positionCalculator';
import { useZoom } from '../../hooks/useZoom';
import ZoomControls from '../ZoomControls/ZoomControls';
import type { Point2D, GraphContainerProps } from '@/types';

const LEVEL_NODE_HEIGHT = 150;

function GraphContainer({ levels, userProgress, children }: GraphContainerProps) {
  const [currentScroll, setCurrentScroll] = useState<Point2D>({ x: 0, y: 0 });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Point2D | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  // 縮放功能
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom({
    minZoom: 0.5,
    maxZoom: 2.0,
    initialZoom: 1.0,
    step: 0.1,
    enableWheelZoom: true,
    enablePinchZoom: true,
    targetRef: mapRef as React.RefObject<HTMLElement>,
  });

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
      y: Math.max(0, Math.min(maxScrollY, newScroll.y)) // Y 軸底部為 0，向上擴展為正值
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
      y: Math.max(0, Math.min(maxScrollY, newScroll.y)) // Y 軸底部為 0，向上擴展為正值
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
      className={`${styles.graphContainer} ${isDragging ? styles.dragging : ''}`}
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
        style={{
          transform: `translate(${currentScroll.x}px, ${currentScroll.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
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

      {/* 縮放控制按鈕 */}
      <ZoomControls
        currentZoom={zoomLevel}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />
    </div>
  );
}

export default GraphContainer;
