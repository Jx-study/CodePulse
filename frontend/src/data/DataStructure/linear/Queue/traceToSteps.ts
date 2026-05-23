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

const createQueuePointers = (
  frontIndex: number,
  rearIndex: number,
  startX: number,
  startY: number,
  gap: number,
) => {
  const pointers: Pointer[] = [];
  if (frontIndex >= 0) {
    const frontPtr = new Pointer("Front");
    frontPtr.id = `front-pointer`;
    const xOffset = frontIndex === rearIndex ? -20 : 0;
    frontPtr.moveTo(startX + frontIndex * gap + xOffset, startY + 50);
    pointers.push(frontPtr);
  }
  const rearPtr = new Pointer("Rear");
  rearPtr.id = `rear-pointer`;
  const rearXOffset = frontIndex === rearIndex ? 20 : 0;
  rearPtr.moveTo(startX + rearIndex * gap + rearXOffset, startY + 50);
  pointers.push(rearPtr);
  return pointers;
};

const DESCRIPTION_MAP: Record<string, (e: TraceEvent) => StepDescription> = {
  [TAGS.INIT]: () => ({ key: "animation.init" }),
  [TAGS.ENQUEUE_START]: (e) => ({
    key: "animation.enqueue_start",
    params: { value: e.local_vars.value },
  }),
  [TAGS.ENQUEUE_INC_REAR]: (e) => ({
    key: "animation.enqueue_inc_rear",
    params: { rear: e.local_vars.rear },
  }),
  [TAGS.ENQUEUE_ASSIGN]: (e) => ({
    key: "animation.enqueue_assign",
    params: { rear: e.local_vars.rear, value: e.local_vars.value },
  }),
  [TAGS.ENQUEUE_COMPLETE]: () => ({ key: "animation.enqueue_complete" }),
  [TAGS.DEQUEUE_CHECK_EMPTY]: () => ({ key: "animation.dequeue_check_empty" }),
  [TAGS.DEQUEUE_ERROR]: () => ({ key: "animation.dequeue_error" }),
  [TAGS.DEQUEUE_GET_VALUE]: (e) => ({
    key: "animation.dequeue_get_value",
    params: { val: e.local_vars.removed_value },
  }),
  [TAGS.DEQUEUE_DEC_REAR]: (e) => ({
    key: "animation.dequeue_dec_rear",
    params: { rear: e.local_vars.rear },
  }),
  [TAGS.DEQUEUE_RETURN]: (e) => ({
    key: "animation.dequeue_return",
    params: { val: e.local_vars.removed_value },
  }),
  [TAGS.DEQUEUE_COMPLETE]: () => ({ key: "animation.dequeue_complete" }),
  [TAGS.PEEK_CHECK_EMPTY]: () => ({ key: "animation.peek_check_empty" }),
  [TAGS.PEEK_ERROR]: () => ({ key: "animation.peek_error" }),
  [TAGS.PEEK_RETURN]: (e) => ({
    key: "animation.peek_return",
    params: { val: e.local_vars.value },
  }),
  [TAGS.PEEK_COMPLETE]: () => ({ key: "animation.peek_complete" }),
};

