import * as d3 from "d3";
import { BaseElement } from "../DataLogic/BaseElement";
import { Node } from "../DataLogic/Node";
import { Box } from "../DataLogic/Box";
import { LinkManager } from "../DataLogic/LinkManager";
import type { StatusColorMap } from "@/types/statusConfig";
import { Pointer } from "../DataLogic/Pointer";
import "./D3Renderer.module.scss";

export type linkStatus = "default" | "visited" | "path" | "target" | "complete";

export const linkStatusColorMap: Record<linkStatus, string> = {
  default: "#888",
  visited: "#1d79cfff",
  path: "yellow",
  target: "orange",
  complete: "#46f336ff",
};

export interface Link {
  key: string;
  sourceId: string;
  targetId: string;
  status?: linkStatus;
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

function getLinkPath(source: Node, target: Node): string {
  if (
    isNaN(source.position.x) ||
    isNaN(source.position.y) ||
    isNaN(target.position.x) ||
    isNaN(target.position.y)
  ) {
    return "";
  }

  const r = source.radius || 20;

  // Case 1: 自環 (Self-loop)
  if (source.id === target.id) {
    const x = source.position.x;
    const y = source.position.y;

    const startX = x - r * 0.7;
    const startY = y - r * 0.7;
    const endX = x + r * 0.7;
    const endY = y - r * 0.7;

    const cp1X = x - r * 2.5;
    const cp1Y = y - r * 2.5;
    const cp2X = x + r * 2.5;
    const cp2Y = y - r * 2.5;

    // 格式：M 起點 C 控制點1 控制點2 終點
    return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
  }

  // Case 2: 一般連線 (Straight Line -> 偽裝成 Curve)
  const p1 = getCircleBoundaryPoint(source, target);
  const p2 = getCircleBoundaryPoint(target, source);

  if (isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
    return "";
  }

  // 用 C (Bezier) 來畫直線。
  // 設為：控制點1 = 起點, 控制點2 = 終點

  return `M ${p1.x},${p1.y} C ${p1.x},${p1.y} ${p2.x},${p2.y} ${p2.x},${p2.y}`;
}

function getZeroLengthPath(source: Node, target: Node): string {
  if (
    isNaN(source.position.x) ||
    isNaN(source.position.y) ||
    isNaN(target.position.x) ||
    isNaN(target.position.y)
  ) {
    return "";
  }

  // Case 1: 自環 (Self-loop)
  // 讓初始點停留在自環的「起點」 (x - r*0.7)，而不是圓心
  if (source.id === target.id) {
    const r = source.radius || 20;
    const x = source.position.x;
    const y = source.position.y;
    const startX = x - r * 0.7;
    const startY = y - r * 0.7;
    // 縮成一個點
    return `M ${startX},${startY} C ${startX},${startY} ${startX},${startY} ${startX},${startY}`;
  }

  // Case 2: 一般連線
  // 取得圓邊界上的一個點
  const { x, y } = getCircleBoundaryPoint(source, target);
  return `M ${x},${y} C ${x},${y} ${x},${y} ${x},${y}`;
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
  duration: number = 800,
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
  type: string,
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
  } else if (type === "binarytree") {
    const startX = 750;
    const endX = 950;
    const topY = 50;
    const bottomY = 380;

    // 左線
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", startX)
      .attr("y1", topY)
      .attr("x2", startX)
      .attr("y2", bottomY)
      .attr("stroke", "#555")
      .attr("stroke-width", 2);

    // 右線
    scene
      .append("line")
      .attr("class", "container-line")
      .attr("x1", endX)
      .attr("y1", topY)
      .attr("x2", endX)
      .attr("y2", bottomY)
      .attr("stroke", "#555")
      .attr("stroke-width", 2);

    // 底部
    // scene
    //   .append("line")
    //   .attr("class", "container-line")
    //   .attr("x1", startX)
    //   .attr("y1", bottomY)
    //   .attr("x2", endX)
    //   .attr("y2", bottomY)
    //   .attr("stroke", "#555")
    //   .attr("stroke-width", 2);

    // Label
    scene
      .append("text")
      .attr("x", startX)
      .attr("y", bottomY + 20)
      .text("Call Stack/Queue")
      .attr("fill", "#888")
      .attr("font-size", 12);
  }
}

