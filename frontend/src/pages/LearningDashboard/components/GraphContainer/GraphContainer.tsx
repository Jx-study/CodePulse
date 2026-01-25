import { useState, useRef, useEffect, useMemo } from 'react';
import styles from './GraphContainer.module.scss';
import {
  calculateNodePosition,
  calculateGraphNodePosition,
  calculateContentBounds,
} from './utils/positionCalculator';
import { useZoom } from '../../hooks/useZoom';
import ZoomControls from '../ZoomControls/ZoomControls';
import type { Point2D, GraphContainerProps } from '@/types';

const CONTENT_PADDING = 300; // 上下內邊距，確保所有內容（包括 tooltip）都可見 
function GraphContainer({ levels, userProgress, children }: GraphContainerProps) {
  const [currentScroll, setCurrentScroll] = useState<Point2D>({ x: 0, y: 0 });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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

  // 計算內容邊界（考慮所有節點的實際位置）
  const contentBounds = useMemo(() => {
    const bounds = calculateContentBounds(levels);
    return {
      minY: bounds.minY - CONTENT_PADDING, // 最上面的節點 - padding
      maxY: bounds.maxY + CONTENT_PADDING,  // 最下面的節點 + padding
    };
  }, [levels]);

  // 動態計算滾動限制（考慮縮放等級）
  const scrollLimits = useMemo(() => {
    if (!mapRef.current) {
      return { minScrollY: -1000, maxScrollY: 1000, maxScrollX: 300 };
    }

    const containerHeight = mapRef.current.clientHeight;

    // 內容的實際高度（考慮縮放）
    const contentHeight = (contentBounds.maxY - contentBounds.minY) * zoomLevel;

    // 內容最上面的實際位置（考慮縮放）
    const contentTop = contentBounds.minY * zoomLevel;

    // 內容最下面的實際位置（考慮縮放）
    const contentBottom = contentBounds.maxY * zoomLevel;

    // Y 軸滾動限制：
    // maxScrollY: 內容底部對齊容器底部時的 scroll 值（通常是 0 或正值）
    // minScrollY: 內容頂部對齊容器頂部時的 scroll 值（負值，向下拖動內容）
    const maxScrollY = Math.max(0, -contentTop);
    const minScrollY = Math.min(0, containerHeight - contentBottom);

    // X 軸：考慮縮放後的水平偏移
    const maxScrollX = 200 * zoomLevel;

    return {
      minScrollY,
      maxScrollY,
      maxScrollX,
    };
  }, [contentBounds, zoomLevel]);

  // 找到當前進度的關卡（第一個未完成的關卡）
  const currentLevelIndex = useMemo(() => {
    const index = levels.findIndex((level) => {
      const progress = userProgress.levels[level.id];
      return !progress || !progress.completedAt;
    });
    return index !== -1 ? index : levels.length - 1; // 如果都完成了，定位到最後一關
  }, [levels, userProgress]);

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

  // 初始化：自動定位到當前進度關卡
  useEffect(() => {
    if (isInitialized || !mapRef.current || levels.length === 0) return;

    const containerHeight = mapRef.current.clientHeight;
    const currentLevel = levels[currentLevelIndex];

    if (currentLevel) {
      // 計算當前關卡的位置
      const position = currentLevel.graphPosition
        ? calculateGraphNodePosition(currentLevel, levels)
        : calculateNodePosition(currentLevelIndex, levels.length);

      // 目標：將當前關卡定位到容器中央偏下的位置（距離底部 30%）
      const targetPositionInContainer = containerHeight * 0.7; // 距離頂部 70%

      // 計算需要的 scroll 值
      // transform: translate(x, scrollY) 會將內容移動 scrollY
      // 我們希望：position.y * zoomLevel + scrollY = targetPositionInContainer
      // 所以：scrollY = targetPositionInContainer - position.y * zoomLevel
      const idealScrollY = targetPositionInContainer - position.y * zoomLevel;

      // 確保在滾動限制範圍內
      const initialScrollY = Math.max(
        scrollLimits.minScrollY,
        Math.min(scrollLimits.maxScrollY, idealScrollY)
      );

      setCurrentScroll({ x: 0, y: initialScrollY });
      setIsInitialized(true);
    }
  }, [isInitialized, levels, currentLevelIndex, scrollLimits, zoomLevel]);

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
      x: Math.max(-scrollLimits.maxScrollX, Math.min(scrollLimits.maxScrollX, newScroll.x)),
      y: Math.max(scrollLimits.minScrollY, Math.min(scrollLimits.maxScrollY, newScroll.y))
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
      x: Math.max(-scrollLimits.maxScrollX, Math.min(scrollLimits.maxScrollX, newScroll.x)),
      y: Math.max(scrollLimits.minScrollY, Math.min(scrollLimits.maxScrollY, newScroll.y))
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
          // 使用 graphPosition 計算位置，否則退回到舊邏輯
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
