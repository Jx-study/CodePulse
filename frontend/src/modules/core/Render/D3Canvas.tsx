import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";
import { useZoom } from "@/shared/hooks/useZoom";
import { useDrag } from "@/shared/hooks/useDrag";
import Button from "@/shared/components/Button";
import StatusLegend from "../components/StatusLegend";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";
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
    /** Optional custom status color map - 可選的自訂狀態顏色映射表 */
    statusColorMap?: StatusColorMap;
    /** Optional custom status configuration - 可選的自訂狀態配置 */
    statusConfig?: StatusConfig;
    isDirected?: boolean;
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
      statusColorMap,
      statusConfig,
      isDirected = false,
    },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // 動態 viewBox 狀態
    const [dynamicViewBox, setDynamicViewBox] = useState(
      `0 0 ${width} ${height}`,
    );
    const [dynamicMaxZoom, setDynamicMaxZoom] = useState(2.0);
    const zoomRef = useRef(1.0);
    const offsetRef = useRef({ x: 0, y: 0 });
    const dynamicMaxZoomRef = useRef(2.0);

    const calculateBounds = useCallback(
      (container: HTMLElement | null | undefined) => {
        if (!container) return {};
        const { clientWidth, clientHeight } = container;
        const limitX = clientWidth * zoomRef.current;
        const limitY = clientHeight * zoomRef.current;
        return { minX: -limitX, maxX: limitX, minY: -limitY, maxY: limitY };
      },
      [],
    );

    const drag = useDrag<HTMLDivElement>({
      enabled: enablePan,
      calculateBounds,
    });

    // 縮放功能
    const { zoomLevel, resetZoom, setZoomLevel } = useZoom({
      minZoom: 0.5,
      maxZoom: dynamicMaxZoom,
      initialZoom: 1.0,
      step: 0.1,
      enableWheelZoom: false,
      enablePinchZoom: enableZoom,
      enableMouseCenteredZoom: false,
      targetRef: drag.containerRef,
    });
    zoomRef.current = zoomLevel;
    offsetRef.current = drag.offset;
    dynamicMaxZoomRef.current = dynamicMaxZoom;

    // 重置視圖（縮放 + 位移）
    const handleResetView = () => {
      resetZoom();
      drag.setOffset({ x: 0, y: 0 });
    };

    useImperativeHandle(forwardedRef, () => ({
      getSVGElement: () => svgRef.current,
    }));

    useEffect(() => {
      if (!enableZoom) return;
      const container = drag.containerRef.current;
      if (!container) return;

      const STEP = 0.1;
      const MIN_ZOOM = 0.5;

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();

        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const factor = e.deltaY > 0 ? 1 / (1 + STEP) : 1 + STEP;
        const oldZoom = zoomRef.current;
        const newZoom = Math.max(
          MIN_ZOOM,
          Math.min(dynamicMaxZoomRef.current, oldZoom * factor),
        );
        if (newZoom === oldZoom) return;

        // 讓鼠標下的點保持不動
        const scaleRatio = newZoom / oldZoom;
        const { x: oldTx, y: oldTy } = offsetRef.current;
        const rawNewOffset = {
          x: mx - (mx - oldTx) * scaleRatio,
          y: my - (my - oldTy) * scaleRatio,
        };

        // 套用 pan 邊界
        const limitX = container.clientWidth * newZoom;
        const limitY = container.clientHeight * newZoom;
        const clampedOffset = {
          x: Math.max(-limitX, Math.min(limitX, rawNewOffset.x)),
          y: Math.max(-limitY, Math.min(limitY, rawNewOffset.y)),
        };

        setZoomLevel(newZoom);
        drag.setOffset(clampedOffset);
      };

      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }, [enableZoom, drag.containerRef, drag.setOffset, setZoomLevel]);

    useEffect(() => {
      const svgElement = svgRef.current;
      if (!svgElement) return;

      renderAll(svgElement, elements, links, structureType, isDirected, statusColorMap);

      // 動態計算 viewBox 以適應內容
      try {
        const bbox = svgElement.getBBox();
        const padding = 40;

        // 如果 bbox 有效（非零寬高），則更新 viewBox
        if (bbox.width > 0 && bbox.height > 0) {
          const contentWidth = bbox.width + padding * 2;
          const contentHeight = bbox.height + padding * 2;
          const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${contentWidth} ${contentHeight}`;
          setDynamicViewBox(newViewBox);

          // 動態計算 maxZoom：確保使用者能縮放到 1 SVG px = 1 CSS px（即看到自然大小）
          const containerWidth = svgElement.clientWidth;
          if (containerWidth > 0) {
            const naturalZoom = contentWidth / containerWidth;
            setDynamicMaxZoom(Math.max(2.0, naturalZoom));
          }
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
    }, [elements, links, structureType, width, height, isDirected, statusColorMap]);

    return (
      <div
        ref={drag.containerRef}
        className={`${styles.canvasContainer} ${drag.isDragging ? styles.dragging : ""} ${enablePan ? styles["pan-enabled"] : ""}`}
        onMouseDown={drag.handleMouseDown}
        onMouseMove={drag.handleMouseMove}
        onMouseUp={drag.handleMouseUp}
        onMouseLeave={drag.handleMouseUp}
        onTouchStart={drag.handleTouchStart}
        onTouchMove={drag.handleTouchMove}
        onTouchEnd={drag.handleTouchEnd}
      >
        <div
          ref={contentRef}
          className={`${styles.canvasContent} ${drag.isDragging ? styles.dragging : ""}`}
          style={{
            transformOrigin: "0 0",
            transform: `translate(${drag.offset.x}px, ${drag.offset.y}px) scale(${zoomLevel})`,
          }}
        >
          <svg
            ref={svgRef}
            viewBox={dynamicViewBox}
            preserveAspectRatio="xMidYMid meet"
            className={styles.canvas}
          />
        </div>

        {/* 狀態圖例 */}
        <div className={styles.statusLegendContainer}>
          <StatusLegend statusConfig={statusConfig} />
        </div>

        {/* Reset 按鈕 */}
        {(enableZoom || enablePan) && (
          <div className={styles.resetButtonContainer}>
            <Button
              variant="icon"
              size="sm"
              onClick={handleResetView}
              aria-label="重置視圖"
              className={styles.resetButton}
              icon="rotate-right"
              iconOnly
            >
            </Button>
          </div>
        )}
      </div>
    );
  },
);
