import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  drag as d3Drag,
  select as d3Select,
  zoom as d3Zoom,
  zoomIdentity,
  easeQuadOut,
} from "d3";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { Node } from "../DataLogic/Node";
import { Box } from "../DataLogic/Box";
import type { Link } from "./D3Renderer";
import { linkStatusColorMap } from "./D3Renderer";
import type { StatusColorMap, StatusConfig } from "@/types/statusConfig";
import Button from "@/shared/components/Button";
import StatusLegend from "../components/StatusLegend";
import {
  circleBoundaryPoint,
  straightLinkPath,
  weightLabelCenter,
} from "./linkGeometry";
import styles from "./GraphCanvas.module.scss";

// SVG arc 自環路徑：在 angle 方向畫一個近圓形的環
function selfLoopPath(cx: number, cy: number, r: number, angle: number): string {
  const spread = Math.PI / 3.5;
  const loopR = r;
  const sx = cx + r * Math.cos(angle - spread);
  const sy = cy + r * Math.sin(angle - spread);
  const ex = cx + r * Math.cos(angle + spread);
  const ey = cy + r * Math.sin(angle + spread);
  return `M ${sx},${sy} A ${loopR},${loopR},0,1,1,${ex},${ey}`;
}

function deduplicateLinks(links: Link[], isDirected: boolean): GSimLink[] {
  const seenPairs = new Set<string>();
  return links.reduce<GSimLink[]>((acc, l) => {
    const key = isDirected ? `${l.sourceId}->${l.targetId}` : [l.sourceId, l.targetId].sort().join("--");
    if (!seenPairs.has(key)) {
      seenPairs.add(key);
      acc.push({ source: l.sourceId, target: l.targetId, sourceId: l.sourceId, targetId: l.targetId, status: l.status, weight: l.weight });
    }
    return acc;
  }, []);
}

// 與 D3Canvas 相容的子集 props
export interface GraphCanvasProps {
  elements: BaseElement[];
  links?: Link[];
  width?: number;
  height?: number;
  statusColorMap?: StatusColorMap;
  statusConfig?: StatusConfig;
  isDirected?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  /** 所有動畫步驟的元素陣列，用於預計算含 Box 的 viewBox（與 D3Canvas 一致）*/
  allStepsElements?: BaseElement[][];
  /** 資料結構/演算法類型，用於繪製 container 裝飾線（如 topological-sort 的 Queue 框）*/
  structureType?: string;
}

interface GSimNode extends SimulationNodeDatum {
  id: string;
  radius: number;
}

interface GSimLink extends SimulationLinkDatum<GSimNode> {
  source: string | GSimNode;
  target: string | GSimNode;
  sourceId: string;
  targetId: string;
  status?: string;
  weight?: number | string;
}

