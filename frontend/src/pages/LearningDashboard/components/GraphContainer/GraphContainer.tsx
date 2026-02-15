import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './GraphContainer.module.scss';
import {
  calculateNodePosition,
  calculateGraphNodePosition,
  calculateContentBounds,
} from './utils/positionCalculator';
import { useZoom } from '@/shared/hooks/useZoom';
import { useDrag } from '@/shared/hooks/useDrag';
import ZoomControls from '@/shared/components/ZoomControls';
import type { GraphContainerProps } from '@/types';

const CONTENT_PADDING = 300; // 上下內邊距，確保所有內容（包括 tooltip）都可見
function GraphContainer({ levels, userProgress, children }: GraphContainerProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // 計算內容邊界（考慮所有節點的實際位置）
  const contentBounds = useMemo(() => {
    const bounds = calculateContentBounds(levels);
    return {
      minY: bounds.minY - CONTENT_PADDING, // 最上面的節點 - padding
      maxY: bounds.maxY + CONTENT_PADDING,  // 最下面的節點 + padding
    };
  }, [levels]);

  // 縮放功能
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom({
    minZoom: 0.5,
    maxZoom: 2.0,
    initialZoom: 1.0,
    step: 0.1,
    enableWheelZoom: true,
    enablePinchZoom: true,
  });

  // 動態計算滾動限制的輔助函數
  const calculateScrollBounds = useCallback((container: HTMLElement | null | undefined) => {
    if (!container) {
      return { minScrollY: -1000, maxScrollY: 1000, maxScrollX: 300 };
    }

    const containerHeight = container.clientHeight;

    // 內容最上面 & 最下面的實際位置
    const contentTop = contentBounds.minY * zoomLevel;
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

  // 拖拽功能 (使用 useDrag hook，動態計算邊界)
  const drag = useDrag<HTMLDivElement>({
    enabled: true,
    calculateBounds: (container) => {
      const bounds = calculateScrollBounds(container);
      return {
        minX: -bounds.maxScrollX,
        maxX: bounds.maxScrollX,
        minY: bounds.minScrollY,
        maxY: bounds.maxScrollY,
      };
    },
  });

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
    if (isInitialized || !drag.containerRef.current || levels.length === 0) return;

    const containerHeight = drag.containerRef.current.clientHeight;
    const currentLevel = levels[currentLevelIndex];

    if (currentLevel) {
      // 計算當前關卡的位置
      const position = currentLevel.graphPosition
        ? calculateGraphNodePosition(currentLevel, levels)
        : calculateNodePosition(currentLevelIndex, levels.length);

      // 目標：將當前關卡定位到容器中央偏下的位置（距離底部 30%）
      const targetPositionInContainer = containerHeight * 0.7; // 距離頂部 70%

      // 計算需要的 scroll 值
      const idealScrollY = targetPositionInContainer - position.y * zoomLevel;

      // 獲取當前的邊界限制
      const bounds = calculateScrollBounds(drag.containerRef.current);

      // 確保在滾動限制範圍內
      const initialScrollY = Math.max(
        bounds.minScrollY,
        Math.min(bounds.maxScrollY, idealScrollY)
      );

      drag.setOffset({ x: 0, y: initialScrollY });
      setIsInitialized(true);
    }
  }, [isInitialized, levels, currentLevelIndex, zoomLevel, drag, calculateScrollBounds]);

  // ==================== 渲染 ====================

  return (
    <div
      ref={drag.containerRef}
      className={`${styles.graphContainer} ${drag.isDragging ? styles.dragging : ''}`}
      style={{
        top: `${headerHeight}px`,
        height: `calc(100% - ${headerHeight}px)`,
      }}
      onMouseDown={drag.handleMouseDown}
      onMouseMove={drag.handleMouseMove}
      onMouseUp={drag.handleMouseUp}
      onMouseLeave={drag.handleMouseUp}
      onTouchStart={drag.handleTouchStart}
      onTouchMove={drag.handleTouchMove}
      onTouchEnd={drag.handleTouchEnd}
    >
      <div
        className={styles.mapContent}
        style={{
          transform: `translate(${drag.offset.x}px, ${drag.offset.y}px) scale(${zoomLevel})`,
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
