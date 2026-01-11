import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { Node } from "../DataLogic/Node";
import { Box } from "../DataLogic/Box";
import { LinkManager } from "../DataLogic/LinkManager";
import "./D3Renderer.module.scss";

export interface Link {
  key: string;
  sourceId: string;
  targetId: string;
}

// 取得從 fromNode 指向 toNode 時，位於 fromNode 圓邊界上的點
function getCircleBoundaryPoint(fromNode: Node, toNode: Node) {
  const cx = fromNode.position.x;
  const cy = fromNode.position.y;
  const tx = toNode.position.x;
  const ty = toNode.position.y;

  let dx = tx - cx;
  let dy = ty - cy;
  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const r = fromNode.radius ?? 0;
  return { x: cx + ux * r, y: cy + uy * r };
}

/**
 * 從 node1 的邊緣開始，動畫伸長到 node2 的邊緣
 * @param svgEl SVG 元素
 * @param elements 所有元素
 * @param manager LinkManager 實例
 * @param sourceId 來源節點 ID
 * @param targetId 目標節點 ID
 * @param duration 動畫持續時間（毫秒），預設 800ms
 * @returns Promise，動畫完成後 resolve
 */
export function animateConnect(
  svgEl: SVGSVGElement,
  elements: BaseElement[],
  manager: LinkManager,
  sourceId: string,
  targetId: string,
  duration: number = 800
): Promise<void> {
  return new Promise((resolve) => {
    const svg = d3.select(svgEl);
    const scene = svg.select<SVGGElement>("g.scene");

    // 建立連線
    manager.connect(sourceId, targetId);

    // 查找節點
    const byId = new Map(elements.map((e) => [String(e.id), e]));
    const sourceNode = byId.get(sourceId);
    const targetNode = byId.get(targetId);

    if (!(sourceNode instanceof Node) || !(targetNode instanceof Node)) {
      resolve();
      return;
    }

    // 計算起點與終點（圓邊界）
    const p1 = getCircleBoundaryPoint(sourceNode, targetNode);
    const p2 = getCircleBoundaryPoint(targetNode, sourceNode);

    // 建立臨時動畫線段
    const animLine = scene
      .append("line")
      .attr("class", "link-anim")
      .attr("x1", p1.x)
      .attr("y1", p1.y)
      .attr("x2", p1.x) // 起點與終點相同，線段長度為 0
      .attr("y2", p1.y);

    // 從 0 伸長到 1 的動畫
    animLine
      .transition()
      .duration(duration)
      .ease(d3.easeQuadOut)
      .attr("x2", p2.x)
      .attr("y2", p2.y)
      .on("end", () => {
        // 動畫完成後移除臨時線段
        animLine.remove();
        resolve();
      });
  });
}

export function renderAll(
  svgEl: SVGSVGElement,
  elements: BaseElement[],
  links: Link[] = []
) {
  const svg = d3.select(svgEl);

  // defs：箭頭標記（只建一次）
  const defs = svg.selectAll("defs").data([null]);
  const defsEnter = defs.enter().append("defs");
  defsEnter
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10) // 箭頭參考點，讓箭頭頂到線終點
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#888");

  // 根 <g>
  const root = svg.selectAll<SVGGElement, null>("g.scene").data([null]);
  root.enter().append("g").attr("class", "scene");
  const scene = svg.select<SVGGElement>("g.scene");

  // === 先畫 LINKS（在底層）===
  // 依 id 找 element
  const byId = new Map(elements.map((e) => [String(e.id), e]));
  // 僅保留 Node -> Node 的連線
  const linkData = links
    .map((lk) => {
      const s = byId.get(String(lk.sourceId));
      const t = byId.get(String(lk.targetId));
      if (s instanceof Node && t instanceof Node) {
        return { s, t };
      }
      return null;
    })
    .filter(Boolean) as { s: Node; t: Node }[];

  const linkSel = scene
    .selectAll<SVGLineElement, { s: Node; t: Node }>("line.link")
    .data(linkData, (d: any) => `${d.s.id}->${d.t.id}`);

  linkSel.exit().remove();

  const linkEnter = linkSel
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#888")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)");

  const linkMerged = linkEnter.merge(linkSel as any);

  // 初始位置（圓邊到圓邊）
  linkMerged
    .transition()
    .duration(500)
    .attr("x1", (d) => getCircleBoundaryPoint(d.s, d.t).x)
    .attr("y1", (d) => getCircleBoundaryPoint(d.s, d.t).y)
    .attr("x2", (d) => getCircleBoundaryPoint(d.t, d.s).x)
    .attr("y2", (d) => getCircleBoundaryPoint(d.t, d.s).y);

  // === 再畫 NODES / BOXES（在上層）===
  const items = scene
    .selectAll<SVGGElement, BaseElement>("g.el")
    .data(elements, (d: any) => String(d.id));

  items.exit().remove();

  const enter = items.enter().append("g").attr("class", "el");

  // 依型別建立一次對應圖形元素
  enter.each(function (d: any) {
    const g = d3.select(this);
    if (d instanceof Node) {
      g.append("circle");
    } else if (d instanceof Box) {
      g.append("rect");
    }
    g.append("text").attr("class", "desc"); // 顯示 description
    g.append("text").attr("class", "val"); // 顯示 value
  });

  const merged = enter.merge(items as any);

  // 統一位置
  merged.attr(
    "transform",
    (d) => `translate(${d.position.x}, ${d.position.y})`
  );

  // 個別型別屬性 + 描述文字
  merged.each(function (d) {
    const g = d3.select(this);

    if (d instanceof Node) {
      g.select<SVGCircleElement>("circle")
        .attr("r", d.radius)
        .attr("fill", "none")
        .attr("stroke", d.getColor())
        .attr("stroke-width", 2);

      // 文字置中，放在圓下方（半徑 + 14px）
      g.select<SVGTextElement>("text.desc")
        .attr("text-anchor", "middle")
        .attr("y", d.radius + 14)
        .attr("font-size", 12)
        .attr("fill", "#ccc")
        .text(d.description || "");
      // 文字置中，放在圓中間
      g.select<SVGTextElement>("text.val")
        .attr("text-anchor", "middle")
        .attr("y", d.radius / 2 - 9)
        .attr("font-size", 18)
        .attr("fill", "#ccc")
        .text(d.value || "");
    } else if (d instanceof Box) {
      g.select<SVGRectElement>("rect")
        .attr("x", -d.width / 2)
        .attr("y", -d.height / 2)
        .attr("width", d.width)
        .attr("height", d.height)
        .attr("rx", 8)
        .attr("fill", "none")
        .attr("stroke", d.getColor())
        .attr("stroke-width", 2);

      // 文字置中，放在 Box 底下（高度一半 + 14px）
      g.select<SVGTextElement>("text.desc")
        .attr("text-anchor", "middle")
        .attr("y", d.height / 2 + 14)
        .attr("font-size", 12)
        .attr("fill", "#ccc")
        .text(d.description || "");

      // 文字置中，放在 Box 中間（高度一半）
      g.select<SVGTextElement>("text.val")
        .attr("text-anchor", "middle")
        .attr("y", d.height / 2 - 22)
        .attr("font-size", 18)
        .attr("fill", "#ccc")
        .text(d.value || "");
    }
  });
}