export function GraphCanvas({
  elements,
  links = [],
  width = 800,
  height = 500,
  isDirected = false,
  statusColorMap,
  statusConfig,
  enableZoom = true,
  enablePan = true,
  allStepsElements,
  structureType,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<ReturnType<typeof forceSimulation<GSimNode>> | null>(null);
  const zoomBehaviorRef = useRef<ReturnType<typeof d3Zoom<SVGSVGElement, unknown>> | null>(null);
  const posCacheRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const prevLinkKeyRef = useRef<string>("");
  const seenSelfLoopsRef = useRef<Set<string>>(new Set());
  const linkSetRef = useRef<Set<string>>(new Set());

  // 動態 viewBox：只向外擴張（用於 Box 元素超出預設範圍時）
  const [svgViewBox, setSvgViewBox] = useState(`0 0 ${width} ${height}`);
  const maxExtentRef = useRef({ maxX: width, maxY: height });

  // 注入 statusColorMap 到 elements（與 D3Renderer 一致）
  useEffect(() => {
    if (statusColorMap) {
      elements.forEach((el) => {
        el.setCustomColorMap(statusColorMap);
      });
    }
  }, [elements, statusColorMap]);

  const nodeElements = useMemo(
    () => elements.filter((e): e is Node => e instanceof Node),
    [elements],
  );

  // 結構識別 key — 只有節點 ID 集合改變才重建 simulation
  const nodeIds = useMemo(
    () => nodeElements.map((e) => e.id).sort().join(","),
    [nodeElements],
  );

  const handleResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3Select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  // Effect 1：重建 simulation（節點集合異動時）
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3Select(svgRef.current);
    svg.selectAll("*").remove();

    if (nodeElements.length === 0) return;

    // 箭頭標記（有向圖）— 每個 status 各一個，顏色跟著邊的狀態走
    if (isDirected) {
      const defs = svg.append("defs");
      Object.entries(linkStatusColorMap).forEach(([status, color]) => {
        defs
          .append("marker")
          .attr("id", `gc-arrowhead-${status}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 10)
          .attr("refY", 0)
          .attr("markerWidth", 6)
          .attr("markerHeight", 6)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", color);
      });
    }

    // Zoom + Pan（D3 zoom 套用在 SVG，transform 作用於 mainGroup）
    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3.0])
      .filter((event: Event) => {
        const target = event.target as Element;
        return event.type === "wheel" || !target.closest("circle");
      });

    const mainGroup = svg.append("g").attr("class", "main-group");
    zoomBehavior.on("zoom", (event) => {
      mainGroup.attr("transform", event.transform.toString());
    });
    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    // 以現有快取節點的重心 + 外緣偏移為新節點的初始位置
    // 不能從 centroid 出發：那是斥力最強點，alpha=1.0 時會被彈飛
    const cachedPositions = Array.from(posCacheRef.current.values());
    const centroidX =
      cachedPositions.length > 0
        ? cachedPositions.reduce((s, p) => s + p.x, 0) / cachedPositions.length
        : width / 2;
    const centroidY =
      cachedPositions.length > 0
        ? cachedPositions.reduce((s, p) => s + p.y, 0) / cachedPositions.length
        : height / 2;
    // cluster 平均半徑：從 centroid 到各快取節點的平均距離
    const avgClusterRadius =
      cachedPositions.length > 0
        ? cachedPositions.reduce(
            (s, p) =>
              s + Math.sqrt((p.x - centroidX) ** 2 + (p.y - centroidY) ** 2),
            0,
          ) / cachedPositions.length
        : 80;

    const simNodes: GSimNode[] = nodeElements.map((e) => {
      const cached = posCacheRef.current.get(e.id);
      if (cached) return { id: e.id, radius: e.radius ?? 20, x: cached.x, y: cached.y };
      // 新節點從 cluster 外緣出發，forceLink 自然將它拉向鄰居
      const angle = Math.random() * 2 * Math.PI;
      const dist = avgClusterRadius + 60 + Math.random() * 40;
      return {
        id: e.id,
        radius: e.radius ?? 20,
        x: centroidX + Math.cos(angle) * dist,
        y: centroidY + Math.sin(angle) * dist,
      };
    });

    const simLinks: GSimLink[] = deduplicateLinks(links, isDirected);

    // 軟邊界 force：節點靠近邊界時施加推回力，防止飛出視角
    function boundaryForce(padding: number) {
      return function (alpha: number) {
        const rightBoundary =
          structureType === "topological-sort" ? Math.min(width, 750) : width;

        simNodes.forEach((n) => {
          const r = (n.radius ?? 20) + padding;
          const x = n.x ?? 0;
          const y = n.y ?? 0;
          if (x < r) n.vx = (n.vx ?? 0) + (r - x) * alpha;
          if (x > rightBoundary - r) n.vx = (n.vx ?? 0) + (rightBoundary - r - x) * alpha;
          if (y < r) n.vy = (n.vy ?? 0) + (r - y) * alpha;
          if (y > height - r) n.vy = (n.vy ?? 0) + (height - r - y) * alpha;
        });
      };
    }

    // 找出 nodeId 連線最少的方向作為自環擺放角度
    const getSelfLoopAngle = (nodeId: string): number => {
      const node = simNodes.find((n) => n.id === nodeId);
      if (!node) return -Math.PI / 2;

      const angles: number[] = [];
      simLinks.forEach((link) => {
        if (link.sourceId === link.targetId) return;
        let neighbor: GSimNode | undefined;
        if (link.sourceId === nodeId) {
          neighbor = typeof link.target === "object"
            ? (link.target as GSimNode)
            : simNodes.find((n) => n.id === link.targetId);
        } else if (link.targetId === nodeId) {
          neighbor = typeof link.source === "object"
            ? (link.source as GSimNode)
            : simNodes.find((n) => n.id === link.sourceId);
        }
        if (neighbor) {
          angles.push(Math.atan2((neighbor.y ?? 0) - (node.y ?? 0), (neighbor.x ?? 0) - (node.x ?? 0)));
        }
      });

      if (angles.length === 0) return -Math.PI / 2;

      angles.sort((a, b) => a - b);

      let maxGap = 0;
      let bestAngle = -Math.PI / 2;
      for (let i = 0; i < angles.length; i++) {
        const next = (i + 1) % angles.length;
        let gap = angles[next] - angles[i];
        if (next === 0) gap += 2 * Math.PI;
        if (gap > maxGap) {
          maxGap = gap;
          bestAngle = angles[i] + gap / 2;
        }
      }
      return ((bestAngle + Math.PI) % (2 * Math.PI)) - Math.PI;
    };

    const centerX = structureType === "topological-sort" ? Math.min(width / 2, 350) : width / 2;

    const simulation = forceSimulation<GSimNode>(simNodes)
      .force(
        "link",
        forceLink<GSimNode, GSimLink>(simLinks)
          .id((d: GSimNode) => d.id)
          .distance(100)
          .strength(0.5),
      )
      .force("charge", forceManyBody().strength(-250))
      .force("center", forceCenter(centerX, height / 2))
      .force("collide", forceCollide<GSimNode>((d) => d.radius + 8))
      .force("boundary", boundaryForce(20));

    simulationRef.current = simulation;
    prevLinkKeyRef.current = simLinks.map((l) => `${l.sourceId}->${l.targetId}`).sort().join(",");

    // 建立 SVG DOM（links → nodes → vals → desc）
    const linkG = mainGroup.append("g").attr("class", "gc-links");
    linkG
      .selectAll<SVGPathElement, GSimLink>("path")
      .data(simLinks, (d) => `${d.sourceId}->${d.targetId}`)
      .join("path")
      .attr("class", "gc-link")
      .attr("stroke", "#888")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("marker-end", isDirected ? "url(#gc-arrowhead-default)" : "none")
      .attr("data-anim", (d) => {
        if (d.sourceId !== d.targetId) return null;
        if (seenSelfLoopsRef.current.has(d.sourceId)) return null;
        seenSelfLoopsRef.current.add(d.sourceId);
        return "entering";
      });

    const weightG = mainGroup.append("g").attr("class", "gc-weights");
    const weightGroups = weightG
      .selectAll<SVGGElement, GSimLink>("g.gc-weight-group")
      .data(simLinks, (d) => `${d.sourceId}->${d.targetId}`)
      .join("g")
      .attr("class", "gc-weight-group")
      .style("pointer-events", "none")
      .style("user-select", "none");
    weightGroups.append("rect").attr("class", "gc-weight-bg")
      .attr("fill", "#222").attr("rx", 3).style("opacity", 0);
    weightGroups.append("text").attr("class", "gc-weight-text")
      .attr("font-size", 12).attr("font-weight", "bold")
      .attr("font-family", "inherit")
      .attr("text-anchor", "middle").attr("dominant-baseline", "central")
      .attr("fill", "#fff")
      .text((d) => (d.weight != null ? String(d.weight) : ""));

    const nodeG = mainGroup.append("g").attr("class", "gc-nodes");
    const nodeSel = nodeG
      .selectAll<SVGCircleElement, GSimNode>("circle")
      .data(simNodes, (d) => d.id)
      .join("circle")
      .attr("class", "gc-node")
      .attr("r", (d) => d.radius)
      .attr("pointer-events", "all") // fill:none 不接收事件，強制整個圓面積可點擊
      .style("cursor", "grab");

    const valG = mainGroup.append("g").attr("class", "gc-vals");
    const valSel = valG
      .selectAll<SVGTextElement, GSimNode>("text")
      .data(simNodes, (d) => d.id)
      .join("text")
      .attr("class", "gc-val")
      .attr("font-size", 18)
      .attr("font-family", "inherit")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("pointer-events", "none")
      .style("user-select", "none");

    const descG = mainGroup.append("g").attr("class", "gc-desc");
    const descSel = descG
      .selectAll<SVGTextElement, GSimNode>("text")
      .data(simNodes, (d) => d.id)
      .join("text")
      .attr("class", "gc-desc")
      .attr("font-size", 12)
      .attr("font-family", "inherit")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Box 群組（固定座標，不參與 force simulation，位於最上層）
    mainGroup.append("g").attr("class", "gc-boxes");

    // Container 裝飾線（對應 D3Renderer 的 drawContainer）
    if (structureType === "topological-sort") {
      const containerG = mainGroup.append("g").attr("class", "gc-container");
      const lineAttrs = { stroke: "#555", "stroke-width": 2 };
      const startX = 750, endX = 950, topY = 50, bottomY = 380;
      (
        [
          [startX, topY, startX, bottomY],
          [endX,   topY, endX,   bottomY],
        ] as [number, number, number, number][]
      ).forEach(([x1, y1, x2, y2]) => {
        containerG
          .append("line")
          .attr("class", "container-line")
          .attr("x1", x1).attr("y1", y1)
          .attr("x2", x2).attr("y2", y2)
          .attr("stroke", lineAttrs.stroke)
          .attr("stroke-width", lineAttrs["stroke-width"]);
      });
      containerG
        .append("text")
        .attr("x", startX)
        .attr("y", bottomY + 20)
        .text("Call Stack/Queue")
        .attr("fill", "#888")
        .attr("font-size", 12);
    }

    // 重置 viewBox 擴張記錄
    maxExtentRef.current = { maxX: width, maxY: height };
    setSvgViewBox(`0 0 ${width} ${height}`);

    // Drag
    const dragBehavior = d3Drag<SVGCircleElement, GSimNode>()
      .on("start", (event) => {
        event.sourceEvent.stopPropagation(); // 阻止 mousedown 冒泡到 SVG zoom handler
        if (!event.active) simulation.alphaTarget(0.3).restart();
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
    nodeSel.call(dragBehavior);

    // 快速查詢反向邊（跟 D3Renderer 的 linkSet 保持一致）
    linkSetRef.current = new Set(simLinks.map((l) => `${l.sourceId}->${l.targetId}`));

    // 雙向邊各自向左手法向量偏移，避免重疊
    const BIDIR_OFFSET = 6;

    // Tick：更新座標 + 寫入快取（動態選取以支援 Effect 2 新增的 link）
    simulation.on("tick", () => {
      const svgEl = svgRef.current;
      if (!svgEl) return;

      const getNodeCenter = (d: GSimLink, end: "source" | "target") => {
        const node = end === "source" ? d.source : d.target;
        if (typeof node === "object" && node)
          return { x: node.x ?? 0, y: node.y ?? 0, r: (node as GSimNode).radius ?? 20 };
        const id = end === "source" ? d.sourceId : d.targetId;
        const n = simNodes.find((x) => x.id === id);
        return { x: n?.x ?? 0, y: n?.y ?? 0, r: n?.radius ?? 20 };
      };

      d3Select(svgEl)
        .select(".main-group .gc-links")
        .selectAll<SVGPathElement, GSimLink>("path.gc-link")
        .each(function (d) {
          const src = getNodeCenter(d, "source");
          const tgt = getNodeCenter(d, "target");
          let pathD: string;
          if (d.sourceId === d.targetId) {
            pathD = selfLoopPath(src.x, src.y, src.r, getSelfLoopAngle(d.sourceId));
            d3Select(this).attr("d", pathD); // 每 tick 都更新位置，確保節點移動時弧形跟著走
            if (d3Select(this).attr("data-anim") === "entering") {
              d3Select(this).attr("data-anim", "animating");
              const len = (this as SVGPathElement).getTotalLength();
              d3Select(this)
                .attr("stroke-dasharray", len)
                .attr("stroke-dashoffset", len)
                .transition()
                .duration(700)
                .ease(easeQuadOut)
                .attr("stroke-dashoffset", 0)
                .on("end", function () {
                  d3Select(this as SVGPathElement)
                    .attr("data-anim", null)
                    .attr("stroke-dasharray", null)
                    .attr("stroke-dashoffset", null);
                });
            }
            return;
          } else {
            const off = linkSetRef.current.has(`${d.targetId}->${d.sourceId}`) ? BIDIR_OFFSET : 0;
            pathD = straightLinkPath(src, tgt, off);
          }
          d3Select(this).attr("d", pathD);
        });

      d3Select(svgEl)
        .select(".main-group .gc-weights")
        .selectAll<SVGGElement, GSimLink>("g.gc-weight-group")
        .each(function (d) {
          if (d.weight == null) return;
          const src = getNodeCenter(d, "source");
          const tgt = getNodeCenter(d, "target");
          let cx: number, cy: number;
          if (d.sourceId === d.targetId) {
            const loopAngle = getSelfLoopAngle(d.sourceId);
            cx = src.x + (src.r + src.r) * Math.cos(loopAngle);
            cy = src.y + (src.r + src.r) * Math.sin(loopAngle);
          } else {
            const p1 = circleBoundaryPoint(src, tgt);
            const p2 = circleBoundaryPoint(tgt, src);
            const labelOff = linkSetRef.current.has(`${d.targetId}->${d.sourceId}`) ? BIDIR_OFFSET + 12 : 0;
            const center = weightLabelCenter(p1, p2, labelOff);
            cx = center.x;
            cy = center.y;
          }
          d3Select(this).attr("transform", `translate(${cx},${cy})`);
          const textEl = d3Select(this).select<SVGTextElement>("text.gc-weight-text");
          textEl.attr("x", 0).attr("y", 0);
          try {
            const bbox = (textEl.node() as SVGTextElement).getBBox();
            const px = 4, py = 2;
            d3Select(this).select("rect.gc-weight-bg")
              .attr("x", -bbox.width / 2 - px / 2)
              .attr("y", -bbox.height / 2 - py / 2)
              .attr("width", bbox.width + px)
              .attr("height", bbox.height + py)
              .style("opacity", 0.8);
          } catch (_) { /* getBBox fails if element not in DOM */ }
        });

      nodeSel.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
      valSel.attr("x", (d) => d.x ?? 0).attr("y", (d) => d.y ?? 0);
      descSel
        .attr("x", (d) => d.x ?? 0)
        .attr("y", (d) => (d.y ?? 0) + d.radius + 14);

      simNodes.forEach((n) => {
        if (n.x != null && n.y != null) {
          posCacheRef.current.set(n.id, { x: n.x, y: n.y });
        }
      });
    });

    return () => {
      simulation.stop();
    };
  }, [nodeIds, width, height, isDirected, structureType]); // links 不放入，addEdge 不重建

  // Effect 1b：從 allStepsElements 預計算 Box 的最大 viewBox（與 D3Canvas 的 computeUnionBBox 對應）
  // 必須在 Effect 1 之後定義，確保 Effect 1 重置 maxExtentRef 後再擴張
  useEffect(() => {
    if (!allStepsElements || allStepsElements.length === 0) return;
    const PAD = 30;
    let { maxX, maxY } = maxExtentRef.current;
    let changed = false;
    allStepsElements.forEach((stepEls) => {
      stepEls.forEach((el) => {
        if (!(el instanceof Box)) return;
        const b = el as Box;
        const ex = b.position.x + b.width / 2 + PAD;
        const ey = b.position.y + b.height / 2 + PAD;
        if (ex > maxX) { maxX = ex; changed = true; }
        if (ey > maxY) { maxY = ey; changed = true; }
      });
    });
    if (changed) {
      maxExtentRef.current = { maxX, maxY };
      setSvgViewBox(`0 0 ${maxX} ${maxY}`);
    }
  }, [allStepsElements]);

  // Effect 2：更新 links（addEdge 時邊即時出現）
  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation || !svgRef.current) return;

    const linkForce = simulation.force("link") as ReturnType<typeof forceLink<GSimNode, GSimLink>>;
    if (!linkForce) return;

    const simLinks: GSimLink[] = deduplicateLinks(links, isDirected);

    // 只在邊結構真的改變時才重啟 simulation
    const newLinkKey = simLinks.map((l) => `${l.sourceId}->${l.targetId}`).sort().join(",");
    if (prevLinkKeyRef.current !== newLinkKey) {
      linkForce.links(simLinks);
      simulation.alpha(0.3).restart();
      prevLinkKeyRef.current = newLinkKey;
      linkSetRef.current = new Set(simLinks.map((l) => `${l.sourceId}->${l.targetId}`));
    }

    // Link DOM join：新增的邊需要對應的 line 元素（不影響 simulation）
    d3Select(svgRef.current)
      .select(".main-group .gc-links")
      .selectAll<SVGPathElement, GSimLink>("path")
      .data(simLinks, (d) => `${d.sourceId}->${d.targetId}`)
      .join(
        (enter) => enter.append("path")
          .attr("class", "gc-link")
          .attr("stroke", "#888")
          .attr("stroke-width", 2)
          .attr("fill", "none")
          .attr("marker-end", isDirected ? "url(#gc-arrowhead-default)" : "none")
          .attr("data-anim", (d) => {
            if (d.sourceId !== d.targetId) return null;
            if (seenSelfLoopsRef.current.has(d.sourceId)) return null;
            seenSelfLoopsRef.current.add(d.sourceId);
            return "entering";
          }),
        (update) => update,
        (exit) => exit.remove(),
      );

    // Weight DOM join：新增的邊需要對應的 weight group（rect + text）
    d3Select(svgRef.current)
      .select(".main-group .gc-weights")
      .selectAll<SVGGElement, GSimLink>("g.gc-weight-group")
      .data(simLinks, (d) => `${d.sourceId}->${d.targetId}`)
      .join(
        (enter) => {
          const g = enter.append("g")
            .attr("class", "gc-weight-group")
            .style("pointer-events", "none")
            .style("user-select", "none");
          g.append("rect").attr("class", "gc-weight-bg")
            .attr("fill", "#222").attr("rx", 3).style("opacity", 0);
          g.append("text").attr("class", "gc-weight-text")
            .attr("font-size", 12).attr("font-weight", "bold")
            .attr("font-family", "inherit")
            .attr("text-anchor", "middle").attr("dominant-baseline", "central")
            .attr("fill", "#fff");
          return g;
        },
        (update) => update,
        (exit) => exit.remove(),
      )
      .select("text.gc-weight-text")
      .text((d) => (d.weight != null ? String(d.weight) : ""));
  }, [links, isDirected]);

  // Effect 3：只更新樣式（每個 step 觸發）
  useEffect(() => {
    if (!svgRef.current) return;

    const transitionDuration = 500;
    const transitionEase = easeQuadOut;

    // --- Box 渲染（固定座標，不屬於 force simulation）---
    // 與 D3Renderer：transition("move") 位移、transition("fade") 透明度、appearAnim grow、borderStyle dashed
    const boxElements = elements.filter((e): e is Box => e instanceof Box);

    const boxMerged = d3Select(svgRef.current)
      .select(".main-group .gc-boxes")
      .selectAll<SVGGElement, Box>("g.gc-box")
      .data(boxElements, (d) => String(d.id))
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("class", "gc-box")
            .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`)
            .style("opacity", (d) => d.opacity ?? 1);
          g.each(function (d) {
            const gg = d3Select(this);
            const rect = gg.append("rect").attr("class", "gc-box-rect").attr("rx", 8);
            if (d.appearAnim === "instant") {
              const color = d.getColor();
              rect
                .attr("x", -d.width / 2)
                .attr("y", -d.height / 2)
                .attr("width", d.width)
                .attr("height", d.height)
                .attr("fill", color)
                .attr("fill-opacity", 0.2)
                .attr("stroke", color)
                .attr("stroke-width", 2);
              if (d.borderStyle === "dashed") {
                rect.attr("stroke-dasharray", "5,5");
              }
            }
            gg.append("text")
              .attr("class", "gc-box-val")
              .attr("text-anchor", "middle")
              .attr("font-size", 14)
              .attr("font-family", "inherit")
              .style("pointer-events", "none")
              .style("user-select", "none");
            gg.append("text")
              .attr("class", "gc-box-desc")
              .attr("text-anchor", "middle")
              .attr("font-size", 12)
              .attr("font-family", "inherit")
              .style("pointer-events", "none")
              .style("user-select", "none");
          });
          return g;
        },
        (update) => update,
        (exit) => exit.remove(),
      );

    boxMerged
      .transition("move")
      .duration(transitionDuration)
      .ease(transitionEase)
      .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`);

    boxMerged.each(function (d) {
      const g = d3Select(this);
      const targetOpacity = d.opacity ?? 1;
      const currentOpacity = parseFloat(g.style("opacity") || "1");
      if (targetOpacity < currentOpacity) {
        g.interrupt("fade").style("opacity", 0);
      } else if (targetOpacity > currentOpacity) {
        g.transition("fade")
          .duration(transitionDuration)
          .ease(transitionEase)
          .style("opacity", targetOpacity);
      }
    });

    boxMerged.each(function (d) {
      const g = d3Select(this);
      const color = d.getColor();
      const rect = g.select<SVGRectElement>("rect.gc-box-rect");
      rect
        .transition()
        .duration(transitionDuration)
        .ease(transitionEase)
        .attr("x", -d.width / 2)
        .attr("y", -d.height / 2)
        .attr("width", d.width)
        .attr("height", d.height)
        .attr("rx", 8)
        .attr("fill", color)
        .attr("fill-opacity", 0.2)
        .attr("stroke", color)
        .attr("stroke-width", 2);
      if (d.borderStyle === "dashed") {
        rect.attr("stroke-dasharray", "5,5");
      } else {
        rect.attr("stroke-dasharray", null);
      }
      g.select("text.gc-box-val")
        .text(d.value ?? "")
        .attr("y", 5)
        .attr("fill", "#ccc");
      g.select("text.gc-box-desc")
        .attr("y", d.height / 2 + 14)
        .text(d.description ?? "")
        .attr("fill", "#aaa");
    });

    // 若 Box 座標超出目前 viewBox 範圍，向外擴張（只擴不縮）
    if (boxElements.length > 0) {
      const PAD = 30;
      let { maxX, maxY } = maxExtentRef.current;
      let changed = false;
      boxElements.forEach((b) => {
        const ex = b.position.x + b.width / 2 + PAD;
        const ey = b.position.y + b.height / 2 + PAD;
        if (ex > maxX) { maxX = ex; changed = true; }
        if (ey > maxY) { maxY = ey; changed = true; }
      });
      if (changed) {
        maxExtentRef.current = { maxX, maxY };
        setSvgViewBox(`0 0 ${maxX} ${maxY}`);
      }
    }

    const nodeMap = new Map(nodeElements.map((e) => [e.id, e]));

    d3Select(svgRef.current)
      .selectAll<SVGCircleElement, GSimNode>(".gc-node")
      .each(function (d) {
        if (!d) return;
        const node = nodeMap.get(d.id);
        if (!node) return;
        const color = node.getColor();
        const opacity = node.opacity ?? 1;
        d3Select(this)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("opacity", opacity);
      });

    // 更新 .gc-val（圓內 value，參考 D3Renderer L778）
    d3Select(svgRef.current)
      .selectAll<SVGTextElement, GSimNode>(".gc-val")
      .each(function (d) {
        if (!d) return;
        const node = nodeMap.get(d.id);
        if (!node) return;
        d3Select(this).text(node.value ?? "").attr("fill", "#ccc");
      });

    // 更新 .gc-desc（圓下方 description，參考 D3Renderer L771）
    d3Select(svgRef.current)
      .selectAll<SVGTextElement, GSimNode>(".gc-desc")
      .each(function (d) {
        if (!d) return;
        const node = nodeMap.get(d.id);
        if (!node) return;
        d3Select(this).text(node.description ?? "").attr("fill", "#ccc");
      });

    // 更新 link 樣式（stroke + marker-end 顏色同步）
    d3Select(svgRef.current)
      .selectAll<SVGPathElement, GSimLink>(".gc-link")
      .each(function (d) {
        if (!d) return;
        const status = d.status || "default";
        const markerStatus = status in linkStatusColorMap ? status : "default";
        const color =
          linkStatusColorMap[status as keyof typeof linkStatusColorMap] ??
          linkStatusColorMap.default;
        d3Select(this)
          .attr("stroke", color)
          .attr(
            "marker-end",
            isDirected ? `url(#gc-arrowhead-${markerStatus})` : "none",
          );
      });

    // 更新 weight 文字顏色（target 狀態→橙色，其他→白色，與 D3Renderer 一致）
    d3Select(svgRef.current)
      .select(".main-group .gc-weights")
      .selectAll<SVGGElement, GSimLink>("g.gc-weight-group")
      .each(function (d) {
        if (!d || d.weight == null) return;
        const status = d.status || "default";
        d3Select(this).select("text.gc-weight-text")
          .attr("fill", status === "target" ? "#ffb74d" : "#fff");
      });
  }, [elements, nodeElements, isDirected]);

  return (
    <div className={styles.canvasContainer}>
      <svg
        ref={svgRef}
        viewBox={svgViewBox}
        className={styles.canvas}
        preserveAspectRatio="xMidYMid meet"
      />
      <div className={styles.statusLegendContainer}>
        <StatusLegend statusConfig={statusConfig} />
      </div>
      {(enableZoom || enablePan) && (
        <div className={styles.resetButtonContainer}>
          <Button
            variant="icon"
            size="sm"
            onClick={handleResetZoom}
            aria-label="重置視圖"
            className={styles.resetButton}
            icon="rotate-right"
            iconOnly
          />
        </div>
      )}
    </div>
  );
}
