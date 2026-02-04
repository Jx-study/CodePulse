import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";
import { useZoom } from "@/shared/hooks/useZoom";
import type { Point2D } from '@/types';

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
    forwardedRef
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

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

      // 清理函數：當組件卸載或依賴變更時，中斷所有進行中的 D3 transition
      return () => {
        if (svgElement) {
          // 選擇所有正在進行的 transition 並中斷它們
          const svg = d3.select(svgElement);
          svg.selectAll('*').interrupt();
        }
      };
    }, [elements, links, structureType]);

    // ==================== 拖拽平移事件處理 ====================

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

      // 限制平移範圍，防止拖出可視區域
      const maxOffset = Math.min(width, height) * 0.5; // 最大平移距離為畫布尺寸的一半
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;

      const newOffset = {
        x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
        y: Math.max(-maxOffset, Math.min(maxOffset, newY)),
      };
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
      if (!enablePan || !isDragging || !dragStartRef.current || e.touches.length !== 1) return;

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
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden", // 改回 hidden，防止內容拖出區域
          background: "#111",
          cursor: enablePan ? (isDragging ? "grabbing" : "grab") : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
          ref={contentRef}
          style={{
            width: width,
            height: height,
            transformOrigin: transformOrigin,
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
            pointerEvents: "auto",
          }}
        >
          <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ background: "transparent", display: "block" }}
          />
        </div>
      </div>
    );
  }
);
