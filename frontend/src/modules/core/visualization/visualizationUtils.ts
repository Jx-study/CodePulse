import type { AlgorithmNode, GraphData } from "./types";

/** 深拷貝資料 */
export function cloneData<T>(source: T): T {
  return JSON.parse(JSON.stringify(source));
}

/** 將純數字陣列轉為 Box 物件 (給排序/搜尋用) */
export function initLinearData(
  rawValues: number[],
  nextIdRef: { current: number }
): any[] {
  return rawValues.map((val) => ({
    id: `box-${nextIdRef.current++}`,
    value: val,
    position: { x: 0, y: 0 },
  }));
}


/** 生成隨機 Grid（BFS/DFS 用） */
export function generateRandomGrid(rows: number, cols: number): any[] {
  const grid = [];
  for (let i = 0; i < rows * cols; i++) {
    const isWall = Math.random() < 0.4 ? 1 : 0;
    grid.push({ id: `box-${i}`, val: isWall });
  }
  grid[0].val = 0;
  grid[grid.length - 1].val = 0;
  return grid;
}

/** 生成隨機 Graph（演算法用，可選權重） */
export function generateRandomGraph(
  nodeCount: number,
  withWeights = false
): GraphData {
  const nodes: AlgorithmNode[] = [];
  const edges: string[][] = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: `node-${i}` });
  }

  for (let i = 1; i < nodeCount; i++) {
    const targetIndex = Math.floor(Math.random() * i);
    const weight = withWeights ? Math.floor(Math.random() * 20) + 1 : undefined;
    if (weight !== undefined) {
      edges.push([`node-${i}`, `node-${targetIndex}`, weight.toString()]);
    } else {
      edges.push([`node-${i}`, `node-${targetIndex}`]);
    }
  }

  const extraEdges = Math.floor(nodeCount * 0.5);
  for (let k = 0; k < extraEdges; k++) {
    const u = Math.floor(Math.random() * nodeCount);
    const v = Math.floor(Math.random() * nodeCount);
    if (u !== v) {
      const exists = edges.some(
        (e) =>
          (e[0] === `node-${u}` && e[1] === `node-${v}`) ||
          (e[0] === `node-${v}` && e[1] === `node-${u}`)
      );
      if (!exists) {
        if (withWeights) {
          const weight = Math.floor(Math.random() * 20) + 1;
          edges.push([`node-${u}`, `node-${v}`, weight.toString()]);
        } else {
          edges.push([`node-${u}`, `node-${v}`]);
        }
      }
    }
  }
  return { nodes, edges };
}

/** 生成隨機 Graph（資料結構用，無權重，節點有 value） */
export function generateRandomGraphDS(nodeCount: number): GraphData {
  const nodes: AlgorithmNode[] = [];
  const edges: string[][] = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: `node-${i}`, value: String(i) });
  }

  for (let i = 1; i < nodeCount; i++) {
    const targetIndex = Math.floor(Math.random() * i);
    edges.push([`node-${i}`, `node-${targetIndex}`]);
  }

  const extraEdges = Math.floor(nodeCount * 0.5);
  for (let k = 0; k < extraEdges; k++) {
    const u = Math.floor(Math.random() * nodeCount);
    const v = Math.floor(Math.random() * nodeCount);
    if (u !== v) {
      const exists = edges.some(
        (e) =>
          (e[0] === `node-${u}` && e[1] === `node-${v}`) ||
          (e[0] === `node-${v}` && e[1] === `node-${u}`)
      );
      if (!exists) edges.push([`node-${u}`, `node-${v}`]);
    }
  }
  return { nodes, edges };
}
