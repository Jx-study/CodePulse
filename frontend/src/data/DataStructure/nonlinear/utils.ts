import * as d3 from "d3";
import { Node } from "../../../modules/core/DataLogic/Node";
import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep } from "@/types";
import { createNodeInstance } from "../linear/utils";

export const getLinkKey = (s: string, t: string) => `${s}->${t}`;

export const updateLinkStatus = (
  map: Record<string, string>,
  u: string,
  v: string,
  status: string | undefined,
  isDirected: boolean,
) => {
  const k1 = getLinkKey(u, v);
  const k2 = getLinkKey(v, u);
  if (status) {
    map[k1] = status;
    if (!isDirected) map[k2] = status;
  } else {
    delete map[k1];
    if (!isDirected) delete map[k2];
  }
};

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

export const generateGridFrame = (
  gridData: any[],
  cols: number,
  statusMap: Record<number, Status>,
  distanceMap: Record<number, number>,
  description: string,
  showIdAsValue: boolean = false,
): AnimationStep => {
  const elements = createGridElements(gridData, cols);

  elements.forEach((box, index) => {
    if (box.value === 1) {
      box.value = "wall" as any;
      return;
    }

    if (showIdAsValue) {
      box.value = index;
    } else {
      // 顯示距離
      if (distanceMap[index] !== undefined) {
        box.value = distanceMap[index];
      } else {
        box.value = "∞" as any; // 未訪問
      }
    }

    if (statusMap[index]) {
      box.setStatus(statusMap[index]);
    }
  });

  return {
    stepNumber: 0,
    description,
    elements,
  };
};

export const generateGraphFrame = (
  baseElements: Node[],
  statusMap: Record<string, Status>,
  distanceMap: Record<string, number>,
  description: string,
  showIdAsValue: boolean = false,
  linkStatusMap: Record<string, string> = {},
): AnimationStep => {
  const frameElements = baseElements.map((node) => {
    const newNode = new Node();
    newNode.id = node.id;

    if (showIdAsValue) {
      const numId = parseInt(node.id.replace("node-", ""), 10);
      newNode.value = isNaN(numId) ? -1 : numId;
    } else {
      const dist = distanceMap[node.id];
      newNode.value = (dist === undefined || dist === 99 ? "∞" : dist) as any;
    }

    let x = node.position.x;
    let y = node.position.y;
    newNode.moveTo(x, y);
    newNode.radius = node.radius;
    newNode.pointers = node.pointers;

    const status = statusMap[node.id];
    if (status) {
      newNode.setStatus(status);
    } else {
      newNode.setStatus("inactive");
    }

    return newNode;
  });

  const links: { sourceId: string; targetId: string; status?: string }[] = [];

  baseElements.forEach((source) => {
    source.pointers.forEach((target) => {
      const key = getLinkKey(source.id, target.id);
      links.push({
        sourceId: source.id,
        targetId: target.id,
        status: linkStatusMap[key],
      });
    });
  });

  return {
    stepNumber: 0,
    description,
    elements: frameElements,
    links: links,
  };
};

export function createGraphElements(
  rawGraph: {
    nodes: any[];
    edges: string[][];
  },
  isDirected: boolean = false,
): Node[] {
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
      // 初始位置：X 軸隨機分布在整個寬度 (10% ~ 90%)，Y 軸集中在中間
      x: CANVAS_W * 0.1 + Math.random() * (CANVAS_W * 0.8),
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
          .distance(200), // 連線距離
      )
      .force("charge", d3.forceManyBody().strength(-450)) // 斥力：增加強度避免重疊
      .force("center", d3.forceCenter(CANVAS_W / 2, CANVAS_H / 2)) // 畫布中心
      .force("collide", d3.forceCollide(45)) // 碰撞半徑略大於節點半徑
      // Y 軸引力較強 (0.1)，把節點壓扁在水平帶狀區域
      .force("y", d3.forceY(CANVAS_H / 2).strength(0.1))
      // X 軸引力極弱 (0.01)，允許它們左右飄移擴散
      .force("x", d3.forceX(CANVAS_W / 2).strength(0.01));

    // 跑模擬 (靜態計算)
    simulation.tick(500);
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

  // 建立連線 (單/雙向)
  edges.forEach(([sourceId, targetId]) => {
    const source = nodeMap.get(sourceId);
    const target = nodeMap.get(targetId);
    if (source && target) {
      source.pointers.push(target);
      if (!isDirected) {
        target.pointers.push(source);
      }
    }
  });

  return elements;
}

export interface HierarchyDatum {
  id: string;
  value: number;
  count?: number;
  children?: HierarchyDatum[];
  isDummy?: boolean;
}

export function buildD3HierarchyData(
  data: { id: string; value: number; count?: number }[],
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
  data: { id: string; value: number; count?: number }[],
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

  const hierarchyData =
    type === "bst"
      ? buildBSTHierarchyData(inputData)
      : buildD3HierarchyData(inputData, degree);

  if (!hierarchyData) return [];

  const root = d3.hierarchy<HierarchyDatum>(hierarchyData);
  const treeLayout = d3.tree<HierarchyDatum>().size([width, height]);
  const rootWithPos = treeLayout(root);

  const elements: Node[] = [];
  const nodeMap = new Map<string, Node>();

  rootWithPos.descendants().forEach((d) => {
    if (d.data.isDummy) return;

    const count = d.data.count;
    const descText = count && count > 1 ? `Count: ${count}` : "";

    const node = createNodeInstance(
      d.data.id,
      d.data.value,
      d.x + offsetX,
      d.y + offsetY,
      "inactive",
      descText,
    );

    elements.push(node);
    nodeMap.set(d.data.id, node);
  });

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
