import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Node } from "@/modules/core/DataLogic/Node";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import { asTrace } from "@/data/shared/traceValue";
import { createTreeNodes, buildLinksFromNodes } from "../utils";
import {
  flattenUniqueNodes,
  type BSTInputItem,
  type LogicTreeNode,
} from "../BinarySearchTree/simulateTrace";
import { balanceFactor, fromState } from "./avl";
import { TAGS, AVLStatus } from "./tags";

interface AVLTraceMeta {
  inputData?: BSTInputItem[];
  statusMap?: Record<string, string>;
  linkStatusMap?: Record<string, linkStatus>;
}

const AVL_LAYOUT = {
  degree: 2,
  width: 1000,
  height: 300,
  offsetX: 0,
  offsetY: 50,
  type: "bst" as const,
  nodeSize: [120, 100] as [number, number],
};

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { count: e.local_vars.nodeCount },
  }),
};

const formatBalanceFactor = (bf: number) => `BF ${bf > 0 ? "+" : ""}${bf}`;

function balanceFactorById(root: LogicTreeNode | null) {
  const map: Record<string, number> = {};
  const walk = (node: LogicTreeNode | undefined) => {
    if (!node) return;
    map[node.id] = balanceFactor(node);
    walk(node.left);
    walk(node.right);
  };
  walk(root ?? undefined);
  return map;
}

export function avlTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = asTrace<AVLTraceMeta>(event.meta);
    const inputData = meta.inputData || [];
    const statusMap = meta.statusMap || {};
    const linkStatusMap = meta.linkStatusMap || {};

    const root = fromState(inputData);
    const uniqueData: BSTInputItem[] = [];
    flattenUniqueNodes(root || undefined, uniqueData);
    const bfOf = balanceFactorById(root);

    const treeElements = createTreeNodes(uniqueData, AVL_LAYOUT);
    treeElements.forEach((el) => {
      if (el instanceof Node) {
        el.setStatus(statusMap[el.id] || AVLStatus.Inactive);
        if (el.value !== "") el.value = String(Math.round(Number(el.value)));
        el.description = formatBalanceFactor(bfOf[el.id] ?? 0);
      }
    });

    treeElements.sort((a, b) => {
      const isNodeA = a instanceof Node;
      const isNodeB = b instanceof Node;
      if (isNodeA && !isNodeB) return 1;
      if (!isNodeA && isNodeB) return -1;
      return a.id.localeCompare(b.id);
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      local_vars: event.local_vars,
      elements: [...treeElements],
      links: buildLinksFromNodes(treeElements, linkStatusMap),
    };
  });
}
