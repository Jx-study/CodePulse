import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";
import { useZoom } from "@/shared/hooks/useZoom";
import type { Point2D } from '@/types';
import styles from './D3Canvas.module.scss';

export interface D3CanvasRef {
  getSVGElement: () => SVGSVGElement | null;
}

export const D3Canvas = forwardRef<
  D3CanvasRef,
  {
    elements: BaseElement[];
    links?: Link[];
    width?: number;
    height?: number;
    structureType?: string;
    /** 是否啟用縮放功能 (預設: true) */
    enableZoom?: boolean;
    /** 是否啟用拖拽平移功能 (預設: true) */
    enablePan?: boolean;
  }
>(
  (
    {
      elements,
      links = [],
      width = 800,
      height = 600,
      structureType = "linkedlist", // default value
      enableZoom = true,
      enablePan = true,
    },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // 動態 viewBox 狀態
    const [dynamicViewBox, setDynamicViewBox] = useState(
      `0 0 ${width} ${height}`,
    );

    // 拖拽平移狀態
    const [offset, setOffset] = useState<Point2D>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<Point2D | null>(null);

    // 縮放功能
    const { zoomLevel, transformOrigin } = useZoom({
      minZoom: 0.5,
      maxZoom: 2.0,
      initialZoom: 1.0,
      step: 0.1,
      enableWheelZoom: enableZoom,
      enablePinchZoom: enableZoom,
      enableMouseCenteredZoom: enableZoom,
      targetRef: containerRef as React.RefObject<HTMLElement>,
    });

    useImperativeHandle(forwardedRef, () => ({
      getSVGElement: () => svgRef.current,
    }));

    useEffect(() => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      renderAll(svgElement, elements, links, structureType);

      // 動態計算 viewBox 以適應內容
      try {
        const bbox = svgElement.getBBox();
        const padding = 40;

        // 如果 bbox 有效（非零寬高），則更新 viewBox
        if (bbox.width > 0 && bbox.height > 0) {
          const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
          setDynamicViewBox(newViewBox);
        }
      } catch (error) {
        // getBBox 可能在某些情況下失敗（如 SVG 為空），使用預設值
        console.warn("Failed to calculate SVG bounding box:", error);
        setDynamicViewBox(`0 0 ${width} ${height}`);
      }

      // 清理函數：當組件卸載或依賴變更時，中斷所有進行中的 D3 transition
      return () => {
        if (svgElement) {
          // 選擇所有正在進行的 transition 並中斷它們
          const svg = d3.select(svgElement);
          svg.selectAll("*").interrupt();
        }
      };
    }, [elements, links, structureType, width, height]);

    // ==================== 拖拽平移事件處理 ====================

    /**
     * 計算並限制新的位移量
     * @param clientX 當前鼠標/觸摸 X
     * @param clientY 當前鼠標/觸摸 Y
     */
    const calculateNewOffset = (clientX: number, clientY: number) => {
      if (!containerRef.current || !dragStartRef.current) return offset;

      const { clientWidth, clientHeight } = containerRef.current;

      // 計算滑鼠移動的距離差 (Delta)
      // 原理: 新的 offset = 當前 clientX - 基準點
      const rawNewX = clientX - dragStartRef.current.x;
      const rawNewY = clientY - dragStartRef.current.y;

      // 設定邊界係數 (0.8 表示允許拖曳直到中心點偏離容器中心的 80%)
      const boundaryRatio = 0.8;

      // 使用容器實際尺寸計算限制範圍
      const limitX = clientWidth * boundaryRatio;
      const limitY = clientHeight * boundaryRatio;

      return {
        x: Math.max(-limitX, Math.min(limitX, rawNewX)),
        y: Math.max(-limitY, Math.min(limitY, rawNewY)),
      };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!enablePan) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!enablePan || !isDragging || !dragStartRef.current) return;
      e.preventDefault();
      const newOffset = calculateNewOffset(e.clientX, e.clientY);
      setOffset(newOffset);
    };

    const handleMouseUp = () => {
      if (!enablePan) return;
      setIsDragging(false);
      dragStartRef.current = null;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (!enablePan || e.touches.length !== 1) return;

      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (
        !enablePan ||
        !isDragging ||
        !dragStartRef.current ||
        e.touches.length !== 1
      )
        return;

      const touch = e.touches[0];

      // 限制平移範圍，防止拖出可視區域
      const maxOffset = Math.min(width, height) * 0.5; // 最大平移距離為畫布尺寸的一半
      const newX = touch.clientX - dragStartRef.current.x;
      const newY = touch.clientY - dragStartRef.current.y;

      const newOffset = {
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      };
      setOffset(newOffset);
    };

    const handleTouchEnd = () => {
      if (!enablePan) return;
      setIsDragging(false);
      dragStartRef.current = null;
    };

    return (
      <div
        ref={containerRef}
        className={`${styles.canvasContainer} ${isDragging ? styles.dragging : ""} ${enablePan ? styles["pan-enabled"] : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={contentRef}
          className={`${styles.canvasContent} ${isDragging ? styles.dragging : ""}`}
          style={{
            transformOrigin: transformOrigin,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
          }}
        >
          <svg
            ref={svgRef}
            viewBox={dynamicViewBox}
            preserveAspectRatio="xMidYMid meet"
            className={styles.canvas}
          />
        </div>
      </div>
    );
  }
);
