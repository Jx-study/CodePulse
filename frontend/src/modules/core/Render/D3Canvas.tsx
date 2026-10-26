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
import { Node } from "../DataLogic/Node";
import { renderAll } from "./D3Renderer";
import type { Link } from "./D3Renderer";
import {
  linkAnimBoundaryPoints,
  makeLinkAnimIds,
  runLinkColorAnimation,
} from "./linkColorAnimation";
import { useZoom } from "@/shared/hooks/useZoom";
import { useDrag } from "@/shared/hooks/useDrag";
import CanvasShell from "./CanvasShell";
import type { AnimatableCanvasRef } from "@/types/canvasTypes";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";
import { computeUnionBBox } from "./useBoxViewBox";
import styles from "./D3Canvas.module.scss";

export interface D3CanvasRef extends AnimatableCanvasRef {
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
    showStatusLegend?: boolean;
    /**
     * 雙向連線時是否畫兩條平行偏移箭頭（與 isDirected 資料語義分離；預設 false）
     */
    showBidirectionalArrows?: boolean;
    /**
     * 所有動畫步驟的元素陣列集合（每步一個 BaseElement[]）。
     * 提供時：在此 reference 改變時對所有步驟做 union bbox 計算，
     * 確保 viewBox 能包含整個動畫期間出現的所有元素，不隨每步更新。
     * 未提供時：沿用原有行為（每次 elements 改變都重算 viewBox）。
     */
    allStepsElements?: BaseElement[][];
  }
>(
  (
    {
      elements,
      links = [],
      width = 800,
      height = 600,
      structureType = "linkedlist",
      enableZoom = true,
      enablePan = true,
      statusColorMap,
      statusConfig,
      showStatusLegend = true,
      isDirected = false,
      showBidirectionalArrows = false,
      allStepsElements,
    },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const elementsRef = useRef<BaseElement[]>(elements);
    const animDefsRef = useRef<SVGDefsElement | null>(null);
    const animStateRef = useRef<Map<string, number>>(new Map());
    const isDirectedRef = useRef(isDirected);
    const shouldHideArrowRef = useRef(false);

    elementsRef.current = elements;
    isDirectedRef.current = isDirected;
    const forceHideArrow = ["bfs", "dfs", "binarytree", "bst"].includes(
      structureType,
    );
    shouldHideArrowRef.current =
      structureType === "graph" || structureType === "dijkstra"
        ? !isDirected
        : forceHideArrow;

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
      animateLink(
        sourceId: string,
        targetId: string,
        toColor: string,
        duration = 1200,
        onComplete?: () => void,
      ) {
        const els = elementsRef.current;
        const srcEl = els.find((e) => String(e.id) === sourceId) as
          | Node
          | undefined;
        const tgtEl = els.find((e) => String(e.id) === targetId) as
          | Node
          | undefined;
        if (!srcEl || !tgtEl) return;
        if (srcEl.id === tgtEl.id) return;

        const selectLinkPath = (svgEl: SVGSVGElement | null) =>
          d3
            .select(svgEl)
            .selectAll<SVGPathElement, unknown>("path.link")
            .filter(
              (d: unknown) =>
                !!d &&
                typeof d === "object" &&
                "s" in d &&
                "t" in d &&
                String((d as { s: { id: unknown } }).s.id) === sourceId &&
                String((d as { t: { id: unknown } }).t.id) === targetId,
            );

        const linkEl = selectLinkPath(svgRef.current).node();
        const rawStroke = linkEl?.getAttribute("stroke") ?? "#888";
        const fromColor = rawStroke.startsWith("url(")
          ? tgtEl.getColor()
          : rawStroke;

        const { gradId, arrowMarkerId } = makeLinkAnimIds(
          "d3c",
          sourceId,
          targetId,
        );

        runLinkColorAnimation({
          key: `${sourceId}->${targetId}`,
          gradId,
          arrowMarkerId,
          fromColor,
          toColor,
          duration,
          progressScale: 0.75,
          getSvgEl: () => svgRef.current,
          getAnimDefs: () => animDefsRef.current,
          getBoundaryPoints: () => {
            const els = elementsRef.current;
            const srcN = els.find((e) => String(e.id) === sourceId) as
              | Node
              | undefined;
            const tgtN = els.find((e) => String(e.id) === targetId) as
              | Node
              | undefined;
            if (!srcN || !tgtN) return null;
            return linkAnimBoundaryPoints(
              { x: srcN.position.x, y: srcN.position.y, r: srcN.radius ?? 20 },
              { x: tgtN.position.x, y: tgtN.position.y, r: tgtN.radius ?? 20 },
            );
          },
          selectLinkPath,
          showDirectedArrow:
            isDirectedRef.current && !shouldHideArrowRef.current,
          defaultArrowMarkerUrl: "url(#arrowhead)",
          forceHideArrowOnComplete: shouldHideArrowRef.current,
          animStateRef,
          onComplete,
        });
      },
    }),
    []);

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

      const svg = d3.select(svgElement);
      let animDefs = svg.select<SVGDefsElement>("defs#anim-defs");
      if (animDefs.empty()) {
        animDefs = svg
          .append("defs")
          .attr("id", "anim-defs") as unknown as d3.Selection<
          SVGDefsElement,
          unknown,
          null,
          undefined
        >;
      }
      animDefsRef.current = animDefs.node();

      // ViewBox 計算 — 只在 allStepsElements 改變時執行（新動畫觸發）。
      // 不使用 renderAll 前置呼叫取得 containerBBox（會造成雙重 D3 轉場競爭）；
      // linked list 節點範圍已由 computeUnionBBox 涵蓋。
      if (allStepsElements !== prevAllStepsRef.current) {
        prevAllStepsRef.current = allStepsElements;

        const stepsToMeasure =
          allStepsElements && allStepsElements.length > 0
            ? allStepsElements
            : [elements];

        const padding = 40;
        const unionBBox = computeUnionBBox(stepsToMeasure);

        if (unionBBox) {
          const contentWidth = unionBBox.maxX - unionBBox.minX + padding * 2;
          const contentHeight = unionBBox.maxY - unionBBox.minY + padding * 2;
          const newViewBox = `${unionBBox.minX - padding} ${unionBBox.minY - padding} ${contentWidth} ${contentHeight}`;
          // Sync DOM update before renderAll starts transitions — prevents mid-transition
          // viewBox jump caused by the async React re-render from setDynamicViewBox.
          svgElement.setAttribute("viewBox", newViewBox);
          setDynamicViewBox(newViewBox);
          const containerWidth = svgElement.clientWidth;
          if (containerWidth > 0) {
            setDynamicMaxZoom(Math.max(2.0, contentWidth / containerWidth));
          }
        }
      }

      renderAll(
        svgElement,
        elements,
        links,
        structureType,
        isDirected,
        statusColorMap,
        showBidirectionalArrows,
      );

      return () => {
        if (svgElement) {
          d3.select(svgElement).selectAll("*").interrupt();
        }
        animStateRef.current.forEach((id) => cancelAnimationFrame(id));
        animStateRef.current.clear();
        animDefsRef.current = null;
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
      showBidirectionalArrows,
    ]);

    return (
      <CanvasShell
        containerRef={drag.containerRef}
        panEnabled={enablePan}
        isDragging={drag.isDragging}
        enableZoom={enableZoom}
        enablePan={enablePan}
        showStatusLegend={showStatusLegend}
        onReset={handleResetView}
        statusConfig={showStatusLegend ? statusConfig : undefined}
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
