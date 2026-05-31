import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { BaseElement, Status } from "@/modules/core/DataLogic/BaseElement";
import {
  generateGridFrame,
  generateGraphFrame,
} from "@/data/DataStructure/nonlinear/utils";
import { TAGS, DFSStatus } from "./tags";

function appendStackAndResultBoxes(
  elements: BaseElement[],
  stack: string[],
  result: string[],
  poppingNodeId?: string,
  pushingNodeIds?: string[],
) {
  stack.forEach((id, index) => {
    const box = new Box();
    box.id = `ui-box-${id}`;
    box.value = id.replace("node-", "");
    const baseX = 850;
    const baseY = 60 + index * 35; // 由上往下排

    if (pushingNodeIds?.includes(id)) {
      box.moveTo(baseX, 420); // 從底部升起
      box.setStatus(DFSStatus.Discovered as Status);
    } else {
      box.moveTo(baseX, baseY);
      box.setStatus(DFSStatus.Discovered as Status);
    }

    box.width = 120;
    box.height = 30;
    elements.push(box);
  });

  if (poppingNodeId) {
    const dropBox = new Box();
    dropBox.id = `ui-box-${poppingNodeId}`;
    dropBox.value = poppingNodeId.replace("node-", "");
    dropBox.moveTo(850, 420); // 掉落到底部
    dropBox.width = 120;
    dropBox.height = 30;
    dropBox.setStatus(DFSStatus.Current as Status);
    elements.push(dropBox);
  }

  const resStartX = 50;
  const resY = 420;
  result.forEach((id, i) => {
    const box = new Box();
    box.id = `ui-box-${id}`;
    box.value = id.replace("node-", "");
    box.moveTo(resStartX + i * 45, resY);
    box.width = 40;
    box.height = 40;
    box.setStatus(DFSStatus.Visited as Status);
    elements.push(box);
  });
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: e.meta?.showIdAsValue ? "animation.init_id" : "animation.init_dist",
    params: { start: e.local_vars.start, end: e.local_vars.end },
  }),
  [TAGS.START]: (e) => ({
    key: e.meta?.pushingNodeIds
      ? "animation.start_push"
      : "animation.start_settle",
    params: { start: e.local_vars.start },
  }),
  [TAGS.POP]: (e) => ({
    key: "animation.pop",
    params: { curr: e.local_vars.curr, dist: e.local_vars.dist },
  }),
  [TAGS.SKIP]: (e) => ({
    key: "animation.skip",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.DIST_UPDATE]: (e) => ({
    key: "animation.dist_update",
    params: { curr: e.local_vars.curr, dist: e.local_vars.dist },
  }),
  [TAGS.CHECK_END]: (e) => ({
    key:
      e.local_vars["curr === end"] === "True"
        ? "animation.check_end_true"
        : "animation.check_end_false",
    params: { curr: e.local_vars.curr },
  }),
  [TAGS.EXPLORE]: (e) => ({
    key:
      e.local_vars.unvisitedCount > 0
        ? "animation.explore_some"
        : "animation.explore_none",
    params: { curr: e.local_vars.curr, count: e.local_vars.unvisitedCount },
  }),
  [TAGS.PUSH_NEIGHBOR]: (e) => ({
    key: e.meta?.pushingNodeIds
      ? "animation.push_neighbor"
      : "animation.push_settle",
    params: { neighbor: e.local_vars.neighbor },
  }),
  [TAGS.BACKTRACK]: () => ({ key: "animation.backtrack" }),
  [TAGS.PATH_FOUND]: (e) => ({
    key: "animation.path_found",
    params: { dist: e.meta?.pathLength ?? e.local_vars["path depth"] },
  }),
  [TAGS.NOT_FOUND]: () => ({ key: "animation.not_found" }),
  [TAGS.GRID_BLOCKED]: () => ({ key: "animation.grid_blocked" }),
};

export function dfsTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    let frame;

    const descObj = DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag };

    if (meta.viewMode === "graph") {
      frame = generateGraphFrame(
        meta.baseElements,
        meta.statusMap || {},
        meta.distanceMap || {},
        descObj.key,
        false,
        meta.linkStatusMap,
      );
    } else {
      frame = generateGridFrame(
        event.dataSnapshot as any[],
        meta.cols,
        meta.statusMap || {},
        meta.distanceMap || {},
        descObj.key,
        meta.showIdAsValue,
      );
    }

    appendStackAndResultBoxes(
      frame.elements,
      meta.stack,
      meta.result,
      meta.poppingNodeId,
      meta.pushingNodeIds,
    );

    return {
      stepNumber: idx + 1,
      description: descObj,
      actionTag: event.tag,
      variables: event.local_vars,
      elements: frame.elements,
      links: frame.links,
    };
  });
}
