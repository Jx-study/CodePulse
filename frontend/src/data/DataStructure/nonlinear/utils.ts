import * as d3 from "d3";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Box } from "../../../modules/core/DataLogic/Box";
import { createNodeInstance } from "../linear/utils";

export interface GridCellData {
  id: string;
  val: number;
}

export function createGridElements(
  rawGrid: GridCellData[],
  cols: number = 5,
): Box[] {
  const elements: Box[] = [];
  const cellSize = 50;
  const padding = 10;
  const startX = 100;
  const startY = 100;

  rawGrid.forEach((item, index) => {
    const box = new Box();
    box.id = item.id;
    box.value = item.val; // 0:路, 1:牆

    const col = index % cols;
    const row = Math.floor(index / cols);

    let x = startX + col * (cellSize + padding);
    let y = startY + row * (cellSize + padding);

    box.moveTo(x, y);
    box.width = cellSize;
    box.height = cellSize;

    box.setStatus("inactive");

    elements.push(box);
  });

  return elements;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  val: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

export function createGraphElements(rawGraph: {
  nodes: any[];
  edges: string[][];
}): Node[] {
  const { nodes: rawNodes, edges } = rawGraph;
  const elements: Node[] = [];
  const nodeMap = new Map<string, Node>();

  // 定義畫布邊界與內距 (避免節點切到邊邊)
  const CANVAS_W = 1000;
  const CANVAS_H = 400;
  const PADDING = 40; // 節點半徑約 20-30，留 40 比較安全

  // 檢查是否所有節點都已經有座標 (快取機制)
  const hasCachedPositions = rawNodes.every(
    (n) => typeof n.x === "number" && typeof n.y === "number",
  );

  if (hasCachedPositions) {
    // 直接使用現有座標 (跳過 D3 Simulation)
    rawNodes.forEach((n, i) => {
      const node = new Node();
      node.id = n.id;
      node.value = n.value ?? i;
      node.moveTo(n.x, n.y); // 直接使用儲存的座標

      elements.push(node);
      nodeMap.set(node.id, node);
    });
  } else {
    // 準備 D3 Simulation 資料
    const simNodes: SimNode[] = rawNodes.map((n, i) => ({
      id: n.id,
      val: n.value ?? i,
      // 初始位置隨機分布在畫布中央附近
      x: CANVAS_W / 2 + (Math.random() - 0.5) * 50,
      y: CANVAS_H / 2 + (Math.random() - 0.5) * 50,
    }));

    const simLinks: SimLink[] = edges.map(([source, target]) => ({
      source,
      target,
    }));

    // 執行 Force Simulation
    const simulation = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink(simLinks)
          .id((d: any) => d.id)
          .distance(100), // 連線距離
      )
      .force("charge", d3.forceManyBody().strength(-300)) // 斥力：增加強度避免重疊
      .force("center", d3.forceCenter(CANVAS_W / 2, CANVAS_H / 2)) // 畫布中心
      .force("collide", d3.forceCollide(45)) // 碰撞半徑略大於節點半徑
      // 加入 Y 軸引力，讓圖形盡量保持在水平帶狀，避免上下溢出太嚴重
      .force("y", d3.forceY(CANVAS_H / 2).strength(0.05))
      .force("x", d3.forceX(CANVAS_W / 2).strength(0.05));

    // 跑模擬 (靜態計算)
    simulation.tick(300);
    simulation.stop();

    // 轉換回 Node 物件並套用邊界限制 (Clamping)
    simNodes.forEach((simNode) => {
      const node = new Node();
      node.id = simNode.id;
      node.value = simNode.val;

      // 取出計算後的座標 (若無則預設中心)
      let x = simNode.x ?? CANVAS_W / 2;
      let y = simNode.y ?? CANVAS_H / 2;

      // 強制限制在畫布範圍內 (Math.max, Math.min)
      // 確保 x 在 [padding, 1000 - padding]
      // 確保 y 在 [padding, 400 - padding]
      x = Math.max(PADDING, Math.min(CANVAS_W - PADDING, x));
      y = Math.max(PADDING, Math.min(CANVAS_H - PADDING, y));

      node.moveTo(x, y);
      elements.push(node);
      nodeMap.set(node.id, node);
    });
  }

  // 建立連線 (雙向)
  edges.forEach(([sourceId, targetId]) => {
    const source = nodeMap.get(sourceId);
    const target = nodeMap.get(targetId);
    if (source && target) {
      source.pointers.push(target);
      target.pointers.push(source);
    }
  });

  return elements;
}

