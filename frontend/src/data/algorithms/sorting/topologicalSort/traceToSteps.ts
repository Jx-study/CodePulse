import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import { AnimationStep, StepDescription } from "@/types";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { createGraphElements } from "@/data/DataStructure/nonlinear/utils";
import { linkStatus } from "@/modules/core/Render/D3Renderer";
import { TAGS, TopoStatus } from "./tags";

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.ENQUEUE_ZERO]: () => ({ key: "animation.enqueue_zero" }),
  [TAGS.WHILE_LOOP]: () => ({ key: "animation.while_loop" }),
  [TAGS.DEQUEUE]: (e) => ({
    key: "animation.dequeue",
    params: { curr: e.local_vars.currId.replace("node-", "") },
  }),
  [TAGS.ADD_TO_RESULT]: (e) => ({
    key: "animation.add_to_result",
    params: { curr: e.local_vars.currId.replace("node-", "") },
  }),
  [TAGS.REDUCE_NEIGHBOR]: (e) => ({
    key: "animation.reduce_neighbor",
    params: {
      curr: e.local_vars.currId.replace("node-", ""),
      neighbor: e.local_vars.neighborId.replace("node-", ""),
    },
  }),
  [TAGS.CHECK_ZERO_TRUE]: (e) => ({
    key: "animation.check_zero_true",
    params: { neighbor: e.local_vars.neighborId.replace("node-", "") },
  }),
  [TAGS.CHECK_ZERO_FALSE]: (e) => ({
    key: "animation.check_zero_false",
    params: {
      neighbor: e.local_vars.neighborId.replace("node-", ""),
      deg: e.local_vars.deg,
    },
  }),
  [TAGS.CYCLE_CHECK_START]: () => ({ key: "animation.cycle_check_start" }),
  [TAGS.CYCLE_DETECTED]: (e) => ({
    key: "animation.cycle_detected",
    params: { resLen: e.local_vars.resLen, nodeLen: e.local_vars.nodeLen },
  }),
  [TAGS.CYCLE_DEADLOCK]: () => ({ key: "animation.cycle_deadlock" }),
  [TAGS.SUCCESS_VERIFY]: (e) => ({
    key: "animation.success_verify",
    params: { resLen: e.local_vars.resLen, nodeLen: e.local_vars.nodeLen },
  }),
  [TAGS.DONE]: () => ({ key: "animation.done" }),
};

export function topologicalSortTraceToSteps(
  trace: ExecutionTrace,
  graph: any,
): AnimationStep[] {
  const layoutNodes = createGraphElements(graph, true, {
    width: 700,
    height: 300,
    offsetX: 0,
    offsetY: 50,
  });
  const layoutMap = new Map(layoutNodes.map((n) => [n.id, n.position]));

  return trace.map((event, idx) => {
    const meta = event.meta ?? {};
    const nodes = event.dataSnapshot as any[];
    const remainingEdges = (meta.remainingEdges as string[][]) || [];
    const inDegree = (meta.inDegree as Record<string, number>) || {};
    const nodeStatus = (meta.nodeStatus as Record<string, string>) || {};
    const edgeStatus = (meta.edgeStatus as Record<string, string>) || {};
    const queue = (meta.queue as string[]) || [];
    const result = (meta.result as string[]) || [];
    const poppingNodeId = meta.poppingNodeId;
    const pushingNodeId = meta.pushingNodeId;

    const elements: (Node | Box)[] = [];

    // 1. 還原有向圖節點
    nodes.forEach((n) => {
      const node = new Node();
      node.id = n.id;
      node.value = n.value || n.id.replace("node-", "");
      node.description = `In: ${inDegree[n.id]}`;

      const pos = layoutMap.get(n.id) || { x: n.x ?? 500, y: n.y ?? 200 };
      node.moveTo(pos.x, pos.y);
      node.setStatus((nodeStatus[n.id] as Status) || TopoStatus.Inactive);
      elements.push(node);
    });

    // 2. 還原右側 Queue 佇列
    queue.forEach((id, index) => {
      const box = new Box();
      box.id = `box-${id}`;
      box.value = id.replace("node-", "");
      const baseX = 850;
      const baseY = 355 - index * 35;

      if (id === pushingNodeId) {
        box.moveTo(baseX, 50);
        box.setStatus(Status.Prepare);
      } else {
        box.moveTo(baseX, baseY);
        box.setStatus(TopoStatus.InQueue as Status);
      }
      box.width = 120;
      box.height = 30;
      elements.push(box);
    });

    // 3. 還原彈出落下的動畫元件
    if (poppingNodeId) {
      const dropBox = new Box();
      dropBox.id = `box-${poppingNodeId}`;
      dropBox.value = poppingNodeId.replace("node-", "");
      dropBox.moveTo(850, 420);
      dropBox.width = 120;
      dropBox.height = 30;
      dropBox.setStatus(Status.Complete);
      elements.push(dropBox);
    }

    // 4. 還原底部 Result 排序序列
    const resStartX = 50,
      resY = 420;
    result.forEach((id, i) => {
      const box = new Box();
      box.id = `box-${id}`;
      box.value = id.replace("node-", "");
      box.moveTo(resStartX + i * 45, resY);
      box.width = 40;
      box.height = 40;
      box.setStatus(TopoStatus.Complete as Status);
      elements.push(box);
    });

    // 5. 還原連線邊狀態
    const stepLinks = remainingEdges.map((e) => {
      const linkStatusStr = edgeStatus[`${e[0]}->${e[1]}`];
      return {
        sourceId: e[0],
        targetId: e[1],
        status: (linkStatusStr as linkStatus) || "unfinished",
      };
    });

    // 轉換 Inspector 變數表
    const degreeVars: Record<string, number> = {};
    nodes.forEach((n) => {
      degreeVars[`Node ${n.value || n.id.replace("node-", "")}`] =
        inDegree[n.id];
    });

    return {
      stepNumber: idx,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      elements,
      links: stepLinks,
      variables: {
        Queue:
          queue.length > 0
            ? queue.map((id) => id.replace("node-", "")).join(", ")
            : "-",
        "Result Size": result.length,
        ...degreeVars,
      },
    };
  });
}
