import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useZoom Hook - 縮放控制邏輯
 *
 * 支援三種縮放方式：
 * 1. Mouse Wheel 縮放（純 Scroll，避免觸發瀏覽器縮放）
 * 2. 雙指捏合手勢（Tablet/Mobile）
 * 3. ZoomControls 按鈕縮放
 *
 * @param options - 縮放配置選項
 * @returns 縮放狀態和控制函數
 *
 * @example
 * const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom({
 *   minZoom: 0.5,
 *   maxZoom: 2.0,
 *   initialZoom: 1.0,
 *   step: 0.1,
 * });
 */

interface UseZoomOptions {
  /** 最小縮放等級 (預設: 0.5 = 50%) */
  minZoom?: number;
  /** 最大縮放等級 (預設: 2.0 = 200%) */
  maxZoom?: number;
  /** 初始縮放等級 (預設: 1.0 = 100%) */
  initialZoom?: number;
  /** 縮放步進 (預設: 0.1 = 10%) */
  step?: number;
  /** 是否啟用 Wheel 縮放 (預設: true) */
  enableWheelZoom?: boolean;
  /** 是否啟用雙指捏合縮放 (預設: true) */
  enablePinchZoom?: boolean;
  /** 目標元素 Ref (用於監聽事件) */
  targetRef?: React.RefObject<HTMLElement>;
}

interface UseZoomReturn {
  /** 當前縮放等級 */
  zoomLevel: number;
  /** 放大 */
  zoomIn: () => void;
  /** 縮小 */
  zoomOut: () => void;
  /** 重置縮放 */
  resetZoom: () => void;
  /** 設定縮放等級 */
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void;
}

export function useZoom(options: UseZoomOptions = {}): UseZoomReturn {
  const {
    minZoom = 0.5,
    maxZoom = 2.0,
    initialZoom = 1.0,
    step = 0.1,
    enableWheelZoom = true,
    enablePinchZoom = true,
    targetRef,
  } = options;

  const [zoomLevel, setZoomLevelState] = useState(initialZoom);
  const wheelListenerRef = useRef<((e: WheelEvent) => void) | null>(null);
  const touchStartDistanceRef = useRef<number | null>(null);
  const lastZoomRef = useRef<number>(initialZoom);

  /**
   * 限制縮放範圍並設定縮放等級
   */
  const setZoomLevel = useCallback(
    (zoom: number | ((prev: number) => number)) => {
      setZoomLevelState((prev) => {
        const newZoom = typeof zoom === 'function' ? zoom(prev) : zoom;
        return Math.max(minZoom, Math.min(maxZoom, newZoom));
      });
    },
    [minZoom, maxZoom]
  );

  /**
   * 放大
   */
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => prev + step);
  }, [setZoomLevel, step]);

  /**
   * 縮小
   */
  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => prev - step);
  }, [setZoomLevel, step]);

  /**
   * 重置縮放
   */
  const resetZoom = useCallback(() => {
    setZoomLevel(initialZoom);
  }, [setZoomLevel, initialZoom]);

  /**
   * Wheel 縮放（純 Scroll）
   */
  useEffect(() => {
    if (!enableWheelZoom) return;

    const targetElement = targetRef?.current || document.body;

    const handleWheel = (e: WheelEvent) => {
      // 阻止預設的頁面縮放行為
      e.preventDefault();

      // 計算縮放方向和增量
      const delta = e.deltaY > 0 ? -step : step;
      setZoomLevel((prev) => prev + delta);
    };

    wheelListenerRef.current = handleWheel;
    targetElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (wheelListenerRef.current) {
        targetElement.removeEventListener('wheel', wheelListenerRef.current);
      }
    };
  }, [enableWheelZoom, step, setZoomLevel, targetRef]);

  /**
   * 雙指捏合縮放（Touch Pinch Gesture）
   */
  useEffect(() => {
    if (!enablePinchZoom) return;

    const targetElement = targetRef?.current || document.body;

    /**
     * 計算兩點之間的距離
     */
    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // 阻止預設的雙指縮放行為
        e.preventDefault();

        // 記錄初始雙指距離
        touchStartDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
        lastZoomRef.current = zoomLevel;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistanceRef.current !== null) {
        // 阻止預設的雙指縮放行為
        e.preventDefault();

        // 計算當前雙指距離
        const currentDistance = getDistance(e.touches[0], e.touches[1]);

        // 計算縮放比例（相對於初始距離）
        const scale = currentDistance / touchStartDistanceRef.current;

        // 計算新的縮放等級
        const newZoom = lastZoomRef.current * scale;

        // 應用縮放
        setZoomLevel(newZoom);
      }
    };

    const handleTouchEnd = () => {
      // 重置記錄
      touchStartDistanceRef.current = null;
    };

    targetElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    targetElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    targetElement.addEventListener('touchend', handleTouchEnd);
    targetElement.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      targetElement.removeEventListener('touchstart', handleTouchStart);
      targetElement.removeEventListener('touchmove', handleTouchMove);
      targetElement.removeEventListener('touchend', handleTouchEnd);
      targetElement.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enablePinchZoom, setZoomLevel, targetRef, zoomLevel]);

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
  };
}

export default useZoom;
