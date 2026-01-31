import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { Node } from "../DataLogic/Node";
import { Box } from "../DataLogic/Box";
import { LinkManager } from "../DataLogic/LinkManager";
import { Pointer } from "../DataLogic/Pointer";
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

function drawContainer(
  scene: d3.Selection<SVGGElement, unknown, null, undefined>,
  type: string
) {
  // 清除舊的容器線條 (避免重繪疊加)
  scene.selectAll(".container-line").remove();

  const lineColor = "#555";
  const lineWidth = 4;

  const topY = 150;
  const bottomY = 250;
  const startX = 55;
  const endX = 900; // 畫長一點涵蓋整個視窗

  if (type === "stack") {
    // Stack: 畫「左」、「上」、「下」 (開口向右)
    // 上線
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", startX)
      .attr("y1", topY)
      .attr("x2", endX)
      .attr("y2", topY)
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    // 下線
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", startX)
      .attr("y1", bottomY)
      .attr("x2", endX)
      .attr("y2", bottomY)
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    // 左底線 (封閉左邊)
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", startX)
      .attr("y1", topY - lineWidth / 2) // 微調接合處
      .attr("x2", startX)
      .attr("y2", bottomY + lineWidth / 2)
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);
  } else if (type === "queue") {
    // Queue: 畫「上」、「下」 (兩端開口通道)

    // 上線
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", startX)
      .attr("y1", topY) // Queue 可以更長一點
      .attr("x2", endX)
      .attr("y2", topY)
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);

    // 下線
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", startX)
      .attr("y1", bottomY)
      .attr("x2", endX)
      .attr("y2", bottomY)
      .attr("stroke", lineColor)
      .attr("stroke-width", lineWidth);
  }
}