export function queueTraceToSteps(trace: ExecutionTrace): AnimationStep[] {
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
        ...createQueuePointers(0, dataList.length - 1, startX, startY, gap),
      ];
    } else if (action?.type === "add") {
      const oldList = dataList.slice(0, -1);
      const newNode = dataList[dataList.length - 1];
      const currentRear = oldList.length - 1;

      if (event.tag === TAGS.ENQUEUE_START) {
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
          ...createQueuePointers(0, currentRear, startX, startY, gap),
        ];
      } else if (event.tag === TAGS.ENQUEUE_INC_REAR) {
        const emptyBox = createBox(
          "empty-slot",
          "",
          startX + (currentRear + 1) * gap,
          Status.Inactive,
          String(currentRear + 1),
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
          ...createQueuePointers(0, currentRear + 1, startX, startY, gap),
        ];
      } else if (event.tag === TAGS.ENQUEUE_ASSIGN) {
        const newBox = createBox(
          newNode.id,
          newNode.value,
          startX + (currentRear + 1) * gap,
          Status.Target,
          String(currentRear + 1),
        );
        elements = [
          ...createBoxes(oldList),
          newBox,
          ...createQueuePointers(0, currentRear + 1, startX, startY, gap),
        ];
      } else if (event.tag === TAGS.ENQUEUE_COMPLETE) {
        elements = [
          ...createBoxes(dataList, Status.Complete),
          ...createQueuePointers(0, currentRear + 1, startX, startY, gap),
        ];
      }
    } else if (action?.type === "delete") {
      if (action.value === undefined) {
        elements = [...createQueuePointers(0, -1, startX, startY, gap)];
      } else {
        const deletedNode = {
          id: (action as any).targetId || "del-temp",
          value: action.value,
        };
        const fullList = [deletedNode, ...dataList];
        const oldRear = fullList.length - 1;
        const newRear = oldRear - 1;
        const lastNode = fullList[fullList.length - 1];

        if (event.tag === TAGS.DEQUEUE_CHECK_EMPTY) {
          elements = [
            ...createBoxes(fullList),
            ...createQueuePointers(0, oldRear, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.DEQUEUE_GET_VALUE) {
          const boxes = createBoxes(fullList);
          boxes[0].id = `${deletedNode.id}-remove`;
          boxes[0].setStatus(Status.Unfinished);
          boxes[0].appearAnim = "instant";
          const movingBox = createBox(
            deletedNode.id,
            deletedNode.value,
            startX - gap,
            Status.Prepare,
            "removed_value",
          );
          elements = [
            ...boxes,
            movingBox,
            ...createQueuePointers(0, oldRear, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.DEQUEUE_DEC_REAR) {
          const movingBox = createBox(
            deletedNode.id,
            deletedNode.value,
            startX - gap,
            Status.Prepare,
            "removed_value",
          );
          const ghostBox = createBox(
            `${lastNode.id}-ghost`,
            lastNode.value,
            startX + oldRear * gap,
            Status.Inactive,
            String(oldRear),
            { dashed: true },
          );
          elements = [
            ...createBoxes(dataList),
            ghostBox,
            movingBox,
            ...createQueuePointers(0, newRear, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.DEQUEUE_RETURN) {
          const movingBox = createBox(
            deletedNode.id,
            deletedNode.value,
            startX - gap,
            Status.Target,
            "removed_value",
          );
          const ghostBox = createBox(
            `${lastNode.id}-ghost`,
            lastNode.value,
            startX + oldRear * gap,
            Status.Inactive,
            String(oldRear),
            { dashed: true },
          );
          elements = [
            ...createBoxes(dataList),
            ghostBox,
            movingBox,
            ...createQueuePointers(0, newRear, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.DEQUEUE_COMPLETE) {
          elements = [
            ...createBoxes(dataList, Status.Complete),
            ...createQueuePointers(0, newRear, startX, startY, gap),
          ];
        }
      }
    } else if (action?.type === "peek") {
      const rear = dataList.length - 1;
      if (dataList.length === 0) {
        elements = [...createQueuePointers(0, -1, startX, startY, gap)];
      } else {
        if (event.tag === TAGS.PEEK_CHECK_EMPTY) {
          elements = [
            ...createBoxes(dataList),
            ...createQueuePointers(0, rear, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.PEEK_RETURN) {
          const boxes = createBoxes(dataList);
          boxes[0].setStatus(Status.Target);
          elements = [
            ...boxes,
            ...createQueuePointers(0, rear, startX, startY, gap),
          ];
        } else if (event.tag === TAGS.PEEK_COMPLETE) {
          const boxes = createBoxes(dataList, Status.Unfinished);
          boxes[0].setStatus(Status.Complete);
          elements = [
            ...boxes,
            ...createQueuePointers(0, rear, startX, startY, gap),
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
