import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Box } from "@/modules/core/DataLogic/Box";
import { BaseElement, Status } from "@/modules/core/DataLogic/BaseElement";
import {
  generateGridFrame,
  generateGraphFrame,
} from "@/data/DataStructure/nonlinear/utils";
import { TAGS, BFSStatus } from "./tags";

function appendQueueAndResultBoxes(
  elements: BaseElement[],
  queue: string[],
  result: string[],
  poppingNodeId?: string,
  pushingNodeId?: string,
) {
  queue.forEach((id, index) => {
    const box = new Box();
    box.id = `ui-box-${id}`;
    box.value = id.replace("node-", "");
    const baseX = 850;
    const baseY = 355 - index * 35;
    if (id === pushingNodeId) {
      box.moveTo(baseX, 50);
    } else {
      box.moveTo(baseX, baseY);
    }
    box.setStatus(BFSStatus.Discovered as Status); // 佇列中的元素皆為 Discovered
    box.width = 120;
    box.height = 30;
    elements.push(box);
  });

  if (poppingNodeId) {
    const dropBox = new Box();
    dropBox.id = `ui-box-${poppingNodeId}`;
    dropBox.value = poppingNodeId.replace("node-", "");
    dropBox.moveTo(850, 420);
    dropBox.width = 120;
    dropBox.height = 30;
    dropBox.setStatus(BFSStatus.Current as Status); // 當前被取出的元素標為 Current
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
    box.setStatus(BFSStatus.Visited as Status); // 被移到結果區的元素標為 Visited
    elements.push(box);
  });
}

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.GRAPH_INIT]: () => ({ key: "animation.graph_init" }),
  [TAGS.GRAPH_START]: (e) => ({
    key: "animation.graph_start",
    params: { start: e.local_vars.start },
  }),
  [TAGS.GRID_BLOCKED]: () => ({ key: "animation.grid_blocked" }),
  [TAGS.GRID_INIT]: (e) => ({
    key: "animation.grid_init",
    params: { start: e.local_vars.start, end: e.local_vars.end },
  }),
  [TAGS.GRID_INIT_DIST]: () => ({ key: "animation.grid_init_dist" }),
  [TAGS.GRID_START]: (e) => ({
    key: "animation.grid_start",
    params: { start: e.local_vars.start },
  }),
  [TAGS.DEQUEUE]: (e) => ({
    key: "animation.dequeue",
    params: {
      curr: e.local_vars.curr,
      dist: e.local_vars.dist,
    },
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
  [TAGS.VISIT_NEIGHBOR]: (e) => ({
    key: "animation.visit_neighbor",
    params: { neighbor: e.local_vars.neighbor },
  }),
  [TAGS.CHANGE_VISITED_VALUE]: (e) => ({
    key: "animation.change_visited",
    params: {
      neighbor: e.local_vars.neighbor,
      dist: e.local_vars["distance[new]"],
    },
  }),
  [TAGS.PATH_FOUND]: (e) => ({
    key: "animation.path_found",
    params: { dist: e.meta?.pathLength ?? e.local_vars["shortest distance"] },
  }),
  [TAGS.NOT_FOUND]: () => ({ key: "animation.not_found" }),
};

export function bfsTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    let frame;

    const descObj = DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag };
    const descText = descObj.key;

    if (meta.viewMode === "graph") {
      frame = generateGraphFrame(
        meta.baseElements,
        meta.statusMap,
        meta.distanceMap,
        descText,
        false,
        meta.linkStatusMap,
      );
    } else {
      frame = generateGridFrame(
        event.dataSnapshot as any[],
        meta.cols,
        meta.statusMap,
        meta.distanceMap,
        descText,
        meta.showIdAsValue ?? false,
      );
    }

    appendQueueAndResultBoxes(
      frame.elements,
      meta.queue,
      meta.result,
      meta.poppingNodeId,
      meta.pushingNodeId,
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