export function renderAll(
  svgEl: SVGSVGElement,
  elements: BaseElement[],
  links: Link[] = [],
  structureType: string = "linkedlist"
) {
  const svg = d3.select(svgEl);
  const transitionDuration = 500; // 統一動畫時間
  const transitionEase = d3.easeQuadOut;

  // Pre-calculation for AutoScale(Grouping Support)
  const scaleYMap = new Map<string, d3.ScaleLinear<number, number>>();

  const autoScaleBoxes = elements.filter(
    (e): e is Box => e instanceof Box && e.autoScale
  );

  const groupData = new Map<string, { values: number[]; maxH: number }>();
  const DEFAULT_MAX_H = 150;

  autoScaleBoxes.forEach((box) => {
    const group = box.scaleGroup || "default";
    if (!groupData.has(group))
      groupData.set(group, { values: [], maxH: DEFAULT_MAX_H });

    const entry = groupData.get(group)!;

    if (box.value !== undefined) {
      entry.values.push(box.value);
    }

    // 這裡的邏輯是：只要該組有任一 Box 指定了高度，就採用該高度 (取最小值)
    if (box.maxHeight) {
      if (entry.maxH) {
        entry.maxH = Math.min(box.maxHeight, entry.maxH);
      }
      entry.maxH = box.maxHeight;
    }
  });

  groupData.forEach(({ values, maxH }, groupName) => {
    let minVal = 0;
    let maxVal = 100;

    if (values.length > 0) {
      minVal = Math.min(...values);
      maxVal = Math.max(...values);

      if (minVal === maxVal) {
        if (minVal === 0) {
          maxVal = 10;
          minVal = -10;
        } else if (minVal > 0) {
          minVal = 0;
          maxVal = maxVal * 1.5;
        } else {
          maxVal = 0;
          minVal = minVal * 1.5;
        }
      } else {
        const range = maxVal - minVal;
        maxVal += range * 0.1;
        if (minVal < 0) minVal -= range * 0.1;
        else minVal = 0;
      }
    }

    const scale = d3
      .scaleLinear()
      .domain([0, Math.max(Math.abs(minVal), Math.abs(maxVal))])
      .range([0, maxH]);

    scaleYMap.set(groupName, scale);
  });

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

  drawContainer(scene, structureType);

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

  // 終點縮向起點
  linkSel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr("x2", (d: any) => getCircleBoundaryPoint(d.s, d.t).x)
    .attr("y2", (d: any) => getCircleBoundaryPoint(d.s, d.t).y)
    .remove();

  const linkEnter = linkSel
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#888")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)")
    // 設定初始位置在來源節點邊界，避免從 (0,0) 開始動畫
    .attr("x1", (d) => getCircleBoundaryPoint(d.s, d.t).x)
    .attr("y1", (d) => getCircleBoundaryPoint(d.s, d.t).y)
    .attr("x2", (d) => getCircleBoundaryPoint(d.s, d.t).x)
    .attr("y2", (d) => getCircleBoundaryPoint(d.s, d.t).y);

  linkEnter
    .merge(linkSel as any)
    .transition()
    .duration(transitionDuration)
    .ease(transitionEase)
    .attr("x1", (d) => getCircleBoundaryPoint(d.s, d.t).x)
    .attr("y1", (d) => getCircleBoundaryPoint(d.s, d.t).y)
    .attr("x2", (d) => getCircleBoundaryPoint(d.t, d.s).x)
    .attr("y2", (d) => getCircleBoundaryPoint(d.t, d.s).y);

  // === 再畫 NODES / BOXES / POINTERS（在上層）===
  const items = scene
    .selectAll<SVGGElement, BaseElement>("g.el")
    .data(elements, (d: any) => String(d.id));

  items.exit().remove();

  const enter = items
    .enter()
    .append("g")
    .attr("class", "el")
    .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`);

  // 依型別建立一次對應圖形元素
  enter.each(function (d: any) {
    const g = d3.select(this);
    if (d.kind === "node" || d instanceof Node) {
      g.append("circle");
    } else if (d.kind === "box" || d instanceof Box) {
      const rect = g.append("rect");
      
      // === 處理 Box 出現動畫策略 ===
      if (d instanceof Box && d.appearAnim === "instant") {
        rect
          .attr("x", -d.width / 2)
          .attr("y", -d.height / 2)
          .attr("width", d.width)
          .attr("height", d.height)
          .attr("rx", 8)
          .attr("fill", d.getColor())
          .attr("fill-opacity", 0.2)
          .attr("stroke", d.getColor())
          .attr("stroke-width", 2);
      }
    } else if (d.kind === "pointer" || d instanceof Pointer) {
      // Pointer: 繪製箭頭與標籤
      // 箭頭 (向上指)
      g.append("path")
        .attr("d", "M0,0 L-5,10 L5,10 Z") // 簡單的三角形箭頭
        .attr("fill", "#ffeb3b"); // 黃色箭頭
      
      // 標籤文字
      g.append("text").attr("class", "ptr-label");
    }

    g.append("text").attr("class", "desc"); // 顯示 description
    g.append("text").attr("class", "val"); // 顯示 value
  });

  // ... (link transitions)

  // === NODES 渲染同步修正 ===
  const merged = enter.merge(items as any);

  merged
    .transition()
    .duration(transitionDuration)
    .ease(transitionEase)
    .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`);

  // 個別型別屬性 + 描述文字
  merged.each(function (d) {
    const g = d3.select(this);

    if (d.kind === "node" || d instanceof Node) {
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
        .attr("y", d.radius / 2 - 5)
        .attr("font-size", 18)
        .attr("fill", "#ccc")
        .text(d.value !== undefined ? d.value : "");
    } else if (d.kind === "box" || d instanceof Box) {
      const box = d as Box;
      const rect = g.select<SVGRectElement>("rect");
      const textVal = g.select<SVGTextElement>("text.val");
      const textDesc = g.select<SVGTextElement>("text.desc");

      // AutoScale Logic
      if (box.autoScale) {
        const group = box.scaleGroup || "default";
        const scaleY = scaleYMap.get(group);

        if (scaleY) {
          const val = box.value || 0;
          const absVal = Math.abs(val);
          const barHeight = scaleY(absVal);
          const barWidth = box.width;

          // 判斷高度是否足夠容納文字
          const MIN_BAR_HEIGHT_FOR_TEXT = 25;
          const isBarTooShort = barHeight < MIN_BAR_HEIGHT_FOR_TEXT;

          let rectY = 0;
          if (val >= 0) {
            rectY = -barHeight; // 往上長
          } else {
            rectY = 0; // 往下長
          }

          rect
            .transition()
            .duration(transitionDuration)
            .attr("x", -barWidth / 2)
            .attr("y", rectY)
            .attr("width", barWidth)
            .attr("height", barHeight)
            .attr("rx", 8) // 圓角
            .attr("fill", box.getColor())
            .attr("fill-opacity", 0.2)
            .attr("stroke", box.getColor())
            .attr("stroke-width", 2);

          // 文字位置調整
          textVal.attr("fill", "#ccc");
          if (val >= 0) {
            // 正數
            if (isBarTooShort) {
              // Bar 太矮 -> 數值顯示在 Bar 上方 (浮在空中)
              textVal.attr("y", -barHeight - 10);
            } else {
              // Bar 足夠高 -> 數值顯示在 Bar 內部頂端
              textVal.attr("y", -barHeight + 20);
            }

            textDesc
              .attr("y", 20) // 0 線下方
              .attr("fill", "rgba(255, 241, 228, 1)");
          } else {
            // 負數
            if (isBarTooShort) {
              // Bar 太矮 -> 數值顯示在 Bar 下方
              textVal.attr("y", barHeight + 20);
            } else {
              // Bar 足夠高 -> 數值顯示在 Bar 內部底端
              textVal.attr("y", barHeight - 10);
            }

            textDesc
              .attr("y", -10) // 0 線上方
              .attr("fill", "rgba(250, 242, 234, 1)");
          }
        }
      } else {
        // === 一般模式 (固定大小) ===
        rect
          .transition()
          .duration(transitionDuration)
          .attr("x", -box.width / 2)
          .attr("y", -box.height / 2)
          .attr("width", box.width)
          .attr("height", box.height)
          .attr("rx", 8)
          .attr("fill", "none")
          .attr("fill", box.getColor())
          .attr("fill-opacity", 0.2)
          .attr("stroke", box.getColor())
          .attr("stroke-width", 2);

        // 支援虛線樣式
        if (box.borderStyle === "dashed") {
          rect.attr("stroke-dasharray", "5,5");
        } else {
          rect.attr("stroke-dasharray", null);
        }

        textVal
          .attr("y", 5) // 置中
          .attr("fill", "#ccc");

        textDesc
          .attr("y", box.height / 2 + 16) // 底部下方
          .attr("fill", "#ccc");
      }

      // 統一設定文字屬性 (位置已在上面分開處理)
      textDesc
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text(box.description || "");
      textVal
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .text(box.value !== undefined ? box.value : "");
    } else if (d.kind === "pointer" || d instanceof Pointer) {
      const ptr = d as Pointer;
      const textLabel = g.select<SVGTextElement>("text.ptr-label");
      
      textLabel
        .attr("text-anchor", "middle")
        .attr("y", 25) // 箭頭下方
        .attr("font-size", 14)
        .attr("font-weight", "bold")
        .attr("fill", "#ffeb3b")
        .text(ptr.label);
    }
  });
}
