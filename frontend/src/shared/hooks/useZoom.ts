import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useZoom Hook - 縮放控制邏輯
 *
 * 支援三種縮放方式：
 * 1. Mouse Wheel 縮放（支援以滑鼠位置為中心）
 * 2. 雙指捏合手勢（Tablet/Mobile）
 * 3. ZoomControls 按鈕縮放
 *
 * @param options - 縮放配置選項
 * @returns 縮放狀態和控制函數
 *
 * @example
 * const { zoomLevel, zoomIn, zoomOut, resetZoom, transformOrigin } = useZoom({
 *   minZoom: 0.5,
 *   maxZoom: 2.0,
 *   initialZoom: 1.0,
 *   step: 0.1,
 *   enableMouseCenteredZoom: true,
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
  /** 是否啟用以滑鼠位置為中心的縮放 (預設: false) */
  enableMouseCenteredZoom?: boolean;
  /** 目標元素 Ref (用於監聽事件) */
  targetRef?: React.RefObject<HTMLElement | null>;
  /** 是否停用所有縮放事件（用於 Dialog 開啟時暫停縮放，預設: false） */
  isDisabled?: boolean;
  /**
   * 是否使用乘法式 Wheel 縮放 (預設: false)
   * 啟用後每次滾輪以 step 比例縮放（prev * (1 + step)），
   * 適合 maxZoom 範圍很大的場景（如數百個元素時 maxZoom 可達 50x+）。
   */
  useExponentialWheel?: boolean;
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
  /** Transform origin 座標（用於以滑鼠為中心縮放） */
  transformOrigin: string;
}

export function useZoom(options: UseZoomOptions = {}): UseZoomReturn {
  const {
    minZoom = 0.5,
    maxZoom = 2.0,
    initialZoom = 1.0,
    step = 0.1,
    enableWheelZoom = true,
    enablePinchZoom = true,
    enableMouseCenteredZoom = false,
    targetRef,
    isDisabled = false,
    useExponentialWheel = false,
  } = options;

  const [zoomLevel, setZoomLevelState] = useState(initialZoom);
  const [transformOrigin, setTransformOrigin] = useState('center center');
  const wheelListenerRef = useRef<((e: WheelEvent) => void) | null>(null);
  const touchStartDistanceRef = useRef<number | null>(null);
  const lastZoomRef = useRef<number>(initialZoom);
  const isDisabledRef = useRef(isDisabled);

  useEffect(() => {
    isDisabledRef.current = isDisabled;
  }, [isDisabled]);

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

  /* 放大 */
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => prev + step);
    // 按鈕縮放使用固定中心點
    if (enableMouseCenteredZoom) {
      setTransformOrigin('center center');
    }
  }, [setZoomLevel, step, enableMouseCenteredZoom]);

  /* 縮小 */
  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => prev - step);
    // 按鈕縮放使用固定中心點
    if (enableMouseCenteredZoom) {
      setTransformOrigin('center center');
    }
  }, [setZoomLevel, step, enableMouseCenteredZoom]);

  /* 重置縮放 */
  const resetZoom = useCallback(() => {
    setZoomLevel(initialZoom);
    if (enableMouseCenteredZoom) {
      setTransformOrigin('center center');
    }
  }, [setZoomLevel, initialZoom, enableMouseCenteredZoom]);

  /* Wheel 縮放（支援以滑鼠位置為中心） */
  useEffect(() => {
    if (!enableWheelZoom) return;

    const targetElement = targetRef?.current || document.body;

    const handleWheel = (e: WheelEvent) => {
      if (isDisabledRef.current) return;
      // 阻止預設的頁面縮放行為
      e.preventDefault();

      // 如果啟用以滑鼠為中心的縮放，計算 transform-origin
      if (enableMouseCenteredZoom && targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 計算相對於元素的百分比位置
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;

        setTransformOrigin(`${percentX}% ${percentY}%`);
      }

      // 計算縮放方向和增量
      if (useExponentialWheel) {
        const factor = e.deltaY > 0 ? 1 / (1 + step) : 1 + step;
        setZoomLevel((prev) => prev * factor);
      } else {
        const delta = e.deltaY > 0 ? -step : step;
        setZoomLevel((prev) => prev + delta);
      }
    };

    wheelListenerRef.current = handleWheel;
    targetElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (wheelListenerRef.current) {
        targetElement.removeEventListener('wheel', wheelListenerRef.current);
      }
    };
  }, [enableWheelZoom, enableMouseCenteredZoom, step, setZoomLevel, targetRef, useExponentialWheel]);

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

    /**
     * 計算兩點的中心點
     */
    const getMidpoint = (touch1: Touch, touch2: Touch): { x: number; y: number } => {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isDisabledRef.current) return;
      if (e.touches.length === 2) {
        // 阻止預設的雙指縮放行為
        e.preventDefault();

        // 記錄初始雙指距離
        touchStartDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
        // 使用 state 回調函數來獲取最新的 zoomLevel，避免依賴 zoomLevel
        setZoomLevelState((currentZoom) => {
          lastZoomRef.current = currentZoom;
          return currentZoom;
        });

        // 計算雙指中心點作為縮放中心
        if (enableMouseCenteredZoom && targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const midpoint = getMidpoint(e.touches[0], e.touches[1]);
          const x = midpoint.x - rect.left;
          const y = midpoint.y - rect.top;

          const percentX = (x / rect.width) * 100;
          const percentY = (y / rect.height) * 100;

          setTransformOrigin(`${percentX}% ${percentY}%`);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDisabledRef.current) return;
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
  }, [enablePinchZoom, enableMouseCenteredZoom, setZoomLevel, targetRef]);

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
    transformOrigin,
  };
}

export default useZoom;
