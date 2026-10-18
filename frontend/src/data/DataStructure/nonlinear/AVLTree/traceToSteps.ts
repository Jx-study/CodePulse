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
import { balanceFactor, fromState, height } from "./avl";
import { TAGS, AVLStatus } from "./tags";

interface AVLTraceMeta {
  rotation?: { edges: string[][]; labels: Record<string, string> };
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

const lv = (e: TraceEvent) => e.local_vars;

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { count: lv(e).nodeCount },
  }),
  [TAGS.INS_COMPARE]: (e) => ({
    key: "animation.ins_compare",
    params: { val: lv(e).val, curr: lv(e).curr },
  }),
  [TAGS.INS_LEFT]: (e) => ({
    key: "animation.ins_left",
    params: { val: lv(e).val, curr: lv(e).curr },
  }),
  [TAGS.INS_RIGHT]: (e) => ({
    key: "animation.ins_right",
    params: { val: lv(e).val, curr: lv(e).curr },
  }),
  [TAGS.INS_EQUAL]: (e) => ({
    key: "animation.ins_equal",
    params: { val: lv(e).val, count: lv(e).count },
  }),
  [TAGS.INS_PLACE]: (e) => ({
    key:
      lv(e).parent === null
        ? "animation.ins_place_root"
        : "animation.ins_place",
    params: { val: lv(e).val, parent: lv(e).parent },
  }),
  [TAGS.BF_CHECK]: (e) => ({
    key: "animation.bf_check",
    params: { node: lv(e).node, height: lv(e).height, bf: lv(e).bf },
  }),
  [TAGS.BALANCED]: (e) => ({
    key: "animation.balanced",
    params: { node: lv(e).node, bf: lv(e).bf },
  }),
  [TAGS.UNBALANCED_LEFT]: (e) => ({
    key: `animation.unbalanced_${String(lv(e).case).toLowerCase()}`,
    params: {
      node: lv(e).node,
      bf: lv(e).bf,
      child: lv(e).child,
      childBf: lv(e).childBf,
    },
  }),
  [TAGS.UNBALANCED_RIGHT]: (e) => ({
    key: `animation.unbalanced_${String(lv(e).case).toLowerCase()}`,
    params: {
      node: lv(e).node,
      bf: lv(e).bf,
      child: lv(e).child,
      childBf: lv(e).childBf,
    },
  }),
  [TAGS.ROTATE_CHILD_LEFT]: (e) => ({
    key: "animation.rotate_child_left",
    params: { node: lv(e).node, pivot: lv(e).pivot },
  }),
  [TAGS.ROTATE_CHILD_RIGHT]: (e) => ({
    key: "animation.rotate_child_right",
    params: { node: lv(e).node, pivot: lv(e).pivot },
  }),
  [TAGS.ROTATE_RIGHT]: (e) => ({
    key: "animation.rotate_right",
    params: { node: lv(e).node, pivot: lv(e).pivot },
  }),
  [TAGS.ROTATE_LEFT]: (e) => ({
    key: "animation.rotate_left",
    params: { node: lv(e).node, pivot: lv(e).pivot },
  }),
  ...rotationDescriptions(),
  ...deleteDescriptions(),
  [TAGS.INS_DONE]: (e) => ({
    key: "animation.ins_done",
    params: { val: lv(e).val },
  }),
};

function deleteDescriptions(): Record<
  string,
  (e: TraceEvent) => StepDescription
