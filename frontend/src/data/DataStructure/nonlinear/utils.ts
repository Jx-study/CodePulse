import * as d3 from "d3";
import { Node } from "@/modules/core/DataLogic/Node";
import { createNodeInstance } from "@/data/DataStructure/linear/utils";

export interface HierarchyDatum {
  id: string;
  value: number;
  count?: number;
  children?: HierarchyDatum[];
  isDummy?: boolean;
}

export function buildD3HierarchyData(
  data: { id: string; value: number; count?: number }[],
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
          break;
        }
      }
    }
  }
  return root;
}

export function buildBSTHierarchyData(
  data: { id: string; value: number; count?: number }[]
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
  } = {}
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
      descText
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