export interface HierarchyDatum {
  id: string;
  value: number;
  children?: HierarchyDatum[];
  isDummy?: boolean; // 標記是否增加隱形節點，將單一節點推到左側或右側(為了美觀)
}

/**
 * 將線性陣列 (Level Order) 轉為 D3 Hierarchy 結構
 * @param degree 分支度 (2=二元樹, 3=三元樹...)
 */
export function buildD3HierarchyData(
  data: { id: string; value: number }[],
  degree: number = 2,
): HierarchyDatum | null {
  if (data.length === 0) return null;

  const nodes = data.map((d) => ({
    ...d,
    children: [] as HierarchyDatum[],
  }));

  const root = nodes[0];
  const queue = [root];
  let i = 1;

  while (i < nodes.length) {
    const curr = queue.shift();
    if (curr) {
      for (let k = 0; k < degree; k++) {
        if (i < nodes.length) {
          curr.children!.push(nodes[i]);
          queue.push(nodes[i]);
          i++;
        } else {
          break;
        }
      }
    }
  }
  return root;
}

export function buildBSTHierarchyData(
  data: { id: string; value: number }[],
): HierarchyDatum | null {
  if (data.length === 0) return null;

  const nodes = data.map((d) => ({
    ...d,
    children: [] as HierarchyDatum[],
    left: null as any,
    right: null as any,
  }));

  const root = nodes[0];

  for (let i = 1; i < data.length; i++) {
    let curr = root;
    const newNode = nodes[i];

    while (true) {
      if (newNode.value < curr.value) {
        if (curr.left) {
          curr = curr.left;
        } else {
          curr.left = newNode;
          break;
        }
      } else {
        if (curr.right) {
          curr = curr.right;
        } else {
          curr.right = newNode;
          break;
        }
      }
    }
  }

  convertToChildren(root);
  return root;
}

function convertToChildren(node: any) {
  if (node.left || node.right) {
    if (node.left) {
      node.children.push(node.left);
      convertToChildren(node.left);
    } else {
      // 補一個左側隱形節點
      node.children.push({
        id: `dummy-${node.id}-left`,
        value: 0,
        isDummy: true,
        children: [],
      });
    }

    if (node.right) {
      node.children.push(node.right);
      convertToChildren(node.right);
    } else {
      // 補一個右側隱形節點
      node.children.push({
        id: `dummy-${node.id}-right`,
        value: 0,
        isDummy: true,
        children: [],
      });
    }
  }
}

/**
 * 通用的樹狀結構生成器
 * @param inputData 線性輸入資料
 * @param options 版面配置選項
 */
export function createTreeNodes(
  inputData: any[],
  options: {
    width?: number;
    height?: number;
    offsetX?: number;
    offsetY?: number;
    degree?: number;
    type?: "bst" | "binarytree";
  } = {},
): Node[] {
  const {
    width = 700,
    height = 300,
    offsetX = 0,
    offsetY = 50,
    degree = 2,
    type = "binarytree",
  } = options;

  // 1. 轉換資料
  const hierarchyData =
    type === "bst"
      ? buildBSTHierarchyData(inputData)
      : buildD3HierarchyData(inputData, degree);

  if (!hierarchyData) return [];

  // 2. D3 Layout
  const root = d3.hierarchy<HierarchyDatum>(hierarchyData);
  const treeLayout = d3.tree<HierarchyDatum>().size([width, height]);
  const rootWithPos = treeLayout(root);

  // 3. 轉換為我們系統的 Node
  const elements: Node[] = [];
  const nodeMap = new Map<string, Node>();

  // (A) 建立節點 (使用 createNodeInstance)
  rootWithPos.descendants().forEach((d) => {
    if (d.data.isDummy) return;
    const node = createNodeInstance(
      d.data.id,
      d.data.value,
      d.x + offsetX,
      d.y + offsetY,
    );
    elements.push(node);
    nodeMap.set(d.data.id, node);
  });

  // (B) 建立連線 (設定 pointers)
  rootWithPos.links().forEach((link) => {
    if (link.target.data.isDummy) return;

    const sourceNode = nodeMap.get(link.source.data.id);
    const targetNode = nodeMap.get(link.target.data.id);

    if (sourceNode && targetNode) {
      sourceNode.pointers.push(targetNode);
    }
  });

  return elements;
}
