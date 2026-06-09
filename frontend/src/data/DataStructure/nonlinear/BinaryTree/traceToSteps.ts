import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";
import { createTreeNodes, buildLinksFromNodes } from "../utils";
import { TAGS, BTStatus } from "./tags";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import { LogicTreeNode } from "./simulateTrace";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT_DONE]: (e) => ({
    key: "animation.init_done",
    params: { count: e.local_vars.count },
  }),

  [TAGS.PRE_INIT]: () => ({ key: "animation.pre_init" }),
  [TAGS.PRE_NULL]: () => ({ key: "animation.pre_null" }),
  [TAGS.PRE_VISIT]: (e) => ({
    key: "animation.pre_visit",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.PRE_LEFT_ENTER]: (e) => ({
    key: "animation.pre_left_enter",
    params: { child: e.local_vars.child },
  }),
  [TAGS.PRE_LEFT_RETURN]: (e) => ({
    key: "animation.pre_left_return",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.PRE_RIGHT_ENTER]: (e) => ({
    key: "animation.pre_right_enter",
    params: { child: e.local_vars.child },
  }),
  [TAGS.PRE_RIGHT_RETURN]: (e) => ({
    key: "animation.pre_right_return",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.PRE_DONE]: () => ({ key: "animation.pre_done" }),

  [TAGS.IN_INIT]: () => ({ key: "animation.in_init" }),
  [TAGS.IN_NULL]: () => ({ key: "animation.in_null" }),
  [TAGS.IN_LEFT_ENTER]: (e) => ({
    key: "animation.in_left_enter",
    params: { child: e.local_vars.child },
  }),
  [TAGS.IN_LEFT_RETURN]: (e) => ({
    key: "animation.in_left_return",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.IN_VISIT]: (e) => ({
    key: "animation.in_visit",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.IN_RIGHT_ENTER]: (e) => ({
    key: "animation.in_right_enter",
    params: { child: e.local_vars.child },
  }),
  [TAGS.IN_RIGHT_RETURN]: (e) => ({
    key: "animation.in_right_return",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.IN_DONE]: () => ({ key: "animation.in_done" }),

  [TAGS.POST_INIT]: () => ({ key: "animation.post_init" }),
  [TAGS.POST_NULL]: () => ({ key: "animation.post_null" }),
  [TAGS.POST_LEFT_ENTER]: (e) => ({
    key: "animation.post_left_enter",
    params: { child: e.local_vars.child },
  }),
  [TAGS.POST_LEFT_RETURN]: (e) => ({
    key: "animation.post_left_return",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.POST_RIGHT_ENTER]: (e) => ({
    key: "animation.post_right_enter",
    params: { child: e.local_vars.child },
  }),
  [TAGS.POST_RIGHT_RETURN]: (e) => ({
    key: "animation.post_right_return",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.POST_VISIT]: (e) => ({
    key: "animation.post_visit",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.POST_DONE]: () => ({ key: "animation.post_done" }),

  [TAGS.BFS_INIT]: () => ({ key: "animation.bfs_init" }),
  [TAGS.BFS_WHILE]: () => ({ key: "animation.bfs_while" }),
  [TAGS.BFS_DEQUEUE]: (e) => ({
    key: "animation.bfs_dequeue",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.BFS_VISIT]: (e) => ({
    key: "animation.bfs_visit",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.BFS_ENQUEUE_LEFT]: (e) => ({
    key: "animation.bfs_enqueue_left",
    params: { child: e.local_vars.child },
  }),
  [TAGS.BFS_SKIP_LEFT]: () => ({ key: "animation.bfs_skip_left" }),
  [TAGS.BFS_ENQUEUE_RIGHT]: (e) => ({
    key: "animation.bfs_enqueue_right",
    params: { child: e.local_vars.child },
  }),
  [TAGS.BFS_SKIP_RIGHT]: () => ({ key: "animation.bfs_skip_right" }),
  [TAGS.BFS_DONE]: () => ({ key: "animation.bfs_done" }),
};

export function binaryTreeTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta || {};
    const inputData: any[] = meta.inputData || [];

    if (event.tag === TAGS.INIT_DONE) {
      const treeElements = createTreeNodes(inputData, {
        degree: 2,
        width: 700,
        height: 300,
        offsetX: 0,
        offsetY: 50,
      });

      const initLinks = buildLinksFromNodes(treeElements, {});

      return {
        stepNumber: idx + 1,
        description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
        actionTag: event.tag,
        variables: event.local_vars,
        elements: treeElements as any,
        links: initLinks,
      };
    }

    const statusMap: Record<string, string> = meta.statusMap || {};
    const linkStatusMap: Record<string, linkStatus> = meta.linkStatusMap || {};
    const linearList: LogicTreeNode[] = meta.linearList || [];
    const animationState: "idle" | "pushing" | "popping" =
      meta.animationState || "idle";
    const containerType: "stack" | "queue" = meta.containerType || "stack";

    const treeElements = createTreeNodes(inputData, {
      degree: 2,
      width: 700,
      height: 300,
      offsetX: 0,
      offsetY: 50,
    });

    treeElements.forEach((el) => {
      if (el instanceof Node) {
        el.setStatus(statusMap[el.id] || BTStatus.Inactive);
      }
    });

    const links = buildLinksFromNodes(treeElements, linkStatusMap);

    const listElements = linearList.map((node, index) => {
      const box = new Box();
      box.id = `${containerType}-${node.id}`;
      box.value = String(node.value);
      const baseX = 850;
      const baseY = 355 - index * 35;

      let isActiveItem = false;
      if (containerType === "stack") {
        isActiveItem = index === linearList.length - 1;
      } else {
        if (animationState === "pushing")
          isActiveItem = index === linearList.length - 1;
        else if (animationState === "popping") isActiveItem = index === 0;
      }

      if (isActiveItem) {
        if (animationState === "pushing") {
          box.moveTo(baseX, 50);
          box.setStatus(BTStatus.Prepare);
        } else if (animationState === "popping") {
          if (containerType === "stack") box.moveTo(baseX, -50);
          else box.moveTo(baseX, 420);
          box.setStatus(BTStatus.Complete);
        } else {
          box.moveTo(baseX, baseY);
          box.setStatus(BTStatus.Target);
        }
      } else {
        box.moveTo(baseX, baseY);
        box.setStatus(BTStatus.Visited as Status);
      }

      box.width = 120;
      box.height = 30;
      return box;
    });

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: [...treeElements, ...listElements] as any,
      links,
    };
  });
}