export function renderAll(
  svgEl: SVGSVGElement,
  elements: BaseElement[],
  links: Link[] = [],
  structureType: string = "linkedlist",
  isDirected: boolean = true,
  statusColorMap?: StatusColorMap,
) {
  // Inject custom color map into all elements if provided
  if (statusColorMap) {
    elements.forEach((element) => {
      element.setCustomColorMap(statusColorMap);
    });
  }

  const svg = d3.select(svgEl);
  const transitionDuration = 500; // 統一動畫時間
  const transitionEase = d3.easeQuadOut;

  const getColor = (status?: string) => {
    return (
      linkStatusColorMap[status as linkStatus] || linkStatusColorMap.default
    );
  };

  // Pre-calculation for AutoScale(Grouping Support)
  const scaleYMap = new Map<string, d3.ScaleLinear<number, number>>();

  const autoScaleBoxes = elements.filter(
    (e): e is Box => e instanceof Box && e.autoScale,
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
  const forceHideArrow = ["bfs", "dfs", "binarytree", "bst"].includes(
    structureType,
  );
  // 如果是 graph，則根據 isDirected 決定
  const shouldHideArrow =
    structureType === "graph" ? !isDirected : forceHideArrow;
  const markerUrl = shouldHideArrow ? null : "url(#arrowhead)";
  const defs = svg.selectAll("defs").data([null]);
  const defsEnter = defs.enter().append("defs");
  if (svg.select("#arrowhead").empty()) {
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
  }

  Object.entries(linkStatusColorMap).forEach(([status, color]) => {
    // 檢查是否已存在，避免重複 append (雖然 data([null]) 會擋，但保險起見)
    if (svg.select(`#arrowhead-${status}`).empty()) {
      svg
        .select("defs")
        .append("marker")
        .attr("id", `arrowhead-${status}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    }
  });

  // 根 <g>
  const root = svg.selectAll<SVGGElement, null>("g.scene").data([null]);
  root.enter().append("g").attr("class", "scene");
  const scene = svg.select<SVGGElement>("g.scene");

  drawContainer(scene, structureType);
  // 清除舊的連線 (避免重繪疊加)
  // 不知道有沒有用
  scene.selectAll("line.link").remove();

  // === 先畫 LINKS（在底層）===
  // 依 id 找 element
  const byId = new Map(elements.map((e) => [String(e.id), e]));
  // 僅保留 Node -> Node 的連線
  const linkData = links
    .map((lk) => {
      const s = byId.get(String(lk.sourceId));
      const t = byId.get(String(lk.targetId));
      if (s instanceof Node && t instanceof Node) {
        return { s, t, status: lk.status };
      }
      return null;
    })
    .filter(Boolean) as { s: Node; t: Node; status?: string }[];

  const linkSel = scene
    .selectAll<
      SVGPathElement,
      { s: Node; t: Node; status?: string }
    >("path.link")
    .data(linkData, (d: any) => `${d.s.id}->${d.t.id}`);

  // 終點縮向起點
  linkSel
    .exit()
    .transition()
    .duration(transitionDuration)
    .attr("d", (d: any) => getZeroLengthPath(d.s, d.t))
    .remove();

  const linkEnter = linkSel
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("stroke", "#888")
    .attr("stroke-width", 2)
    .attr("fill", "none") // 設為 none，不然自環中間會被填滿黑色
    .attr("marker-end", markerUrl)
    // 初始狀態：從起點長出來
    .attr("d", (d) => getZeroLengthPath(d.s, d.t));
  // 設定初始位置在來源節點邊界，避免從 (0,0) 開始動畫

  linkEnter
    .merge(linkSel as any)
    .attr("marker-end", (d) => {
      if (shouldHideArrow) return null;
      const status = d.status || "default";
      return `url(#arrowhead-${status})`;
    })
    .transition()
    .duration(transitionDuration)
    .ease(transitionEase)
    .attr("d", (d) => getLinkPath(d.s, d.t))

    .attr("stroke", (d) => getColor(d.status))
    .attr("stroke-width", 2)
    .on("end", function (d) {
      if (d.status) d3.select(this).raise();
    });

  // NODES / BOXES（在上層）
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
      const ptr = d as Pointer;
      const isDown = ptr.direction === "down";

      // 箭頭
      g.append("path")
        .attr("d", isDown ? "M0,0 L-5,-10 L5,-10 Z" : "M0,0 L-5,10 L5,10 Z") // down: 向下指 (頂點在 0,0), up: 向上指 (頂點在 0,0)
        .attr("fill", "#ffeb3b"); // 黃色箭頭

      // 標籤文字
      g.append("text").attr("class", "ptr-label");
    }

    g.append("text").attr("class", "desc"); // 顯示 description
    g.append("text").attr("class", "val"); // 顯示 value
  });

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

        textVal
          .attr("y", 5) // 置中
          .attr("fill", "#ccc");

        // 支援虛線樣式
        if (box.borderStyle === "dashed") {
          rect.attr("stroke-dasharray", "5,5");
        } else {
          rect.attr("stroke-dasharray", null);
        }

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
      const isDown = ptr.direction === "down";

      textLabel
        .attr("text-anchor", "middle")
        .attr("y", isDown ? -20 : 25) // down: 文字在箭頭上方, up: 文字在箭頭下方
        .attr("font-size", 14)
        .attr("font-weight", "bold")
        .attr("fill", "#ffeb3b")
        .text(ptr.label);
    }
  });
}
