import { select as d3Select, interpolateRgb } from "d3";
import type { Selection, BaseType } from "d3";
import { circleBoundaryPoint } from "./linkGeometry";

/**
 * 共用的「邊線顏色掃描」動畫核心，抽取自 GraphCanvas / D3Canvas 原本各自實作、
 * 幾乎逐行重複的 animateLink（gradient + 箭頭 marker 的 RAF tick loop）。
 * 兩個畫布的節點座標來源與 SVG 選取方式不同，因此透過 getBoundaryPoints /
 * selectLinkPath 等 callback 注入差異，其餘漸層插值與收尾邏輯完全共用。
 */

export const LINK_ANIM_BLEND = 0.12;

interface LinkAnimEndpoint {
  x: number;
  y: number;
  r: number;
}

export function linkAnimBoundaryPoints(
  src: LinkAnimEndpoint,
  tgt: LinkAnimEndpoint,
) {
  return {
    p1: circleBoundaryPoint(src, tgt),
    p2: circleBoundaryPoint(tgt, src),
  };
}

export function makeLinkAnimIds(
  prefix: string,
  sourceId: string,
  targetId: string,
) {
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, "_");
  return {
    gradId: sanitize(`${prefix}-anim-${sourceId}-${targetId}`),
    arrowMarkerId: sanitize(`${prefix}-anim-arrow-${sourceId}-${targetId}`),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- datum shape differs between callers (GSimLink vs. raw {s,t}); only .attr()/.filter() are used here, so it's left untyped.
type LinkPathSelection = Selection<SVGPathElement, any, BaseType, unknown>;

export interface RunLinkColorAnimationParams {
  /** animStateRef 的主要 key（呼叫端指定的方向，例如 `${sourceId}->${targetId}`）*/
  key: string;
  /** 實際 SVG 元素所在的方向 key，僅在與 key 不同時才需要（例如無向圖找到反向邊）*/
  elemKey?: string;
  gradId: string;
  arrowMarkerId: string;
  fromColor: string;
  toColor: string;
  duration: number;
  /**
   * 進度縮放（0~1）。<1 會讓漸層在動畫前段就跑完，是 D3Canvas 既有行為，
   * GraphCanvas 原本沒有這個縮放（等同 1）。此處保留兩邊原始差異，未來
   * 若要統一觀感需另外確認是否為刻意設計。
   */
  progressScale?: number;
  blend?: number;
  getSvgEl: () => SVGSVGElement | null;
  getAnimDefs: () => SVGDefsElement | null;
  getBoundaryPoints: () => {
    p1: { x: number; y: number };
    p2: { x: number; y: number };
  } | null;
  selectLinkPath: (svgEl: SVGSVGElement) => LinkPathSelection;
  /** 動畫過程中是否繪製方向箭頭（isDirected && 未被畫布規則隱藏）*/
  showDirectedArrow: boolean;
  /** 動畫完成後箭頭 marker-end 要恢復的值，例如 "url(#gc-arrowhead)" */
  defaultArrowMarkerUrl: string;
  /** 即使 showDirectedArrow 為 false，完成時仍要把 marker-end 強制設為 "none"（對應 D3Canvas 的隱藏箭頭規則）*/
  forceHideArrowOnComplete?: boolean;
  animStateRef: { current: Map<string, number> };
  onComplete?: () => void;
}

export function runLinkColorAnimation(params: RunLinkColorAnimationParams): void {
  const {
    key,
    elemKey = key,
    gradId,
    arrowMarkerId,
    fromColor,
    toColor,
    duration,
    progressScale = 1,
    blend = LINK_ANIM_BLEND,
    getSvgEl,
    getAnimDefs,
    getBoundaryPoints,
    selectLinkPath,
    showDirectedArrow,
    defaultArrowMarkerUrl,
    forceHideArrowOnComplete = false,
    animStateRef,
    onComplete,
  } = params;

  const existing = animStateRef.current.get(key);
  if (existing !== undefined) {
    cancelAnimationFrame(existing);
    const defs = getAnimDefs();
    if (defs) {
      const ad = d3Select(defs);
      ad.select(`#${gradId}`).remove();
      ad.select(`#${arrowMarkerId}`).remove();
    }
  }

  const setAnimState = (id: number) => {
    animStateRef.current.set(key, id);
    if (elemKey !== key) animStateRef.current.set(elemKey, id);
  };
  const deleteAnimState = () => {
    animStateRef.current.delete(key);
    if (elemKey !== key) animStateRef.current.delete(elemKey);
  };

  const startTime = performance.now();
  const tick = () => {
    const svgEl = getSvgEl();
    const defs = getAnimDefs();
    if (!svgEl || !defs) return;

    const s = Math.min((performance.now() - startTime) / duration, 1);
    const linkT = Math.min(s / progressScale, 1);
    const frontPct = `${linkT * 100}%`;
    const blendEndPct = `${Math.min(linkT + blend, 1) * 100}%`;

    const points = getBoundaryPoints();
    if (!points) return;
    const { p1, p2 } = points;

    const d3Defs = d3Select(defs);

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

    selectLinkPath(svgEl).attr("stroke", `url(#${gradId})`);

    if (showDirectedArrow) {
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
        selectLinkPath(svgEl).attr("marker-end", `url(#${arrowMarkerId})`);
      }
      const arrowT = Math.max(0, (linkT - (1 - blend)) / blend);
      d3Defs
        .select(`#${arrowMarkerId} path`)
        .attr("fill", interpolateRgb(fromColor, toColor)(Math.min(arrowT, 1)));
    }

    if (s < 1) {
      setAnimState(requestAnimationFrame(tick));
    } else {
      selectLinkPath(svgEl).attr("stroke", toColor);
      d3Defs.select(`#${gradId}`).remove();

      if (showDirectedArrow) {
        d3Defs.select(`#${arrowMarkerId}`).remove();
        selectLinkPath(svgEl).attr("marker-end", defaultArrowMarkerUrl);
      } else if (forceHideArrowOnComplete) {
        d3Defs.select(`#${arrowMarkerId}`).remove();
        selectLinkPath(svgEl).attr("marker-end", "none");
      }

      deleteAnimState();
      onComplete?.();
    }
  };

  setAnimState(requestAnimationFrame(tick));
}
