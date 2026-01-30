import * as d3 from "d3";
import { Node } from "../../../modules/core/DataLogic/Node";
// 假設 createNodeInstance 在 linear/utils 或者是共用的 core utils
// 為了方便，這裡假設你可以從原本的 utils 匯入，或者你也把 createNodeInstance 搬到更上層
import { createNodeInstance } from "../linear/utils";

export interface HierarchyDatum {
  id: string;
  value: number;
  children?: HierarchyDatum[];
}

/**
 * 將線性陣列 (Level Order) 轉為 D3 Hierarchy 結構
 * @param degree 分支度 (2=二元樹, 3=三元樹...)
 */
export function buildD3HierarchyData(
  data: { id: string; value: number }[],
  degree: number = 2
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
          break; // 資料沒了就停
        }
      }
    }
  }
  return root;
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
  } = {}
): Node[] {
  const {
    width = 700,
    height = 300,
    offsetX = 0,
    offsetY = 50,
    degree = 2,
  } = options;

  // 1. 轉換資料
  const hierarchyData = buildD3HierarchyData(inputData, degree);
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
    const node = createNodeInstance(
      d.data.id,
      d.data.value,
      d.x + offsetX,
      d.y + offsetY
    );
    elements.push(node);
    nodeMap.set(d.data.id, node);
  });

  // (B) 建立連線 (設定 pointers)
  rootWithPos.links().forEach((link) => {
    const sourceNode = nodeMap.get(link.source.data.id);
    const targetNode = nodeMap.get(link.target.data.id);

    if (sourceNode && targetNode) {
      sourceNode.pointers.push(targetNode);
    }
  });

  return elements;
}
