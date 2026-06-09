import type { ExecutionTrace, TraceEvent } from "@/types/trace";
import type { AnimationStep, StepDescription } from "@/types";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Box } from "@/modules/core/DataLogic/Box";
import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { TAGS } from "./tags";
import {
  LinearData as BoxData,
  LinearAction as ActionType,
  createBoxes as baseCreateBoxes,
} from "../utils";

const createBoxes = (list: BoxData[], status: Status = Status.Unfinished) => {
  return baseCreateBoxes(list, {
    startX: 100,
    startY: 200,
    gap: 70,
    status,
    getDescription: (_, i) => String(i),
  });
};

const createTopPointer = (
  index: number,
  startX: number,
  startY: number,
  gap: number,
) => {
  const ptr = new Pointer("Top");
  ptr.moveTo(startX + index * gap, startY + 50);
  return ptr;
};

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.PUSH_START]: (e) => ({
    key: "animation.push_start",
    params: { value: e.local_vars.value },
  }),
  [TAGS.PUSH_INC_TOP]: (e) => ({
    key: "animation.push_inc_top",
    params: { top: e.local_vars.top },
  }),
  [TAGS.PUSH_ASSIGN]: (e) => ({
    key: "animation.push_assign",
    params: { top: e.local_vars.top, value: e.local_vars.value },
  }),
  [TAGS.PUSH_COMPLETE]: () => ({ key: "animation.push_complete" }),
  [TAGS.POP_CHECK_EMPTY]: () => ({ key: "animation.pop_check_empty" }),
  [TAGS.POP_ERROR]: () => ({ key: "animation.pop_error" }),
  [TAGS.POP_GET_VALUE]: (e) => ({
    key: "animation.pop_get_value",
    params: { top: e.local_vars.top, val: e.local_vars.removed_value },
  }),
  [TAGS.POP_DEC_TOP]: (e) => ({
    key: "animation.pop_dec_top",
    params: { top: e.local_vars.top },
  }),
  [TAGS.POP_RETURN]: (e) => ({
    key: "animation.pop_return",
    params: { val: e.local_vars.removed_value },
  }),
  [TAGS.POP_COMPLETE]: () => ({ key: "animation.pop_complete" }),
  [TAGS.PEEK_CHECK_EMPTY]: () => ({ key: "animation.peek_check_empty" }),
  [TAGS.PEEK_ERROR]: () => ({ key: "animation.peek_error" }),
  [TAGS.PEEK_RETURN]: (e) => ({
    key: "animation.peek_return",
    params: { top: e.local_vars.top, val: e.local_vars.value },
  }),
  [TAGS.PEEK_COMPLETE]: () => ({ key: "animation.peek_complete" }),
};

