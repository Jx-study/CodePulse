import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { Node } from "../DataLogic/Node";
import { Box } from "../DataLogic/Box";

interface Link {
  key: string;
  sourceId: string;
  targetId: string;
}


export function renderAll(
  svgEl: SVGSVGElement,
  elements: BaseElement[],
  links: Link[] = []
) {
  const svg = d3.select(svgEl);

  // defs：箭頭標記（只建一次）
  const defs = svg.selectAll("defs#arrowDefs").data([null]);
  const defsEnter = defs.enter().append("defs").attr("id", "arrowDefs");
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
  const linkData = links
    .map((lk) => {
      const s = byId.get(String(lk.sourceId));
      const t = byId.get(String(lk.targetId));
      return s && t ? { s, t } : null;
    })
    .filter(Boolean) as { s: BaseElement; t: BaseElement }[];

  const linkSel = scene
    .selectAll<SVGLineElement, { s: BaseElement; t: BaseElement }>("line.link")
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

  // 初始位置
  linkMerged
    .attr("x1", (d) => d.s.position.x)
    .attr("y1", (d) => d.s.position.y)
    .attr("x2", (d) => d.t.position.x)
    .attr("y2", (d) => d.t.position.y);

  // 箭頭「伸縮」動畫：用 d3.timer 週期性調整 x2,y2 在 source->target 方向的比例
  // k(t) 在 [0.5, 1.0] 間往返
  let t0 = performance.now();
  d3.timer((now) => {
    const dt = (now - t0) / 1000; // 秒
    const oscillate = (Math.sin(dt * 2 * Math.PI * 0.5) + 1) / 2; // 0..1 (0.5Hz)
    const k = 0.5 + 0.5 * oscillate; // 0.5..1.0

    linkMerged.each(function (d) {
      const x1 = d.s.position.x;
      const y1 = d.s.position.y;
      const xT = d.t.position.x;
      const yT = d.t.position.y;
      const x2 = x1 + (xT - x1) * k;
      const y2 = y1 + (yT - y1) * k;
      d3.select(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });
    // 回傳 false 讓 timer 持續跑（交給 React 卸載時自行處理銷毀）
    return false;
  });

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
    g.append("text").attr("class", "desc"); // ← 這個會顯示 description
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

      // 文字置中，放在盒子底下（高度一半 + 14px）
      g.select<SVGTextElement>("text.desc")
        .attr("text-anchor", "middle")
        .attr("y", d.height / 2 + 14)
        .attr("font-size", 12)
        .attr("fill", "#ccc")
        .text(d.description || "");
    }
  });


  // 連線畫法（擷取關鍵）
  // const link = scene.selectAll("line.link").data(links, (d: Link) => d.key);
  const link = scene
  .selectAll<SVGLineElement, Link>("line.link")
  .data(links, (d: Link) => d.key);
  
  link.enter().append("line")
    .attr("class", "link")
    .attr("marker-end", "url(#arrowhead)")
    .attr("stroke", "#888")
    .attr("stroke-width", 2);

  const merged2 = link.merge(linkEnter as any);

  let t1 = performance.now();
  d3.timer(now => {
    const k = 0.5 + 0.5 * (Math.sin((now - t1) / 1000 * Math.PI) ); // 0..1
    merged2.each(function(d: Link) {
      const s = byId.get(d.sourceId)!; const t = byId.get(d.targetId)!;
      const x1 = s.position.x, y1 = s.position.y;
      const xt = t.position.x, yt = t.position.y;
      const x2 = x1 + (xt - x1) * k;
      const y2 = y1 + (yt - y1) * k;
      d3.select(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });
    return false; // 持續跑
  });
}
