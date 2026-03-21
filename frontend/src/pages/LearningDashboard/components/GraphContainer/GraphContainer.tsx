import { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './GraphContainer.module.scss';
import {
  calculateNodePosition,
  calculateGraphNodePosition,
  calculateContentBounds,
} from './utils/positionCalculator';
import { getLayoutConfig } from './utils/layoutConfig';
import { useZoom } from '@/shared/hooks/useZoom';
import { useDrag } from '@/shared/hooks/useDrag';
import ZoomControls from '@/shared/components/ZoomControls';
import { useZoomDisable } from '@/pages/LearningDashboard/context/ZoomDisableContext';
import type { GraphContainerProps } from '@/types';

const CONTENT_PADDING = 300; // 上下內邊距，確保所有內容（包括 tooltip）都可見
function GraphContainer({ levels, userProgress, children }: GraphContainerProps) {
  const { isZoomDisabled: isContextDisabled } = useZoomDisable();
  const [isOverlayOpen, setIsOverlayOpen] = useState(
    () => document.body.hasAttribute('data-dialog-open')
  );
  const isZoomDisabled = isContextDisabled || isOverlayOpen;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);

  // 計算內容邊界（考慮所有節點的實際位置）
  // 依賴 windowWidth，確保視窗縮放時使用正確的響應式佈局配置重算
  const contentBounds = useMemo(() => {
    const layoutConfig = getLayoutConfig(windowWidth);
    const bounds = calculateContentBounds(levels, layoutConfig);
    return {
      minY: bounds.minY - CONTENT_PADDING, // 最上面的節點 - padding
      maxY: bounds.maxY + CONTENT_PADDING,  // 最下面的節點 + padding
    };
  }, [levels, windowWidth]);

  // 縮放功能
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom({
    minZoom: 0.5,
    maxZoom: 2.0,
    initialZoom: 1.0,
    step: 0.1,
    enableWheelZoom: true,
    enablePinchZoom: true,
    isDisabled: isZoomDisabled,
  });

  // 動態計算滾動限制的輔助函數
  const calculateScrollBounds = useCallback((container: HTMLElement | null | undefined) => {
    if (!container) {
      return { minScrollY: -1000, maxScrollY: 1000, maxScrollX: 300 };
    }

    const containerHeight = container.clientHeight;
    // transform-origin: center center，scale 以容器中心為基準點
    // 節點的視覺 Y = offsetY + centerY + (nodeY - centerY) * zoomLevel
    // 要讓最頂部節點對齊容器頂部 (visualY = 0)：
    //   offsetY = -centerY - (minY - centerY) * zoomLevel = centerY * (zoomLevel - 1) - minY * zoomLevel
    // 要讓最底部節點對齊容器底部 (visualY = containerHeight)：
    //   offsetY = containerHeight - centerY - (maxY - centerY) * zoomLevel
    const centerY = containerHeight / 2;

    const maxScrollY = centerY * (zoomLevel - 1) - contentBounds.minY * zoomLevel;
    const minScrollY = containerHeight - centerY - (contentBounds.maxY - centerY) * zoomLevel;

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
    enabled: !isZoomDisabled,
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

  // 偵測外部 overlay（Dialog/Sidebar）開啟，阻止 wheel/drag 事件穿透
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsOverlayOpen(document.body.hasAttribute('data-dialog-open'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-dialog-open'] });
    return () => observer.disconnect();
  }, []);

  // 監聽視窗大小變化：更新 windowWidth（觸發 re-render）、header 高度、並 clamp offset
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };

    // 初始化 header 高度
    const header = document.querySelector('header');
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 視窗大小改變時，將現有 offset clamp 到新邊界，防止節點跑出可視範圍
  useEffect(() => {
    if (!drag.containerRef.current) return;
    const bounds = calculateScrollBounds(drag.containerRef.current);
    const clampedX = Math.max(-bounds.maxScrollX, Math.min(bounds.maxScrollX, drag.offset.x));
    const clampedY = Math.max(bounds.minScrollY, Math.min(bounds.maxScrollY, drag.offset.y));
    if (clampedX !== drag.offset.x || clampedY !== drag.offset.y) {
      drag.setOffset({ x: clampedX, y: clampedY });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowWidth, calculateScrollBounds]);

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
      const centerY = containerHeight / 2;

      // transform-origin: center center，節點視覺 Y = offsetY + centerY + (nodeY - centerY) * zoomLevel
      // 要讓節點出現在 targetPositionInContainer：
      //   offsetY = targetPositionInContainer - centerY - (nodeY - centerY) * zoomLevel
      const idealScrollY = targetPositionInContainer - centerY - (position.y - centerY) * zoomLevel;

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
        {(() => {
          // 統一計算本次 render 的 layoutConfig 和 containerWidth
          const layoutConfig = getLayoutConfig(windowWidth);
          const containerWidth = drag.containerRef.current?.clientWidth ?? windowWidth;
          return levels.map((level, index) => {
            const position = level.graphPosition
              ? calculateGraphNodePosition(level, levels, layoutConfig)
              : calculateNodePosition(index, levels.length, layoutConfig);
            return (
              <div key={level.id}>
                {children(level, index, position, containerWidth)}
              </div>
            );
          });
        })()}
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