> {
  const val = (e: TraceEvent) => ({ val: lv(e).val });
  const bf = (e: TraceEvent): StepDescription => ({
    key: "animation.bf_check",
    params: { node: lv(e).node, height: lv(e).height, bf: lv(e).bf },
  });
  return {
    [TAGS.DEL_EMPTY]: (e) => ({ key: "animation.del_empty", params: val(e) }),
    [TAGS.DEL_COMPARE]: (e) => ({
      key: "animation.del_compare",
      params: { val: lv(e).val, curr: lv(e).curr },
    }),
    [TAGS.DEL_LEFT]: (e) => ({
      key: "animation.del_left",
      params: { val: lv(e).val, curr: lv(e).curr },
    }),
    [TAGS.DEL_RIGHT]: (e) => ({
      key: "animation.del_right",
      params: { val: lv(e).val, curr: lv(e).curr },
    }),
    [TAGS.DEL_NOT_FOUND]: (e) => ({
      key: "animation.del_not_found",
      params: val(e),
    }),
    [TAGS.DEL_FOUND]: (e) => ({ key: "animation.del_found", params: val(e) }),
    [TAGS.DEL_COUNT_DEC]: (e) => ({
      key: "animation.del_count_dec",
      params: { val: lv(e).val, count: lv(e).count },
    }),
    [TAGS.DEL_LEAF]: (e) => ({ key: "animation.del_leaf", params: val(e) }),
    [TAGS.DEL_ONE_CHILD]: (e) => ({
      key: "animation.del_one_child",
      params: { val: lv(e).val, child: lv(e).child },
    }),
    [TAGS.DEL_REMOVE]: (e) => ({
      key:
        lv(e).child === null
          ? "animation.del_remove_leaf"
          : "animation.del_remove_child",
      params: { val: lv(e).val, child: lv(e).child },
    }),
    [TAGS.DEL_TWO_CHILD]: (e) => ({
      key: "animation.del_two_child",
      params: val(e),
    }),
    [TAGS.DEL_SUCC_FIND]: (e) => ({
      key: lv(e).last
        ? "animation.del_succ_found"
        : "animation.del_succ_find",
      params: { val: lv(e).val, succ: lv(e).succ },
    }),
    [TAGS.DEL_SUCC_COPY]: (e) => ({
      key: "animation.del_succ_copy",
      params: { val: lv(e).val, succ: lv(e).succ },
    }),
    [TAGS.DEL_SUCC_REMOVE]: (e) => ({
      key:
        lv(e).child === null
          ? "animation.del_succ_remove_leaf"
          : "animation.del_succ_remove_child",
      params: { succ: lv(e).succ, child: lv(e).child },
    }),
    [TAGS.DEL_BF_CHECK]: bf,
    [TAGS.DEL_BF_CHECK_SUCC]: bf,
    [TAGS.DEL_DONE]: (e) => ({ key: "animation.del_done", params: val(e) }),
  };
}

function rotationDescriptions(): Record<
  string,
  (e: TraceEvent) => StepDescription
> {
  const step =
    (key: string) =>
    (e: TraceEvent): StepDescription => ({
      key: `animation.${key}`,
      params: {
        node: lv(e).node,
        pivot: lv(e).pivot,
        t2: lv(e).t2,
        height: lv(e).height,
      },
    });
  return {
    [TAGS.ROT_RIGHT_PIVOT]: step("rot_right_pivot"),
    [TAGS.ROT_RIGHT_MOVE]: (e) =>
      step(lv(e).t2 === null ? "rot_right_move_empty" : "rot_right_move")(e),
    [TAGS.ROT_RIGHT_LINK]: step("rot_right_link"),
    [TAGS.ROT_RIGHT_HEIGHT_NODE]: step("rot_right_height_node"),
    [TAGS.ROT_RIGHT_HEIGHT_PIVOT]: step("rot_right_height_pivot"),
    [TAGS.ROT_RIGHT_RETURN]: step("rot_right_return"),
    [TAGS.ROT_LEFT_PIVOT]: step("rot_left_pivot"),
    [TAGS.ROT_LEFT_MOVE]: (e) =>
      step(lv(e).t2 === null ? "rot_left_move_empty" : "rot_left_move")(e),
    [TAGS.ROT_LEFT_LINK]: step("rot_left_link"),
    [TAGS.ROT_LEFT_HEIGHT_NODE]: step("rot_left_height_node"),
    [TAGS.ROT_LEFT_HEIGHT_PIVOT]: step("rot_left_height_pivot"),
    [TAGS.ROT_LEFT_RETURN]: step("rot_left_return"),
  };
}

const formatLabel = (h: number, bf: number, count: number) =>
  `h${h} · BF ${bf > 0 ? "+" : ""}${bf}${count > 1 ? ` · ×${count}` : ""}`;

function labelsById(root: LogicTreeNode | null) {
  const map: Record<string, string> = {};
  const walk = (node: LogicTreeNode | undefined) => {
    if (!node) return;
    map[node.id] = formatLabel(
      height(node),
      balanceFactor(node),
      node.count,
    );
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
    const labels = meta.rotation ? meta.rotation.labels : labelsById(root);

    const treeElements = createTreeNodes(uniqueData, AVL_LAYOUT);
    treeElements.forEach((el) => {
      if (el instanceof Node) {
        el.setStatus(statusMap[el.id] || AVLStatus.Inactive);
        if (el.value !== "") el.value = String(Math.round(Number(el.value)));
        el.description = labels[el.id] ?? "";
      }
    });

    if (meta.rotation) {
      const byId = new Map(
        treeElements.filter((el): el is Node => el instanceof Node).map((el) => [el.id, el]),
      );
      byId.forEach((el) => {
        el.pointers = [];
      });
      meta.rotation.edges.forEach(([from, to]) => {
        const source = byId.get(from);
        const target = byId.get(to);
        if (source && target) source.addPointer(target);
      });
    }

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
