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

export function createGraphElements(rawGraph: {
  nodes: any[];
  edges: string[][];
}): Node[] {
  const { nodes: rawNodes, edges } = rawGraph;
  const elements: Node[] = [];
  const nodeMap = new Map<string, Node>();

  // 設定圓形佈局參數
  const centerX = 400;
  const centerY = 200;
  const radius = 120;
  const angleStep = (2 * Math.PI) / rawNodes.length;

  // 建立節點
  rawNodes.forEach((n, index) => {
    const node = new Node();
    node.id = n.id;
    node.value = n.value ?? index; // 如果沒有 value 就用 index

    // 計算座標 (圓形)
    const x = centerX + radius * Math.cos(index * angleStep - Math.PI / 2);
    const y = centerY + radius * Math.sin(index * angleStep - Math.PI / 2);

    node.moveTo(x, y);
    elements.push(node);
    nodeMap.set(n.id, node);
  });

  // 建立連線
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
