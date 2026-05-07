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
import { circleBoundaryPoint } from "./linkGeometry";
import { useZoom } from "@/shared/hooks/useZoom";
import { useDrag } from "@/shared/hooks/useDrag";
import CanvasShell from "./CanvasShell";
import type { AnimatableCanvasRef, D3CanvasProps } from "@/types/canvasTypes";
import { computeUnionBBox } from "./useBoxViewBox";
import styles from "./D3Canvas.module.scss";

export interface D3CanvasRef extends AnimatableCanvasRef {
  getSVGElement: () => SVGSVGElement | null;
}

export const D3Canvas = forwardRef<
  D3CanvasRef,
  D3CanvasProps
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
      isDirected = false,
      allStepsElements,
      showStatusLegend = true,
    },
    forwardedRef,
  ) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const elementsRef = useRef<BaseElement[]>(elements);
    const animDefsRef = useRef<SVGDefsElement | null>(null);
    const animStateRef = useRef<Map<string, number>>(new Map());
    const animatingNodesRef = useRef<Set<string>>(new Set());
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
        const BLEND = 0.12;
        const els = elementsRef.current;
        const srcEl = els.find((e) => String(e.id) === sourceId) as
          | Node
          | undefined;
        const tgtEl = els.find((e) => String(e.id) === targetId) as
          | Node
          | undefined;
        if (!srcEl || !tgtEl) return;
        if (srcEl.id === tgtEl.id) return;

        const linkEl = d3
          .select(svgRef.current)
          .selectAll<SVGPathElement, unknown>("path.link")
          .filter(
            (d: unknown) =>
              !!d &&
              typeof d === "object" &&
              "s" in d &&
              "t" in d &&
              String((d as { s: { id: unknown } }).s.id) === sourceId &&
              String((d as { t: { id: unknown } }).t.id) === targetId,
          )
          .node();
        const rawStroke = linkEl?.getAttribute("stroke") ?? "#888";
        const fromColor = rawStroke.startsWith("url(")
          ? tgtEl.getColor()
          : rawStroke;

        const key = `${sourceId}->${targetId}`;
        const gradId = `d3c-anim-${sourceId}-${targetId}`.replace(
          /[^a-zA-Z0-9_-]/g,
          "_",
        );
        const arrowMarkerId = `d3c-anim-arrow-${sourceId}-${targetId}`.replace(
          /[^a-zA-Z0-9_-]/g,
          "_",
        );

        const existing = animStateRef.current.get(key);
        if (existing !== undefined) {
          cancelAnimationFrame(existing);
          if (animDefsRef.current) {
            const ad = d3.select(animDefsRef.current);
            ad.select(`#${gradId}`).remove();
            ad.select(`#${arrowMarkerId}`).remove();
          }
        }

        const startTime = performance.now();
        const tick = () => {
          const svgEl = svgRef.current;
          const defs = animDefsRef.current;
          if (!svgEl || !defs) return;

          const s = Math.min((performance.now() - startTime) / duration, 1);
          const linkT = Math.min(s / 0.75, 1);
          const frontPct = `${linkT * 100}%`;
          const blendEndPct = `${Math.min(linkT + BLEND, 1) * 100}%`;

          const srcN = els.find((e) => String(e.id) === sourceId) as
            | Node
            | undefined;
          const tgtN = els.find((e) => String(e.id) === targetId) as
            | Node
            | undefined;
          if (!srcN || !tgtN) return;

          const p1 = circleBoundaryPoint(
            {
              x: srcN.position.x,
              y: srcN.position.y,
              r: srcN.radius ?? 20,
            },
            { x: tgtN.position.x, y: tgtN.position.y },
          );
          const p2 = circleBoundaryPoint(
            {
              x: tgtN.position.x,
              y: tgtN.position.y,
              r: tgtN.radius ?? 20,
            },
            { x: srcN.position.x, y: srcN.position.y },
          );

          const d3Defs = d3.select(defs);

          if (d3Defs.select(`#${gradId}`).empty()) {
            const g = d3Defs
              .append("linearGradient")
              .attr("id", gradId)
              .attr("gradientUnits", "userSpaceOnUse");
            g.append("stop").attr("class", "g-s1");
            g.append("stop").attr("class", "g-s2");
            g.append("stop").attr("class", "g-s3");
            g.append("stop").attr("class", "g-s4");
          }
          d3Defs
            .select(`#${gradId}`)
            .attr("x1", p1.x)
            .attr("y1", p1.y)
            .attr("x2", p2.x)
            .attr("y2", p2.y);
          d3Defs
            .select(`#${gradId} .g-s1`)
            .attr("offset", "0%")
            .attr("stop-color", toColor);
          d3Defs
            .select(`#${gradId} .g-s2`)
            .attr("offset", frontPct)
            .attr("stop-color", toColor);
          d3Defs
            .select(`#${gradId} .g-s3`)
            .attr("offset", blendEndPct)
            .attr("stop-color", fromColor);
          d3Defs
            .select(`#${gradId} .g-s4`)
            .attr("offset", "100%")
            .attr("stop-color", fromColor);

          d3.select(svgEl)
            .selectAll<SVGPathElement, unknown>("path.link")
            .filter(
              (d: unknown) =>
                !!d &&
                typeof d === "object" &&
                "s" in d &&
                "t" in d &&
                String((d as { s: { id: unknown } }).s.id) === sourceId &&
                String((d as { t: { id: unknown } }).t.id) === targetId,
            )
            .attr("stroke", `url(#${gradId})`);

          if (isDirectedRef.current && !shouldHideArrowRef.current) {
            if (d3Defs.select(`#${arrowMarkerId}`).empty()) {
              const m = d3Defs
                .append("marker")
                .attr("id", arrowMarkerId)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 10)
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto");
              m.append("path").attr("d", "M0,-5L10,0L0,5");
              d3.select(svgEl)
                .selectAll<SVGPathElement, unknown>("path.link")
                .filter(
                  (d: unknown) =>
                    !!d &&
                    typeof d === "object" &&
                    "s" in d &&
                    "t" in d &&
                    String((d as { s: { id: unknown } }).s.id) === sourceId &&
                    String((d as { t: { id: unknown } }).t.id) === targetId,
                )
                .attr("marker-end", `url(#${arrowMarkerId})`);
            }
            const arrowT = Math.max(0, (linkT - (1 - BLEND)) / BLEND);
            d3Defs
              .select(`#${arrowMarkerId} path`)
              .attr(
                "fill",
                d3.interpolateRgb(fromColor, toColor)(Math.min(arrowT, 1)),
              );
          }

          if (s < 1) {
            animStateRef.current.set(key, requestAnimationFrame(tick));
          } else {
            d3.select(svgEl)
              .selectAll<SVGPathElement, unknown>("path.link")
              .filter(
                (d: unknown) =>
                  !!d &&
                  typeof d === "object" &&
                  "s" in d &&
                  "t" in d &&
                  String((d as { s: { id: unknown } }).s.id) === sourceId &&
                  String((d as { t: { id: unknown } }).t.id) === targetId,
              )
              .attr("stroke", toColor);
            d3Defs.select(`#${gradId}`).remove();

            if (isDirectedRef.current && !shouldHideArrowRef.current) {
              d3Defs.select(`#${arrowMarkerId}`).remove();
              d3.select(svgEl)
                .selectAll<SVGPathElement, unknown>("path.link")
                .filter(
                  (d: unknown) =>
                    !!d &&
                    typeof d === "object" &&
                    "s" in d &&
                    "t" in d &&
                    String((d as { s: { id: unknown } }).s.id) === sourceId &&
                    String((d as { t: { id: unknown } }).t.id) === targetId,
                )
                .attr("marker-end", "url(#arrowhead)");
            } else if (shouldHideArrowRef.current) {
              d3Defs.select(`#${arrowMarkerId}`).remove();
              d3.select(svgEl)
                .selectAll<SVGPathElement, unknown>("path.link")
                .filter(
                  (d: unknown) =>
                    !!d &&
                    typeof d === "object" &&
                    "s" in d &&
                    "t" in d &&
                    String((d as { s: { id: unknown } }).s.id) === sourceId &&
                    String((d as { t: { id: unknown } }).t.id) === targetId,
                )
                .attr("marker-end", "none");
            }

            animStateRef.current.delete(key);
            onComplete?.();
          }
        };

        animStateRef.current.set(key, requestAnimationFrame(tick));
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

      // Phase 1: 渲染當前步驟的實際元素（需先執行以取得 containerBBox）
      const { containerBBox } = renderAll(
        svgElement,
        elements,
        links,
        structureType,
        isDirected,
        statusColorMap,
        { animStateRef, animatingNodesRef },
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
        animStateRef.current.forEach((id) => cancelAnimationFrame(id));
        animStateRef.current.clear();
        animDefsRef.current = null;
        animatingNodesRef.current.clear();
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
        containerRef={drag.containerRef}
        panEnabled={enablePan}
        isDragging={drag.isDragging}
        enableZoom={enableZoom}
        enablePan={enablePan}
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
