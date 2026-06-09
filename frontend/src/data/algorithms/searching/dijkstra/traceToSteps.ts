import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { generateGraphFrame } from "@/data/DataStructure/nonlinear/utils";
import { TAGS } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: (e) => ({
    key: "animation.init",
    params: { start: e.local_vars.start },
  }),
  [TAGS.EXTRACT_MIN]: (e) => ({
    key: "animation.extract_min",
    params: { u: e.local_vars.u, distU: e.local_vars.distU },
  }),
  [TAGS.CHECK_NEIGHBORS]: (e) => ({
    key: "animation.check_neighbors",
    params: { v: e.local_vars.v, weight: e.local_vars.weight },
  }),
  [TAGS.RELAX_EDGE_TRUE]: (e) => ({
    key: "animation.relax_edge_true",
    params: { u: e.local_vars.u, v: e.local_vars.v, alt: e.local_vars.alt },
  }),
  [TAGS.RELAX_EDGE_FALSE]: (e) => ({
    key: "animation.relax_edge_false",
    params: { alt: e.local_vars.alt },
  }),
  [TAGS.WHILE_QUEUE_NOT_EMPTY]: (e) => ({
    key: "animation.node_settled",
    params: { u: e.local_vars.u },
  }),
  [TAGS.DONE]: (e) => {
    if (e.meta?.earlyExit)
      return {
        key: "animation.done_early",
        params: { u: e.local_vars.u, distU: e.local_vars.distU },
      };
    if (e.local_vars.unreachable)
      return {
        key: "animation.done_unreachable",
        params: { end: e.local_vars.endNodeId },
      };
    if (e.local_vars.allReachable) return { key: "animation.done_all" };
    return {
      key: "animation.done_path",
      params: { path: e.local_vars.path, dist: e.local_vars.totalDist },
    };
  },
};

export function dijkstraTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const rawDist = meta.dist || {};

    const distString = Object.entries(rawDist)
      .map(
        ([nodeId, val]) =>
          `${nodeId.replace("node-", "")}: ${val === Infinity ? "∞" : val}`,
      )
      .join(", ");

    const descObj = DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag };

    const frame = generateGraphFrame(
      meta.baseElements,
      meta.statusMap || {},
      rawDist,
      descObj.key,
      false,
      meta.linkStatusMap,
      meta.weightMap,
    );

    return {
      stepNumber: idx,
      description: descObj,
      actionTag: event.tag,
      variables: {
        ...event.local_vars,
        Distances: distString,
      },
      elements: frame.elements,
      links: frame.links,
    };
  });
}
