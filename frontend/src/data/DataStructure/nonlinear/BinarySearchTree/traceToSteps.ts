import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Node } from "@/modules/core/DataLogic/Node";
import { createTreeNodes, buildLinksFromNodes } from "../utils";
import { buildBST, flattenUniqueNodes } from "./simulateTrace";
import { TAGS, BSTStatus } from "./tags";
import { linkStatus } from "@/modules/core/Render/D3Renderer";

const BST_LAYOUT = {
  degree: 2,
  width: 1000,
  height: 300,
  offsetX: 0,
  offsetY: 50,
  type: "bst" as const,
};

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INS_INIT_EMPTY]: (e) => ({
    key: "animation.ins_init_empty",
    params: { val: e.local_vars.newValue },
  }),
  [TAGS.INS_INIT]: (e) => ({
    key: "animation.ins_init",
    params: { val: e.local_vars.newValue },
  }),
  [TAGS.INS_COMPARE]: (e) => ({
    key: "animation.ins_compare",
    params: { val: e.local_vars.newValue, curr: e.local_vars.curr },
  }),
  [TAGS.INS_EQUAL]: (e) => ({
    key: "animation.ins_equal",
    params: { val: e.local_vars.newValue },
  }),
  [TAGS.INS_LEFT]: (e) => ({
    key: "animation.ins_left",
    params: { val: e.local_vars.newValue, curr: e.local_vars.curr },
  }),
  [TAGS.INS_RIGHT]: (e) => ({
    key: "animation.ins_right",
    params: { val: e.local_vars.newValue, curr: e.local_vars.curr },
  }),
  [TAGS.INS_PLACE_LEFT]: (e) => ({
    key: "animation.ins_place_left",
    params: { val: e.local_vars.newValue, curr: e.local_vars.curr },
  }),
  [TAGS.INS_PLACE_RIGHT]: (e) => ({
    key: "animation.ins_place_right",
    params: { val: e.local_vars.newValue, curr: e.local_vars.curr },
  }),
  [TAGS.INS_DONE_LEFT]: (e) => ({
    key: "animation.ins_done",
    params: { val: e.local_vars.newValue },
  }),
  [TAGS.INS_DONE_RIGHT]: (e) => ({
    key: "animation.ins_done",
    params: { val: e.local_vars.newValue },
  }),

  [TAGS.SRCH_INIT]: (e) => ({
    key: "animation.srch_init",
    params: { target: e.local_vars.target },
  }),
  [TAGS.SRCH_EMPTY]: () => ({ key: "animation.srch_empty" }),
  [TAGS.SRCH_COMPARE]: (e) => ({
    key: "animation.srch_compare",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.SRCH_FOUND]: (e) => ({
    key: "animation.srch_found",
    params: { target: e.local_vars.target },
  }),
  [TAGS.SRCH_LEFT]: (e) => ({
    key: "animation.srch_left",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.SRCH_RIGHT]: (e) => ({
    key: "animation.srch_right",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.SRCH_NOT_FOUND]: () => ({ key: "animation.srch_not_found" }),

  [TAGS.DEL_INIT]: (e) => ({
    key: "animation.del_init",
    params: { target: e.local_vars.target },
  }),
  [TAGS.DEL_EMPTY]: () => ({ key: "animation.del_empty" }),
  [TAGS.DEL_SEARCH]: (e) => ({
    key: "animation.del_search",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.DEL_FOUND]: (e) => ({
    key: "animation.del_found",
    params: { target: e.local_vars.target },
  }),
  [TAGS.DEL_LEFT]: (e) => ({
    key: "animation.del_left",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.DEL_RIGHT]: (e) => ({
    key: "animation.del_right",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.DEL_NOT_FOUND]: (e) => ({
    key: "animation.del_not_found",
    params: { target: e.local_vars.target },
  }),
  [TAGS.DEL_COUNT_DEC]: (e) => ({
    key: "animation.del_count_dec",
    params: { count: e.local_vars.count },
  }),
  [TAGS.DEL_LEAF]: () => ({ key: "animation.del_leaf" }),
  [TAGS.DEL_LEAF_REMOVE]: () => ({ key: "animation.del_leaf_remove" }),
  [TAGS.DEL_ONE_CHILD_REPLACE]: (e) => ({
    key: "animation.del_one_child_replace",
    params: { val: e.local_vars.foundNode },
  }),
  [TAGS.DEL_ONE_CHILD_DONE]: () => ({ key: "animation.del_one_child_done" }),
  [TAGS.DEL_TWO_CHILD]: () => ({ key: "animation.del_two_child" }),
  [TAGS.DEL_SUCCESSOR_FIND]: (e) => ({
    key: "animation.del_successor_find",
    params: { val: e.local_vars.successor },
  }),
  [TAGS.DEL_SUCCESSOR_REPLACE]: (e) => ({
    key: "animation.del_successor_replace",
    params: { target: e.local_vars.target, val: e.local_vars.successor },
  }),
  [TAGS.DEL_SUCCESSOR_REMOVE]: (e) => ({
    key: "animation.del_successor_remove",
    params: { val: e.local_vars.successor },
  }),

  [TAGS.MIN_INIT]: () => ({ key: "animation.min_init" }),
  [TAGS.MIN_TRAVERSE]: (e) => ({
    key: "animation.min_traverse",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.MIN_FOUND]: (e) => ({
    key: "animation.min_found",
    params: { curr: e.local_vars.curr },
  }),

  [TAGS.MAX_INIT]: () => ({ key: "animation.max_init" }),
  [TAGS.MAX_TRAVERSE]: (e) => ({
    key: "animation.max_traverse",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.MAX_FOUND]: (e) => ({
    key: "animation.max_found",
    params: { curr: e.local_vars.curr },
  }),

  [TAGS.FLOOR_INIT]: (e) => ({
    key: "animation.floor_init",
    params: { target: e.local_vars.target },
  }),
  [TAGS.FLOOR_COMPARE]: (e) => ({
    key: "animation.floor_compare",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.FLOOR_EQUAL]: (e) => ({
    key: "animation.floor_equal",
    params: { val: e.local_vars.curr },
  }),
  [TAGS.FLOOR_LEFT]: (e) => ({
    key: "animation.floor_left",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.FLOOR_RIGHT]: (e) => ({
    key: "animation.floor_right",
    params: {
      target: e.local_vars.target,
      curr: e.local_vars.curr,
      floor: e.local_vars.floor,
    },
  }),
  [TAGS.FLOOR_FOUND]: (e) => ({
    key: "animation.floor_found",
    params: { floor: e.local_vars.floor },
  }),
  [TAGS.FLOOR_NOT_FOUND]: (e) => ({
    key: "animation.floor_not_found",
    params: { target: e.local_vars.target },
  }),

  [TAGS.CEIL_INIT]: (e) => ({
    key: "animation.ceil_init",
    params: { target: e.local_vars.target },
  }),
  [TAGS.CEIL_COMPARE]: (e) => ({
    key: "animation.ceil_compare",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.CEIL_EQUAL]: (e) => ({
    key: "animation.ceil_equal",
    params: { val: e.local_vars.curr },
  }),
  [TAGS.CEIL_LEFT]: (e) => ({
    key: "animation.ceil_left",
    params: {
      target: e.local_vars.target,
      curr: e.local_vars.curr,
      ceil: e.local_vars.ceil,
    },
  }),
  [TAGS.CEIL_RIGHT]: (e) => ({
    key: "animation.ceil_right",
    params: { target: e.local_vars.target, curr: e.local_vars.curr },
  }),
  [TAGS.CEIL_FOUND]: (e) => ({
    key: "animation.ceil_found",
    params: { ceil: e.local_vars.ceil },
  }),
  [TAGS.CEIL_NOT_FOUND]: (e) => ({
    key: "animation.ceil_not_found",
    params: { target: e.local_vars.target },
  }),

  [TAGS.LOAD_DONE]: (e) => ({
    key: "animation.load_done",
    params: { count: e.local_vars.nodeCount },
  }),
};

export function bstTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta || {};
    const inputData: any[] = meta.inputData || [];
    const statusMap: Record<string, string> = meta.statusMap || {};
    const linkStatusMap: Record<string, linkStatus> = meta.linkStatusMap || {};

    const root = buildBST(inputData);
    const uniqueData: any[] = [];
    flattenUniqueNodes(root || undefined, uniqueData);

    const treeElements = createTreeNodes(uniqueData, BST_LAYOUT);

    treeElements.forEach((el) => {
      if (el instanceof Node) {
        el.setStatus(statusMap[el.id] || BSTStatus.Inactive);
        if (el.value !== "") el.value = String(Math.round(Number(el.value)));
      }
    });

    treeElements.sort((a, b) => {
      const isNodeA = a instanceof Node;
      const isNodeB = b instanceof Node;
      if (isNodeA && !isNodeB) return 1;
      if (!isNodeA && isNodeB) return -1;
      return a.id.localeCompare(b.id);
    });

    const links = buildLinksFromNodes(treeElements, linkStatusMap);

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: [...treeElements] as any,
      links,
    };
  });
}
