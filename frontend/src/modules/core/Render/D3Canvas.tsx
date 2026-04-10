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
import type { Pointer } from "../DataLogic/Pointer";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";
import { useZoom } from "@/shared/hooks/useZoom";
import { useDrag } from "@/shared/hooks/useDrag";
import Button from "@/shared/components/Button";
import StatusLegend from "../components/StatusLegend";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";
import type { BaseCanvasProps } from '@/types/components/display';
import styles from './D3Canvas.module.scss';
import canvasStyles from './canvas.module.scss';

/**
 * 從 data model 直接計算所有動畫步驟的 union bounding box。
 * 不依賴 DOM getBBox()，因此不受 D3 transition 時序影響。
 *
 * 視覺尺寸依據 D3Renderer 的實際渲染邏輯：
 *  - node:    center = position, radius = node.radius (default 20) + 20px for desc text
 *  - box:     center = position, ±width/2, ±height/2  + 20px for label below
 *  - pointer: tip at position
 *    - direction="down" → 向下指，label + arrow 在 position 上方 (minY = y-35)
 *    - direction="up"   → 向上指，label + arrow 在 position 下方 (maxY = y+35)
 */
function computeUnionBBox(
  allStepsElements: BaseElement[][],
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const stepElements of allStepsElements) {
    for (const el of stepElements) {
      const { x, y } = el.position;
      let elMinX: number, elMinY: number, elMaxX: number, elMaxY: number;

      if (el.kind === "node") {
        const r: number = (el as { radius?: number }).radius ?? 20;
        elMinX = x - r;      elMaxX = x + r;
        elMinY = y - r;      elMaxY = y + r + 20;
      } else if (el.kind === "box") {
        const boxEl = el as { width?: number; height?: number; autoScale?: boolean; maxHeight?: number; value?: string };
        const hw = (boxEl.width ?? 60) / 2;
        elMinX = x - hw; elMaxX = x + hw;
        if (boxEl.autoScale) {
          // autoScale bar：正數往上長，負數往下長，最大高度為 maxHeight
          // 保守起見，兩個方向都用 maxH 預留
          const maxH = boxEl.maxHeight ?? 150;
          elMinY = y - maxH;
          elMaxY = y + maxH;
        } else {
          const hh = (boxEl.height ?? 80) / 2;
          elMinY = y - hh; elMaxY = y + hh + 20;
        }
      } else if (el.kind === "pointer") {
        const halfLabel = 30;
        const ptr = el as unknown as Pointer;
        if (ptr.direction === "down") {
          elMinX = x - halfLabel; elMaxX = x + halfLabel;
          elMinY = y - 35;        elMaxY = y;
        } else {
          elMinX = x - halfLabel; elMaxX = x + halfLabel;
          elMinY = y;             elMaxY = y + 35;
        }
      } else {
        elMinX = x - 30; elMaxX = x + 30;
        elMinY = y - 30; elMaxY = y + 30;
      }

      if (elMinX < minX) minX = elMinX;
      if (elMinY < minY) minY = elMinY;
      if (elMaxX > maxX) maxX = elMaxX;
      if (elMaxY > maxY) maxY = elMaxY;
    }
  }

  if (!isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

export interface D3CanvasRef {
  getSVGElement: () => SVGSVGElement | null;
}

interface D3CanvasOwnProps extends BaseCanvasProps {
  elements: BaseElement[];
  links?: Link[];
  structureType?: string;
  /** Optional custom status color map - 可選的自訂狀態顏色映射表 */
  statusColorMap?: StatusColorMap;
  /** Optional custom status configuration - 可選的自訂狀態配置 */
  statusConfig?: StatusConfig;
  isDirected?: boolean;
  /** 是否顯示狀態圖例 (預設: true) */
  showStatusLegend?: boolean;
  /**
   * 所有動畫步驟的元素陣列集合（每步一個 BaseElement[]）。
   * 提供時：在此 reference 改變時對所有步驟做 union bbox 計算，
   * 確保 viewBox 能包含整個動畫期間出現的所有元素，不隨每步更新。
   * 未提供時：沿用原有行為（每次 elements 改變都重算 viewBox）。
   */
  allStepsElements?: BaseElement[][];
}

export const D3Canvas = forwardRef<
  D3CanvasRef,
  D3CanvasOwnProps
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
        {showStatusLegend && (
          <div className={styles.statusLegendContainer}>
            <StatusLegend statusConfig={statusConfig} />
          </div>
        )}

        {/* Reset 按鈕 */}
        {(enableZoom || enablePan) && (
          <div className={canvasStyles.resetButtonContainer}>
            <Button
              variant="icon"
              size="sm"
              onClick={handleResetView}
              aria-label="重置視圖"
              className={canvasStyles.resetButton}
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
