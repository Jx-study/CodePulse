import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { renderAll } from "./D3Renderer";
import { useZoom } from "@/shared/hooks/useZoom";
import { useDrag } from "@/shared/hooks/useDrag";
import CanvasShell from "./CanvasShell";
import type { BaseCanvasProps } from "@/types/canvasTypes";
import { computeUnionBBox } from "./useBoxViewBox";
import styles from "./D3Canvas.module.scss";

export interface D3CanvasRef {
  getSVGElement: () => SVGSVGElement | null;
}

export const D3Canvas = forwardRef<D3CanvasRef, BaseCanvasProps>(
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
      showStatusLegend = true,
      allStepsElements,
    },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    // 動態 viewBox 狀態 — lazy initializer 確保第 1 幀即使用正確 viewBox，避免初始跳動
    const [dynamicViewBox, setDynamicViewBox] = useState(() => {
      const stepsToMeasure = allStepsElements?.length
        ? allStepsElements
        : elements.length ? [elements] : null;
      if (!stepsToMeasure) return `0 0 ${width} ${height}`;
      const padding = 40;
      const bbox = computeUnionBBox(stepsToMeasure);
      if (!bbox) return `0 0 ${width} ${height}`;
      const cw = bbox.maxX - bbox.minX + padding * 2;
      const ch = bbox.maxY - bbox.minY + padding * 2;
      return `${bbox.minX - padding} ${bbox.minY - padding} ${cw} ${ch}`;
    });
    const [dynamicMaxZoom, setDynamicMaxZoom] = useState(2.0);
    const zoomRef = useRef(1.0);
    const offsetRef = useRef({ x: 0, y: 0 });
    const dynamicMaxZoomRef = useRef(2.0);
    const prevAllStepsRef = useRef<BaseElement[][] | undefined>(undefined);

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

      // Phase 1: 渲染當前步驟的實際元素（需先執行以取得 containerBBox）
      const { containerBBox } = renderAll(
        svgElement,
        elements,
        links,
        structureType,
        isDirected,
        statusColorMap,
      );

      // Phase 2: ViewBox 計算 — 只在 allStepsElements 改變時執行（新動畫觸發）
      if (allStepsElements !== prevAllStepsRef.current) {
        prevAllStepsRef.current = allStepsElements;

        const stepsToMeasure =
          allStepsElements && allStepsElements.length > 0
            ? allStepsElements
            : [elements];

        const padding = 40;
        const unionBBox = computeUnionBBox(stepsToMeasure);

        if (unionBBox) {
          if (containerBBox) {
            unionBBox.minX = Math.min(unionBBox.minX, containerBBox.minX);
            unionBBox.minY = Math.min(unionBBox.minY, containerBBox.minY);
            unionBBox.maxX = Math.max(unionBBox.maxX, containerBBox.maxX);
            unionBBox.maxY = Math.max(unionBBox.maxY, containerBBox.maxY);
          }
          const contentWidth = unionBBox.maxX - unionBBox.minX + padding * 2;
          const contentHeight = unionBBox.maxY - unionBBox.minY + padding * 2;
          setDynamicViewBox(
            `${unionBBox.minX - padding} ${unionBBox.minY - padding} ${contentWidth} ${contentHeight}`,
          );
          const containerWidth = svgElement.clientWidth;
          if (containerWidth > 0) {
            setDynamicMaxZoom(Math.max(2.0, contentWidth / containerWidth));
          }
        }
      }

      return () => {
        if (svgElement) {
          d3.select(svgElement).selectAll("*").interrupt();
        }
      };
    }, [
      elements,
      links,
      allStepsElements,
      structureType,
      width,
      height,
      isDirected,
      statusColorMap,
    ]);

    return (
      <CanvasShell
        statusConfig={statusConfig}
        enableZoom={enableZoom}
        enablePan={enablePan}
        onReset={handleResetView}
        containerRef={drag.containerRef}
        panEnabled={enablePan}
        isDragging={drag.isDragging}
        containerEventHandlers={{
          onMouseDown: drag.handleMouseDown,
          onMouseMove: drag.handleMouseMove,
          onMouseUp: drag.handleMouseUp,
          onMouseLeave: drag.handleMouseUp,
          onTouchStart: drag.handleTouchStart,
          onTouchMove: drag.handleTouchMove,
          onTouchEnd: drag.handleTouchEnd,
        }}
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
      </CanvasShell>
    );
  },
);
