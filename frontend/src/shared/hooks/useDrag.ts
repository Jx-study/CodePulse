import { useState, useRef, useCallback } from 'react';
import type { Point2D } from '@/types';

export interface UseDragOptions {
  /** 是否啟用拖拽功能 (預設: true) */
  enabled?: boolean;
  /** 初始位移 (預設: {x: 0, y: 0}) */
  initialOffset?: Point2D;
  /** 固定邊界限制 */
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  /** 動態計算邊界限制的函數 (優先於 bounds) */
  calculateBounds?: (containerRef: HTMLElement | null | undefined) => {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  /** 使用容器尺寸比例來限制拖拽範圍 (e.g., 0.8 表示可拖拽到容器寬高的 80%) */
  boundaryRatio?: number;
  onDragStart?: (offset: Point2D) => void;
  onDragMove?: (offset: Point2D) => void;
  onDragEnd?: (offset: Point2D) => void;
}

export interface UseDragReturn<T extends HTMLElement = HTMLElement> {
  /** 當前位移 */
  offset: Point2D;
  isDragging: boolean;
  setOffset: (offset: Point2D) => void;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  /** 容器 ref (用於計算動態邊界) */
  containerRef: React.RefObject<T | null>;
}

/**
 * 拖拽功能 Hook
 * 提供統一的拖拽邏輯，支援滑鼠和觸控事件
 */
export function useDrag<T extends HTMLElement = HTMLElement>(
  options: UseDragOptions = {}
): UseDragReturn<T> {
  const {
    enabled = true,
    initialOffset = { x: 0, y: 0 },
    bounds,
    calculateBounds,
    boundaryRatio,
    onDragStart,
    onDragMove,
    onDragEnd,
  } = options;

  const [offset, setOffset] = useState<Point2D>(initialOffset);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Point2D | null>(null);
  const containerRef = useRef<T>(null);

  /**
   * 計算並限制新的位移量
   */
  const calculateConstrainedOffset = useCallback(
    (clientX: number, clientY: number): Point2D => {
      if (!dragStartRef.current) return offset;

      // 計算原始位移
      const rawNewX = clientX - dragStartRef.current.x;
      const rawNewY = clientY - dragStartRef.current.y;

      // 優先級：calculateBounds > boundaryRatio > bounds
      let effectiveBounds: {
        minX?: number;
        maxX?: number;
        minY?: number;
        maxY?: number;
      } = {};

      if (calculateBounds) {
        // 1. 使用自定義計算函數
        effectiveBounds = calculateBounds(containerRef.current);
      } else if (boundaryRatio !== undefined && containerRef.current) {
        // 2. 使用容器尺寸比例（類似 D3Canvas 的邏輯）
        const { clientWidth, clientHeight } = containerRef.current;
        const limitX = clientWidth * boundaryRatio;
        const limitY = clientHeight * boundaryRatio;

        effectiveBounds = {
          minX: -limitX,
          maxX: limitX,
          minY: -limitY,
          maxY: limitY,
        };
      } else if (bounds) {
        // 3. 使用固定邊界
        effectiveBounds = bounds;
      }

      // 應用邊界限制
      const constrainedX =
        effectiveBounds.minX !== undefined || effectiveBounds.maxX !== undefined
          ? Math.max(
              effectiveBounds.minX ?? -Infinity,
              Math.min(effectiveBounds.maxX ?? Infinity, rawNewX)
            )
          : rawNewX;

      const constrainedY =
        effectiveBounds.minY !== undefined || effectiveBounds.maxY !== undefined
          ? Math.max(
              effectiveBounds.minY ?? -Infinity,
              Math.min(effectiveBounds.maxY ?? Infinity, rawNewY)
            )
          : rawNewY;

      return { x: constrainedX, y: constrainedY };
    },
    [offset, bounds, calculateBounds, boundaryRatio]
  );

  // ==================== 滑鼠事件 ====================

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;

      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };

      onDragStart?.(offset);
    },
    [enabled, offset, onDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled || !isDragging || !dragStartRef.current) return;

      e.preventDefault();
      const newOffset = calculateConstrainedOffset(e.clientX, e.clientY);
      setOffset(newOffset);
      onDragMove?.(newOffset);
    },
    [enabled, isDragging, calculateConstrainedOffset, onDragMove]
  );

  const handleMouseUp = useCallback(() => {
    if (!enabled) return;

    setIsDragging(false);
    dragStartRef.current = null;
    onDragEnd?.(offset);
  }, [enabled, offset, onDragEnd]);

  // ==================== 觸控事件 ====================

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || e.touches.length !== 1) return;

      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      };

      onDragStart?.(offset);
    },
    [enabled, offset, onDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isDragging || !dragStartRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const newOffset = calculateConstrainedOffset(touch.clientX, touch.clientY);
      setOffset(newOffset);
      onDragMove?.(newOffset);
    },
    [enabled, isDragging, calculateConstrainedOffset, onDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;

    setIsDragging(false);
    dragStartRef.current = null;
    onDragEnd?.(offset);
  }, [enabled, offset, onDragEnd]);

  return {
    offset,
    isDragging,
    setOffset,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    containerRef,
  };
}