export function stackTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
  const startX = 100;
  const startY = 200;
  const gap = 70;

  return trace.map((event, idx) => {
    const meta = event.meta || {};
    const dataList: BoxData[] = meta.dataList || [];
    const action: ActionType | undefined = meta.action;
    let elements: (Box | Pointer)[] = [];

    const createBox = (
      id: string,
      val: any,
      x: number,
      status: Status,
      desc: string,
      opts?: { dashed?: boolean; appearAnim?: "grow" | "instant" },
    ) => {
      const b = new Box();
      b.id = id;
      b.value = val !== undefined && val !== null ? String(val) : "";
      b.width = 60;
      b.height = 60;
      b.moveTo(x, startY);
      b.setStatus(status);
      b.description = desc;
      if (opts?.dashed) b.borderStyle = "dashed";
      if (opts?.appearAnim) b.appearAnim = opts.appearAnim;
      return b;
    };

    if (event.tag === TAGS.INIT) {
      elements = [
        ...createBoxes(dataList),
        createTopPointer(dataList.length - 1, startX, startY, gap),
      ];
    } else if (action?.type === "add") {
      const oldList = dataList.slice(0, -1);
      const newNode = dataList[dataList.length - 1];
      const top = oldList.length - 1;

      if (event.tag === TAGS.PUSH_START) {
        const newBox = createBox(
          newNode.id,
          newNode.value,
          950,
          Status.Prepare,
          "New",
        );
        elements = [
          ...createBoxes(oldList),
          newBox,
          createTopPointer(top, startX, startY, gap),
        ];
      } else if (event.tag === TAGS.PUSH_INC_TOP) {
        const emptyBox = createBox(
          "empty-slot",
          "",
          startX + (top + 1) * gap,
          Status.Inactive,
          String(top + 1),
          { dashed: true },
        );
        const newBox = createBox(
          newNode.id,
          newNode.value,
          950,
          Status.Prepare,
          "New",
        );
        elements = [
          ...createBoxes(oldList),
          emptyBox,
          newBox,
          createTopPointer(top + 1, startX, startY, gap),
        ];
      } else if (event.tag === TAGS.PUSH_ASSIGN) {
        const newBox = createBox(
          newNode.id,
          newNode.value,
          startX + (top + 1) * gap,
          Status.Target,
          String(top + 1),
        );
        elements = [
          ...createBoxes(oldList),
          newBox,
          createTopPointer(top + 1, startX, startY, gap),
        ];
      } else if (event.tag === TAGS.PUSH_COMPLETE) {
        elements = [
          ...createBoxes(dataList, Status.Complete),
          createTopPointer(top + 1, startX, startY, gap),
        ];
      }
    } else if (action?.type === "delete") {
      if (action.value === undefined) {
        elements = [createTopPointer(-1, startX, startY, gap)];
      } else {
        const deletedNode = {
          id: (action as any).targetId || "deleted-temp",
          value: action.value,
        };
        const oldTop = dataList.length;
        const currentTop = dataList.length - 1;

        if (event.tag === TAGS.POP_CHECK_EMPTY) {
          const fullList = [...dataList, deletedNode];
          elements = [
            ...createBoxes(fullList),
            createTopPointer(oldTop, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.POP_GET_VALUE) {
          const movingBox = createBox(
            deletedNode.id,
            deletedNode.value,
            950,
            Status.Prepare,
            "removed_value",
          );
          const ghostBox = createBox(
            `${deletedNode.id}-ghost`,
            deletedNode.value,
            startX + oldTop * gap,
            Status.Unfinished,
            String(oldTop),
            { appearAnim: "instant" },
          );
          elements = [
            ...createBoxes(dataList),
            ghostBox,
            movingBox,
            createTopPointer(oldTop, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.POP_DEC_TOP) {
          const movingBox = createBox(
            deletedNode.id,
            deletedNode.value,
            950,
            Status.Unfinished,
            "removed_value",
          );
          const ghostBox = createBox(
            `${deletedNode.id}-ghost`,
            deletedNode.value,
            startX + oldTop * gap,
            Status.Inactive,
            String(oldTop),
            { dashed: true, appearAnim: "instant" },
          );
          elements = [
            ...createBoxes(dataList),
            ghostBox,
            movingBox,
            createTopPointer(currentTop, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.POP_RETURN) {
          const returnBox = createBox(
            deletedNode.id,
            deletedNode.value,
            950,
            Status.Target,
            "removed_value",
          );
          const ghostBox = createBox(
            `${deletedNode.id}-ghost`,
            deletedNode.value,
            startX + oldTop * gap,
            Status.Inactive,
            String(oldTop),
            { dashed: true },
          );
          elements = [
            ...createBoxes(dataList),
            createTopPointer(currentTop, startX, startY, gap),
            returnBox,
            ghostBox,
          ];
        } else if (event.tag === TAGS.POP_COMPLETE) {
          elements = [
            ...createBoxes(dataList, Status.Complete),
            createTopPointer(currentTop, startX, startY, gap),
          ];
        }
      }
    } else if (action?.type === "peek") {
      const currentTop = dataList.length - 1;
      if (dataList.length === 0) {
        elements = [createTopPointer(-1, startX, startY, gap)];
      } else {
        if (event.tag === TAGS.PEEK_CHECK_EMPTY) {
          elements = [
            ...createBoxes(dataList),
            createTopPointer(currentTop, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.PEEK_RETURN) {
          const boxes = createBoxes(dataList);
          boxes[currentTop].setStatus(Status.Target);
          elements = [
            ...boxes,
            createTopPointer(currentTop, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.PEEK_COMPLETE) {
          const boxes = createBoxes(dataList, Status.Unfinished);
          boxes[currentTop].setStatus(Status.Complete);
          elements = [
            ...boxes,
            createTopPointer(currentTop, startX, startY, gap),
          ];
        }
      }
    }

    return {
      stepNumber: idx + 1,
      description: DESCRIPTION_MAP[event.tag]?.(event) ?? { key: event.tag },
      actionTag: event.tag,
      variables: event.local_vars,
      elements: elements as any,
    };
  });
}
