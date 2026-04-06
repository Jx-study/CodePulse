import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { LinkedListActionBar } from "./LinkedListActionBar";
import {
  LinearData as ListNodeData,
  LinearAction as ActionType,
  createNodeInstance,
  linkNodes,
  linkNodesDoubly,
  syncPointersFromNextPrev,
} from "../utils";

let currentIsDoubly = false;

function addStep(steps: AnimationStep[], stepData: AnimationStep) {
  steps.push(stepData);
}

function linkCurrentNodes(nodes: Node[]) {
  if (currentIsDoubly) {
    linkNodesDoubly(nodes);
  } else {
    linkNodes(nodes);
  }
}

/** InsertAtIndex 雙向：僅 newNode.next = succ */
function wireIndexDoublyLinkNext(oldChain: Node[], newNode: Node, succ: Node) {
  linkNodesDoubly(oldChain);
  newNode.next = succ;
  newNode.prev = null;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

/** succ.prev = newNode */
function wireIndexDoublySuccPrev(oldChain: Node[], newNode: Node, succ: Node) {
  linkNodesDoubly(oldChain);
  newNode.next = succ;
  newNode.prev = null;
  succ.prev = newNode;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

/** pred.next = newNode，newNode.prev 仍為 null */
function wireIndexDoublyPredNext(
  oldChain: Node[],
  newNode: Node,
  pred: Node,
  succ: Node,
) {
  linkNodesDoubly(oldChain);
  newNode.next = succ;
  newNode.prev = null;
  succ.prev = newNode;
  pred.next = newNode;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

/** 雙向插入完成：newNode.prev = pred */
function wireIndexDoublyFull(
  oldChain: Node[],
  newNode: Node,
  pred: Node,
  succ: Node,
) {
  linkNodesDoubly(oldChain);
  pred.next = newNode;
  newNode.prev = pred;
  newNode.next = succ;
  succ.prev = newNode;
  syncPointersFromNextPrev([...oldChain, newNode]);
}

function getLabel(
  index: number,
  totalLength: number,
  hasTailMode: boolean,
  extra: string = "",
): string {
  const labels: string[] = [];
  if (index === 0) labels.push("head");
  if (hasTailMode && index === totalLength - 1) labels.push("tail");
  if (extra) labels.push(extra);

  return labels.length > 0 ? labels.join("/") : "";
}

const TAGS = {
  INSERT_HEAD_START: "INSERT_HEAD_START",
  INSERT_HEAD_CREATE: "INSERT_HEAD_CREATE",
  INSERT_HEAD_LINK: "INSERT_HEAD_LINK",
  INSERT_HEAD_LINK_PREV: "INSERT_HEAD_LINK_PREV",
  INSERT_HEAD_UPDATE: "INSERT_HEAD_UPDATE",
  INSERT_HEAD_END: "INSERT_HEAD_END",

  INSERT_TAIL_START: "INSERT_TAIL_START",
  INSERT_TAIL_TRAVERSE: "INSERT_TAIL_TRAVERSE",
  INSERT_TAIL_CREATE: "INSERT_TAIL_CREATE",
  INSERT_TAIL_LINK: "INSERT_TAIL_LINK",
  INSERT_TAIL_LINK_PREV: "INSERT_TAIL_LINK_PREV",
  INSERT_TAIL_END: "INSERT_TAIL_END",

  INSERT_INDEX_START: "INSERT_INDEX_START",
  INSERT_INDEX_IFZERO: "INSERT_INDEX_IFZERO",
  INSERT_INDEX_IFTAIL: "INSERT_INDEX_IFTAIL",
  INSERT_INDEX_TRAVERSE: "INSERT_INDEX_TRAVERSE",
  INSERT_INDEX_CREATE: "INSERT_INDEX_CREATE",
  INSERT_INDEX_LINK: "INSERT_INDEX_LINK",
  INSERT_INDEX_LINK_PREV: "INSERT_INDEX_LINK_PREV",
  INSERT_INDEX_END: "INSERT_INDEX_END",

  DELETE_HEAD_START: "DELETE_HEAD_START",
  DELETE_HEAD_CHECK: "DELETE_HEAD_CHECK",
  DELETE_HEAD_UPDATE: "DELETE_HEAD_UPDATE",
  DELETE_HEAD_END: "DELETE_HEAD_END",

  DELETE_TAIL_START: "DELETE_TAIL_START",
  DELETE_TAIL_TRAVERSE: "DELETE_TAIL_TRAVERSE",
  DELETE_TAIL_UNLINK: "DELETE_TAIL_UNLINK",
  DELETE_TAIL_SINGLE: "DELETE_TAIL_SINGLE",
  DELETE_TAIL_END: "DELETE_TAIL_END",

  DELETE_INDEX_START: "DELETE_INDEX_START",
  DELETE_INDEX_IFZERO: "DELETE_INDEX_IFZERO",
  DELETE_INDEX_IFTAIL: "DELETE_INDEX_IFTAIL",
  DELETE_INDEX_TRAVERSE: "DELETE_INDEX_TRAVERSE",
  DELETE_INDEX_UNLINK: "DELETE_INDEX_UNLINK",
  DELETE_INDEX_END: "DELETE_INDEX_END",

  SEARCH_START: "SEARCH_START",
  SEARCH_COMPARE: "SEARCH_COMPARE",
  SEARCH_FOUND: "SEARCH_FOUND",
  SEARCH_NEXT: "SEARCH_NEXT",
  SEARCH_NOT_FOUND: "SEARCH_NOT_FOUND",
};

function createPointers(
  x: number,
  y: number,
  config: {
    isHead?: boolean;
    isTail?: boolean;
    extraLabel?: string;
  },
): Pointer[] {
  const pointers: Pointer[] = [];
  const gap = 100;
  const yOffset = gap / 2;

  const { isHead, isTail, extraLabel } = config;

  if (isHead) {
    const headPtr = new Pointer("head");
    headPtr.id = `head-pointer`;

    const xOffset = isTail ? -20 : 0;
    headPtr.moveTo(x + xOffset, y + yOffset);
    pointers.push(headPtr);
  }

  if (isTail) {
    const tailPtr = new Pointer("tail");
    tailPtr.id = `tail-pointer`;

    const xOffset = isHead ? 20 : 0;
    tailPtr.moveTo(x + xOffset, y + yOffset);
    pointers.push(tailPtr);
  }

  if (extraLabel) {
    const extraPtr = new Pointer(extraLabel, "down");
    extraPtr.id = `${extraLabel}-pointer`;
    extraPtr.moveTo(x, y - yOffset);
    pointers.push(extraPtr);
  }

  return pointers;
}

function createInsertTailHasTailSteps(
  dataList: ListNodeData[],
  value: any,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
  hasTailMode: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const oldNodesData = dataList.slice(0, -1);
  const newNodeData = dataList[dataList.length - 1];
  const totalLen = dataList.length;
  const oldLen = oldNodesData.length;

  const s1OldElements = oldNodesData.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      oldLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Unfinished,
    ),
  );
  const actualS1OldNodes = s1OldElements.filter(
    (n: any) => !(n instanceof Pointer),
  );
  linkCurrentNodes(actualS1OldNodes as any);

  const s1NewElement = makeNodeAndPointers(
    newNodeData,
    totalLen - 1,
    totalLen,
    startX + oldLen * gap,
    baseY,
    hasTailMode,
    Status.Target,
    "",
    "new",
  );

  steps.push({
    stepNumber: steps.length + 1,
    description: `InsertTail(${value}): 在尾端建立新節點並分配記憶體`,
    elements: [...s1OldElements, ...s1NewElement] as any,
    actionTag: TAGS.INSERT_TAIL_CREATE,
    variables: { value, "newNode.value": value },
  });

  const s2OldElements = oldNodesData.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      oldLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Unfinished,
    ),
  );
  const s2NewElement = makeNodeAndPointers(
    newNodeData,
    totalLen - 1,
    totalLen,
    startX + oldLen * gap,
    baseY,
    hasTailMode,
    Status.Target,
    "",
    "new",
  );
  const allS2 = [...s2OldElements, ...s2NewElement];
  const actualAllS2 = allS2.filter(
    (n: any) => !(n instanceof Pointer),
  ) as any[];

  if (currentIsDoubly) {
    linkNodesDoubly(actualAllS2);
    actualAllS2[actualAllS2.length - 1].prev = null;
    syncPointersFromNextPrev(actualAllS2);
  } else {
    linkCurrentNodes(actualAllS2);
  }

  steps.push({
    stepNumber: steps.length + 1,
    description: `tail.next = newNode (舊尾節點指向新節點)`,
    elements: allS2 as any,
    actionTag: TAGS.INSERT_TAIL_LINK,
    variables: { "tail.next": value },
  });

  if (currentIsDoubly) {
    const s2bOldElements = oldNodesData.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        oldLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
      ),
    );
    const s2bNewElement = makeNodeAndPointers(
      newNodeData,
      totalLen - 1,
      totalLen,
      startX + oldLen * gap,
      baseY,
      hasTailMode,
      Status.Target,
      "",
      "new",
    );
    const allS2b = [...s2bOldElements, ...s2bNewElement];
    const actualAllS2b = allS2b.filter(
      (n: any) => !(n instanceof Pointer),
    ) as Node[];

    linkNodesDoubly(actualAllS2b);
    syncPointersFromNextPrev(actualAllS2b);

    steps.push({
      stepNumber: steps.length + 1,
      description: `newNode.prev = tail (新節點 prev 回指舊尾節點)`,
      elements: allS2b as any,
      actionTag: TAGS.INSERT_TAIL_LINK_PREV || TAGS.INSERT_TAIL_LINK,
      variables: { "newNode.prev": oldNodesData[oldLen - 1]?.value ?? null },
    });
  }

  const s3OldElements = oldNodesData.flatMap(
    (item, i) =>
      makeNodeAndPointers(
        item,
        i,
        totalLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
        undefined,
      ), // 舊尾端拔除標籤（用 undefined 讓 head 自動偵測生效）
  );
  const s3NewElement = makeNodeAndPointers(
    newNodeData,
    totalLen - 1,
    totalLen,
    startX + oldLen * gap,
    baseY,
    hasTailMode,
    Status.Target,
    "tail",
    "new",
  );
  const allS3 = [...s3OldElements, ...s3NewElement];
  const actualAllS3 = allS3.filter((n: any) => !(n instanceof Pointer));
  linkCurrentNodes(actualAllS3 as any);

  steps.push({
    stepNumber: steps.length + 1,
    description: `tail = newNode (更新 tail 指標指向新節點)`,
    elements: allS3 as any,
    actionTag: TAGS.INSERT_TAIL_END,
    variables: { tail: value },
  });

  const s4Elements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      totalLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Complete,
    ),
  );
  const actualS4Nodes = s4Elements.filter((n: any) => !(n instanceof Pointer));
  linkCurrentNodes(actualS4Nodes as any);

  steps.push({
    stepNumber: steps.length + 1,
    description: "InsertTail 完成",
    elements: s4Elements as any,
    actionTag: TAGS.INSERT_TAIL_END,
    variables: { tail: value, length: totalLen },
  });

  return steps;
}

function createSearchSteps(
  dataList: ListNodeData[],
  value: any,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
  hasTailMode: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const totalLen = dataList.length;
  let isFound = false;

  if (totalLen === 0) {
    addStep(steps, {
      stepNumber: 1,
      description: "鏈結串列為空，無法搜尋",
      elements: [],
    });
    return steps;
  }

  for (let i = 0; i < totalLen; i++) {
    const compareElements = dataList.flatMap((item, idx) => {
      let status: Status = Status.Unfinished;
      let extra = undefined;
      if (idx === i) {
        status = Status.Prepare;
        extra = "current";
      }
      return makeNodeAndPointers(
        item,
        idx,
        totalLen,
        startX + idx * gap,
        baseY,
        hasTailMode,
        status,
        undefined,
        extra,
      );
    });

    const actualNodes = compareElements.filter((n) => !(n instanceof Pointer));
    linkCurrentNodes(actualNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `遍歷 node ${i}：比較 ${dataList[i].value} 是否等於目標值 ${value}`,
      elements: compareElements as any,
      actionTag: TAGS.SEARCH_COMPARE,
      variables: {
        current: dataList[i].value ?? null,
        target: value,
        index: i,
      },
    });

    if (dataList[i].value === value) {
      isFound = true;

      const foundElements = dataList.flatMap((item, idx) => {
        let status: Status = Status.Unfinished;
        let extra = undefined;
        if (idx === i) {
          status = Status.Complete;
          extra = "current";
        }
        return makeNodeAndPointers(
          item,
          idx,
          totalLen,
          startX + idx * gap,
          baseY,
          hasTailMode,
          status,
          undefined,
          extra,
        );
      });

      const actualFoundNodes = foundElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkCurrentNodes(actualFoundNodes as any);

      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `搜尋成功！在第 ${i} 個節點 (index ${i}) 找到數值 ${value}。`,
        elements: foundElements as any,
        actionTag: TAGS.SEARCH_FOUND,
        variables: {
          current: dataList[i].value ?? null,
          target: value,
          index: i,
        },
      });
      break;
    }
  }

  if (!isFound) {
    const notFoundElements = dataList.flatMap((item, idx) =>
      makeNodeAndPointers(
        item,
        idx,
        totalLen,
        startX + idx * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
      ),
    );
    const actualNotFoundNodes = notFoundElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualNotFoundNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `搜尋結束：未在鏈結串列中找到數值 ${value}。`,
      elements: notFoundElements as any,
      actionTag: TAGS.SEARCH_NOT_FOUND,
      variables: { current: null, target: value, index: -1 },
    });
  }
  return steps;
}

function createInsertHeadSteps(
  dataList: ListNodeData[],
  value: any,
  hasTailMode: boolean,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const newNodeData = dataList[0];
  const oldNodesData = dataList.slice(1);
  const totalLen = dataList.length;
  const initialX = oldNodesData.length === 0 ? startX : startX - gap;

  const createOldNodesWithHeadLabel = () =>
    oldNodesData.flatMap((item, i) => {
      let label = undefined;
      if (i === 0) {
        label = "head";
        if (hasTailMode && oldNodesData.length === 1) label = "head/tail";
      } else if (hasTailMode && i === oldNodesData.length - 1) {
        label = "tail";
      }
      return makeNodeAndPointers(
        item,
        i,
        totalLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
        label,
      );
    });

  const s1OldElements = createOldNodesWithHeadLabel();
  const actualS1OldNodes = s1OldElements.filter(
    (n: any) => !(n instanceof Pointer),
  );
  linkCurrentNodes(actualS1OldNodes as any);

  const s1NewElement = makeNodeAndPointers(
    newNodeData,
    0,
    totalLen,
    initialX,
    baseY,
    hasTailMode,
    Status.Target,
    "",
    "new",
  );

  addStep(steps, {
    stepNumber: 1,
    description: `InsertHead(${value}): 建立新節點並分配記憶體`,
    elements: [...s1NewElement, ...s1OldElements] as any,
    actionTag: TAGS.INSERT_HEAD_CREATE,
    variables: {
      value: value,
      "newNode.value": value,
      head: oldNodesData[0]?.value ?? null,
    },
  });

  const s2OldElements = oldNodesData.flatMap((item, i) => {
    let label = undefined;
    if (i === 0) label = "head";
    if (hasTailMode && i === oldNodesData.length - 1)
      label = (label ? label + "/" : "") + "tail";
    const status = i === 0 ? Status.Prepare : Status.Unfinished;
    return makeNodeAndPointers(
      item,
      i + 1,
      totalLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      status,
      label,
    );
  });

  const s2NewElement = makeNodeAndPointers(
    newNodeData,
    0,
    totalLen,
    initialX,
    baseY,
    hasTailMode,
    Status.Target,
    "",
    "new",
  );

  const allS2 = [...s2NewElement, ...s2OldElements];
  const actualAllS2 = allS2.filter(
    (n: any) => !(n instanceof Pointer),
  ) as Node[];

  if (currentIsDoubly && actualAllS2.length >= 2) {
    linkNodesDoubly(actualAllS2);
    const newNode = actualAllS2[0];
    const headNode = actualAllS2[1];
    newNode.prev = null;
    headNode.prev = null;
    syncPointersFromNextPrev(actualAllS2);

    addStep(steps, {
      stepNumber: 2,
      description: `newNode.next = head (新節點 next 指向原頭節點 ${oldNodesData[0]?.value ?? "null"})`,
      elements: allS2 as any,
      actionTag: TAGS.INSERT_HEAD_LINK,
      variables: {
        "newNode.next": oldNodesData[0]?.value ?? null,
        head: oldNodesData[0]?.value ?? null,
      },
    });

    const s2bOldElements = oldNodesData.flatMap((item, i) => {
      let label = i === 0 ? "head" : undefined;
      if (hasTailMode && i === oldNodesData.length - 1)
        label = (label ? label + "/" : "") + "tail";
      const status = i === 0 ? Status.Prepare : Status.Unfinished;
      return makeNodeAndPointers(
        item,
        i + 1,
        totalLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        status,
        label,
      );
    });
    const s2bNewElement = makeNodeAndPointers(
      newNodeData,
      0,
      totalLen,
      startX - gap,
      baseY,
      hasTailMode,
      Status.Target,
      "",
      "new",
    );
    const allS2b = [...s2bNewElement, ...s2bOldElements];
    const actualAllS2b = allS2b.filter(
      (n: any) => !(n instanceof Pointer),
    ) as Node[];
    linkNodesDoubly(actualAllS2b);
    addStep(steps, {
      stepNumber: 3,
      description: `head.prev = newNode (原頭節點 prev 回指新節點)`,
      elements: allS2b as any,
      actionTag: TAGS.INSERT_HEAD_LINK_PREV,
      variables: { "head.prev": value },
    });
  } else {
    linkCurrentNodes(actualAllS2);
    addStep(steps, {
      stepNumber: 2,
      description: `newNode.next = head (新節點指向原頭節點 ${oldNodesData[0]?.value ?? "null"})`,
      elements: allS2 as any,
      actionTag: TAGS.INSERT_HEAD_LINK,
      variables: {
        "newNode.next": oldNodesData[0]?.value ?? null,
        head: oldNodesData[0]?.value ?? null,
      },
    });
  }

  const s3OldElements = oldNodesData.flatMap((item, i) => {
    let label = undefined;
    if (hasTailMode && i === oldNodesData.length - 1) label = "tail";
    return makeNodeAndPointers(
      item,
      i + 1,
      totalLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Unfinished,
      label,
    );
  });

  const s3NewElement = makeNodeAndPointers(
    newNodeData,
    0,
    totalLen,
    initialX,
    baseY,
    hasTailMode,
    Status.Target,
    "head",
    "new",
  );

  const allS3 = [...s3NewElement, ...s3OldElements];
  const actualAllS3 = allS3.filter((n: any) => !(n instanceof Pointer));
  linkCurrentNodes(actualAllS3 as any);

  // 動態計算目前的步驟號碼 (如果雙向且有舊節點，因為有 head.prev，所以從 4 開始，否則從 3 開始)
  let currentStepIdx = currentIsDoubly && actualAllS2.length >= 2 ? 4 : 3;

  addStep(steps, {
    stepNumber: currentStepIdx++,
    description: `head = newNode (更新 head 指標指向新節點)`,
    elements: allS3 as any,
    actionTag: TAGS.INSERT_HEAD_UPDATE,
    variables: { head: value },
  });

  // 如果 node 個數從 0 變 1，且有 Tail 模式，插入一步來更新 tail，標籤在這時才變成 head/tail
  if (hasTailMode && oldNodesData.length === 0) {
    const sTailNewElement = makeNodeAndPointers(
      newNodeData,
      0,
      totalLen,
      initialX,
      baseY,
      hasTailMode,
      Status.Target,
      "head/tail",
      "new",
    );
    const actualTailNodes = sTailNewElement.filter(
      (n: any) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualTailNodes as any);

    addStep(steps, {
      stepNumber: currentStepIdx++,
      description: `原本鏈結串列為空，更新 tail 指標指向新節點`,
      elements: sTailNewElement as any,
      actionTag: TAGS.INSERT_HEAD_UPDATE,
      variables: { head: value, tail: value },
    });
  }

  const sFinalElements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      totalLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Complete,
      undefined,
      undefined,
    ),
  );
  const actualFinalNodes = sFinalElements.filter(
    (n: any) => !(n instanceof Pointer),
  );
  linkCurrentNodes(actualFinalNodes as any);

  addStep(steps, {
    stepNumber: currentStepIdx++,
    description: "InsertHead 完成",
    elements: sFinalElements as any,
    actionTag: TAGS.INSERT_HEAD_END,
    variables: { head: value, length: totalLen },
  });

  return steps;
}

function createInsertTailSteps(
  dataList: ListNodeData[],
  value: any,
  hasTailMode: boolean,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const totalLen = dataList.length;

  if (totalLen === 1) {
    const newNodeData = dataList[0];
    let currentStepIdx = 1;

    const s1Elements = makeNodeAndPointers(
      newNodeData,
      0,
      1,
      startX,
      baseY,
      hasTailMode,
      Status.Target,
      "",
      "new",
    );
    steps.push({
      stepNumber: currentStepIdx++,
      description: `InsertTail(${value}): 鏈結串列為空，建立新節點作為頭節點`,
      elements: s1Elements as any,
      actionTag: TAGS.INSERT_TAIL_CREATE,
      variables: { value, "newNode.value": value, head: null },
    });

    const s2Elements = makeNodeAndPointers(
      newNodeData,
      0,
      1,
      startX,
      baseY,
      hasTailMode,
      Status.Complete,
      "head",
    );
    steps.push({
      stepNumber: currentStepIdx++,
      description: `head = newNode (更新 head 指標指向新節點)`,
      elements: s2Elements as any,
      actionTag: TAGS.INSERT_TAIL_END,
      variables: { head: value, length: 1 },
    });

    if (hasTailMode) {
      const s3Elements = makeNodeAndPointers(
        newNodeData,
        0,
        1,
        startX,
        baseY,
        hasTailMode,
        Status.Complete,
        "head/tail",
      );
      steps.push({
        stepNumber: currentStepIdx++,
        description: `tail = newNode (因為原本為空，同步更新 tail 指標)`,
        elements: s3Elements as any,
        actionTag: TAGS.INSERT_TAIL_END,
        variables: { head: value, tail: value, length: 1 },
      });
    }

    return steps;
  }

  const oldNodesData = dataList.slice(0, -1);
  const newNodeData = dataList[dataList.length - 1];
  const oldLen = oldNodesData.length;

  if (hasTailMode) {
    return createInsertTailHasTailSteps(
      dataList,
      value,
      startX,
      gap,
      baseY,
      TAGS,
      hasTailMode,
    );
  } else {
    for (let i = 0; i < oldNodesData.length; i++) {
      const traverseElements = oldNodesData.flatMap((item, idx) => {
        let extra = undefined;
        if (idx === i) extra = "current";
        return makeNodeAndPointers(
          item,
          idx,
          oldLen,
          startX + idx * gap,
          baseY,
          hasTailMode,
          idx === i ? Status.Prepare : Status.Unfinished,
          undefined,
          extra,
        );
      });
      const actualTraverseNodes = traverseElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkCurrentNodes(actualTraverseNodes as any);

      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `遍歷中：current = current.next (目前指向節點 ${oldNodesData[i].value})`,
        elements: traverseElements as any,
        actionTag: TAGS.INSERT_TAIL_TRAVERSE,
        variables: { current: oldNodesData[i].value ?? null, index: i },
      });
    }

    const sNewCreateElements = oldNodesData.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        oldLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        i === oldLen - 1 ? Status.Prepare : Status.Unfinished,
        undefined,
        i === oldLen - 1 ? "current" : undefined,
      ),
    );
    const actualNewCreateNodes = sNewCreateElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualNewCreateNodes as any);

    const sNewElement = makeNodeAndPointers(
      newNodeData,
      totalLen - 1,
      totalLen,
      startX + oldLen * gap,
      baseY,
      hasTailMode,
      Status.Target,
      "",
      "new",
    );

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `InsertTail(${value}): 找到尾端，建立新節點並分配記憶體`,
      elements: [...sNewCreateElements, ...sNewElement] as any,
      actionTag: TAGS.INSERT_TAIL_CREATE,
      variables: {
        "newNode.value": value,
        current: oldNodesData[oldLen - 1].value ?? null,
      },
    });

    const sConnectOldElements = oldNodesData.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        oldLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        i === oldLen - 1 ? Status.Prepare : Status.Unfinished,
        undefined,
        i === oldLen - 1 ? "current" : undefined,
      ),
    );
    const sConnectNewElement = makeNodeAndPointers(
      newNodeData,
      totalLen - 1,
      totalLen,
      startX + oldLen * gap,
      baseY,
      hasTailMode,
      Status.Target,
      undefined,
      "new",
    );
    const allConnect = [...sConnectOldElements, ...sConnectNewElement];
    const actualAllConnect = allConnect.filter(
      (n) => !(n instanceof Pointer),
    ) as any[];

    // 先連雙向，再斷 prev
    if (currentIsDoubly) {
      linkNodesDoubly(actualAllConnect);
      actualAllConnect[actualAllConnect.length - 1].prev = null;
      syncPointersFromNextPrev(actualAllConnect);
    } else {
      linkCurrentNodes(actualAllConnect);
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `current.next = newNode (最後一個節點指向新節點)`,
      elements: allConnect as any,
      actionTag: TAGS.INSERT_TAIL_LINK,
      variables: {
        "current.next": value,
        current: oldNodesData[oldLen - 1].value ?? null,
      },
    });

    if (currentIsDoubly) {
      const sConnectB_OldElements = oldNodesData.flatMap((item, i) =>
        makeNodeAndPointers(
          item,
          i,
          oldLen,
          startX + i * gap,
          baseY,
          hasTailMode,
          i === oldLen - 1 ? Status.Prepare : Status.Unfinished,
          undefined,
          i === oldLen - 1 ? "current" : undefined,
        ),
      );
      const sConnectB_NewElement = makeNodeAndPointers(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        hasTailMode,
        Status.Target,
        "",
        "new",
      );
      const allConnectB = [...sConnectB_OldElements, ...sConnectB_NewElement];
      const actualAllConnectB = allConnectB.filter(
        (n) => !(n instanceof Pointer),
      ) as any[];

      // 全連，prev 出現
      linkNodesDoubly(actualAllConnectB);
      syncPointersFromNextPrev(actualAllConnectB);

      steps.push({
        stepNumber: steps.length + 1,
        description: `newNode.prev = current (新節點的 prev 回指最後一個節點)`,
        elements: allConnectB as any,
        actionTag: TAGS.INSERT_TAIL_LINK_PREV || TAGS.INSERT_TAIL_LINK,
        variables: { "newNode.prev": oldNodesData[oldLen - 1].value ?? null },
      });
    }

    const doneElements = dataList.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        totalLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Complete,
      ),
    );
    const actualDoneNodes = doneElements.filter((n) => !(n instanceof Pointer));
    linkCurrentNodes(actualDoneNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "InsertTail 完成",
      elements: doneElements as any,
      actionTag: TAGS.INSERT_TAIL_END,
      variables: { tail: value, length: totalLen },
    });
  }
  return steps;
}

function createInsertIndexSteps(
  dataList: ListNodeData[],
  value: any,
  actionIndex: number | undefined,
  hasTailMode: boolean,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const N = actionIndex !== undefined ? actionIndex : -1;
  const currentLen = dataList.length - 1;

  if (N < 0 || N > currentLen) return [];

  if (N === 0) {
    const checkElements = dataList
      .slice(1, dataList.length)
      .flatMap((item, i) =>
        makeNodeAndPointers(
          item,
          i,
          currentLen,
          startX + i * gap,
          baseY,
          hasTailMode,
          Status.Unfinished,
        ),
      );
    const actualCheckNodes = checkElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualCheckNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `InsertAtIndex(${value}, ${N}): index 為 0，執行 InsertHead`,
      elements: checkElements as any,
      actionTag: TAGS.INSERT_INDEX_IFZERO,
      variables: {
        index: N,
        targetIndex: 0,
        condition: "index == 0",
        action: "insertAtHead",
      },
    });

    const headSteps = createInsertHeadSteps(
      dataList,
      value,
      hasTailMode,
      startX,
      gap,
      baseY,
      TAGS,
    );
    headSteps.forEach((s) => {
      s.stepNumber = steps.length + 1;
      steps.push(s);
    });
    return steps;
  }

  if (hasTailMode && N === currentLen) {
    const checkElements = dataList
      .slice(0, -1)
      .flatMap((item, i) =>
        makeNodeAndPointers(
          item,
          i,
          currentLen,
          startX + i * gap,
          baseY,
          hasTailMode,
          Status.Unfinished,
        ),
      );
    const actualCheckNodes = checkElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualCheckNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `InsertAtIndex(${value}, ${N}): index 等於長度 ${currentLen}，執行 InsertTail`,
      elements: checkElements as any,
      actionTag: TAGS.INSERT_INDEX_IFTAIL,
      variables: {
        index: N,
        length: currentLen,
        condition: "index == length",
        action: "insertAtTail",
      },
    });

    const tailSteps = createInsertTailHasTailSteps(
      dataList,
      value,
      startX,
      gap,
      baseY,
      TAGS,
      hasTailMode,
    );
    tailSteps.forEach((s) => {
      s.stepNumber = steps.length + 1;
      steps.push(s);
    });
    return steps;
  }

  const newNodeData = dataList[N];
  const oldNodesData = [...dataList];
  oldNodesData.splice(N, 1);

  const oldLen = oldNodesData.length;
  const totalLen = dataList.length;

  for (let i = 0; i < N; i++) {
    const traverseElements = oldNodesData.flatMap((item, idx) => {
      let status: Status = Status.Unfinished;
      if (idx <= i) status = Status.Prepare;
      if (idx === i) status = Status.Target;

      let extra = undefined;
      if (idx === i) extra = "current";

      return makeNodeAndPointers(
        item,
        idx,
        oldLen,
        startX + idx * gap,
        baseY,
        hasTailMode,
        status,
        undefined,
        extra,
      );
    });
    const actualTraverseNodes = traverseElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualTraverseNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `遍歷：找到位置 ${i} (Node ${i})`,
      elements: traverseElements as any,
      actionTag: TAGS.INSERT_INDEX_TRAVERSE,
      variables: {
        current: oldNodesData[i].value ?? null,
        index: i,
        targetIndex: N ?? -1,
      },
    });
  }

  const s2Elements = oldNodesData.flatMap((item, i) => {
    let x = startX + i * gap;
    if (i >= N) x += gap;
    let status: Status = Status.Unfinished;
    if (i < N) status = Status.Prepare;
    return makeNodeAndPointers(
      item,
      i,
      oldLen,
      x,
      baseY,
      hasTailMode,
      status,
      undefined,
      i === N - 1 ? "current" : undefined,
    );
  });
  
  const s3OldElements = oldNodesData.flatMap((item, i) => {
    let x = startX + i * gap;
    if (i >= N) x += gap;
    let status: Status = Status.Unfinished;
    if (i < N) status = Status.Prepare;
    return makeNodeAndPointers(
      item,
      i,
      oldLen,
      x,
      baseY,
      hasTailMode,
      status,
      undefined,
      i === N - 1 ? "current" : undefined,
    );
  });
  const actualS3OldNodes = s3OldElements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS3OldNodes as any);

  const s3NewElement = makeNodeAndPointers(
    newNodeData,
    N,
    totalLen,
    startX + N * gap,
    baseY - 60,
    hasTailMode,
    Status.Target,
    undefined,
    "new",
  );

  addStep(steps, {
    stepNumber: steps.length + 1,
    description: `1. 建立新節點 ${value}`,
    elements: [...s3OldElements, ...s3NewElement] as any,
    actionTag: TAGS.INSERT_INDEX_CREATE,
    variables: {
      "newNode.value": value,
      current: oldNodesData[N - 1]?.value ?? null,
    },
  });

  const buildInsertIndexS4Wire = () => {
    const s4OldElements = oldNodesData.flatMap((item, i) => {
      let x = startX + i * gap;
      if (i >= N) x += gap;
      return makeNodeAndPointers(
        item,
        i,
        oldLen,
        x,
        baseY,
        hasTailMode,
        i < N ? Status.Prepare : Status.Unfinished,
        undefined,
        i === N - 1 ? "current" : undefined,
      );
    });
    const actualS4OldNodes = s4OldElements.filter(
      (n) => !(n instanceof Pointer),
    ) as Node[];
    const s4NewElement = makeNodeAndPointers(
      newNodeData,
      N,
      totalLen,
      startX + N * gap,
      baseY - 60,
      hasTailMode,
      Status.Target,
      undefined,
      "new",
    );
    const newNodeObj = s4NewElement.find(
      (n: Node | Pointer) => !(n instanceof Pointer),
    ) as Node | undefined;
    const succ = actualS4OldNodes.find((n) => n.description === String(N));
    const pred = actualS4OldNodes.find((n) => n.description === String(N - 1));
    return {
      s4OldElements,
      actualS4OldNodes,
      s4NewElement,
      newNodeObj,
      succ,
      pred,
    };
  };

  if (!currentIsDoubly) {
    const { s4OldElements, actualS4OldNodes, s4NewElement, newNodeObj, succ } =
      buildInsertIndexS4Wire();
    linkCurrentNodes(actualS4OldNodes);

    if (newNodeObj && succ) {
      newNodeObj.next = succ;
      newNodeObj.pointers = [succ];
    }

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `2. 將新節點指向原 Node ${N}`,
      elements: [...s4OldElements, ...s4NewElement] as any,
      actionTag: TAGS.INSERT_INDEX_LINK,
      variables: {
        "newNode.next": oldNodesData[N]?.value ?? null,
        current: oldNodesData[N - 1]?.value ?? null,
      },
    });

    const s5OldElements = oldNodesData.flatMap((item, i) => {
      let x = startX + i * gap;
      if (i >= N) x += gap;
      return makeNodeAndPointers(
        item,
        i,
        oldLen,
        x,
        baseY,
        hasTailMode,
        i < N ? Status.Prepare : Status.Unfinished,
        undefined,
        i === N - 1 ? "current" : undefined,
      );
    });
    const actualS5OldNodes = s5OldElements.filter(
      (n) => !(n instanceof Pointer),
    ) as Node[];
    linkCurrentNodes(actualS5OldNodes);

    const s5NewElement = makeNodeAndPointers(
      newNodeData,
      N,
      totalLen,
      startX + N * gap,
      baseY - 60,
      hasTailMode,
      Status.Target,
      undefined,
      "new",
    );
    const newNodeObj5 = s5NewElement.find(
      (n: Node | Pointer) => !(n instanceof Pointer),
    ) as Node | undefined;
    const nextNodeObj5 = actualS5OldNodes.find(
      (n) => n.description === String(N),
    );
    if (newNodeObj5 && nextNodeObj5) {
      newNodeObj5.next = nextNodeObj5;
      newNodeObj5.pointers = [nextNodeObj5];
    }

    const prevNodeObj5 = actualS5OldNodes.find(
      (n) => n.description === String(N - 1),
    ) as Node | undefined;
    if (prevNodeObj5 && newNodeObj5) {
      prevNodeObj5.next = newNodeObj5;
      prevNodeObj5.pointers = [newNodeObj5];
    }

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `3. 將 Node ${N - 1} 指向新節點`,
      elements: [...s5OldElements, ...s5NewElement] as any,
      actionTag: TAGS.INSERT_INDEX_LINK,
      variables: {
        "current.next": value,
        current: oldNodesData[N - 1]?.value ?? null,
      },
    });
  } else {
    const p1 = buildInsertIndexS4Wire();
    if (p1.newNodeObj && p1.succ && p1.pred) {
      wireIndexDoublyLinkNext(p1.actualS4OldNodes, p1.newNodeObj, p1.succ);
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `2. 將新節點指向原 Node ${N}（newNode.next）`,
        elements: [...p1.s4OldElements, ...p1.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK,
        variables: {
          "newNode.next": oldNodesData[N]?.value ?? null,
          current: oldNodesData[N - 1]?.value ?? null,
        },
      });

      const p2 = buildInsertIndexS4Wire();
      wireIndexDoublySuccPrev(p2.actualS4OldNodes, p2.newNodeObj!, p2.succ!);
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `2b. 原 Node ${N} 的 prev 回指新節點`,
        elements: [...p2.s4OldElements, ...p2.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK_PREV,
        variables: {
          [`node[${N}].prev`]: value,
        },
      });

      const p3 = buildInsertIndexS4Wire();
      wireIndexDoublyPredNext(
        p3.actualS4OldNodes,
        p3.newNodeObj!,
        p3.pred!,
        p3.succ!,
      );
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `3. Node ${N - 1} 的 next 指向新節點`,
        elements: [...p3.s4OldElements, ...p3.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK,
        variables: {
          "current.next": value,
          current: oldNodesData[N - 1]?.value ?? null,
        },
      });

      const p4 = buildInsertIndexS4Wire();
      wireIndexDoublyFull(
        p4.actualS4OldNodes,
        p4.newNodeObj!,
        p4.pred!,
        p4.succ!,
      );
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `3b. 新節點 prev 回指 Node ${N - 1}`,
        elements: [...p4.s4OldElements, ...p4.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK_PREV,
        variables: {
          "newNode.prev": oldNodesData[N - 1]?.value ?? null,
        },
      });
    }
  }

  const s6Elements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      totalLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Complete,
    ),
  );
  const actualS6Nodes = s6Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS6Nodes as any);

  addStep(steps, {
    stepNumber: steps.length + 1,
    description: "InsertAtIndex 完成",
    elements: s6Elements as any,
    actionTag: TAGS.INSERT_INDEX_END,
    variables: { length: totalLen },
  });
  return steps;
}

function createDeleteHeadSteps(
  dataList: ListNodeData[],
  deletedNodeData: any,
  mode: string,
  actionIndex: number | undefined,
  hasTailMode: boolean,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  const currentLen = dataList.length;
  const originalLen = currentLen + 1;
  const N = actionIndex !== undefined ? actionIndex : -1;
  const value = deletedNodeData.value;

  if (mode === "Node N") {
    const fullList = [deletedNodeData, ...dataList];
    const checkElements = fullList.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        originalLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
      ),
    );
    const actualCheckNodes = checkElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualCheckNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `DeleteAtIndex(${value}, ${N}): index 為 0，執行 deleteAtHead`,
      elements: checkElements as any,
      actionTag: TAGS.DELETE_INDEX_IFZERO,
      variables: {
        index: N,
        targetIndex: 0,
        condition: "index == 0",
        action: "deleteAtHead",
      },
    });
  }

  const s1DelElement = makeNodeAndPointers(
    deletedNodeData,
    0,
    currentLen + 1,
    startX,
    baseY,
    hasTailMode,
    Status.Target,
    "head",
  );
  const s1RestElements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i + 1,
      currentLen + 1,
      startX + (i + 1) * gap,
      baseY,
      hasTailMode,
      Status.Unfinished,
    ),
  );
  const allS1 = [...s1DelElement, ...s1RestElements];
  const actualAllS1 = allS1.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualAllS1 as any);

  addStep(steps, {
    stepNumber: 1,
    description: `DeleteHead(): 標記頭節點 ${deletedNodeData.value} 準備刪除`,
    elements: allS1 as any,
    actionTag: TAGS.DELETE_HEAD_START,
    variables: { head: deletedNodeData.value },
  });

  const s2DelElement = makeNodeAndPointers(
    deletedNodeData,
    0,
    currentLen + 1,
    startX,
    baseY,
    hasTailMode,
    Status.Target,
    "",
  );
  const s2RestElements = dataList.flatMap((item, i) => {
    let label = undefined;
    if (i === 0) label = "head";
    if (hasTailMode && i === currentLen - 1) label = "tail";
    if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";
    return makeNodeAndPointers(
      item,
      i + 1,
      currentLen + 1,
      startX + (i + 1) * gap,
      baseY,
      hasTailMode,
      i === 0 ? Status.Prepare : Status.Unfinished,
      label,
    );
  });
  const allS2 = [...s2DelElement, ...s2RestElements];
  const actualAllS2 = allS2.filter((n) => !(n instanceof Pointer)) as any[];

  // 先讓舊節點與新節點保持完整的連線 (包含雙向)
  if (currentIsDoubly) {
    linkNodesDoubly(actualAllS2);
    syncPointersFromNextPrev(actualAllS2);
  } else {
    linkCurrentNodes(actualAllS2);
  }

  let currentStepIdx = 2;
  steps.push({
    stepNumber: currentStepIdx++,
    description: "head = head.next (將 head 指標移至下一個節點)",
    elements: allS2 as any,
    actionTag: TAGS.DELETE_HEAD_UPDATE,
    variables: { head: dataList[0]?.value ?? null },
  });

  // 針對雙向鏈結串列：單獨拆出 head.prev = null 的動畫
  if (currentIsDoubly && dataList.length > 0) {
    const s3bDelElement = makeNodeAndPointers(
      deletedNodeData,
      0,
      currentLen + 1,
      startX,
      baseY,
      hasTailMode,
      Status.Target,
      "",
    );
    const s3bRestElements = dataList.flatMap((item, i) => {
      let label = i === 0 ? "head" : undefined;
      if (hasTailMode && i === currentLen - 1) label = "tail";
      if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";
      return makeNodeAndPointers(
        item,
        i + 1,
        currentLen + 1,
        startX + (i + 1) * gap,
        baseY,
        hasTailMode,
        i === 0 ? Status.Prepare : Status.Unfinished,
        label,
      );
    });

    const allS3b = [...s3bDelElement, ...s3bRestElements];
    const actualAllS3b = allS3b.filter((n) => !(n instanceof Pointer)) as any[];

    linkNodesDoubly(actualAllS3b);
    actualAllS3b[1].prev = null; // 手動斷開新 Head 回指舊 Head 的 prev 箭頭
    syncPointersFromNextPrev(actualAllS3b);

    steps.push({
      stepNumber: currentStepIdx++,
      description: "head.prev = null (斷開新頭節點的回指連結)",
      elements: allS3b as any,
      actionTag: TAGS.DELETE_HEAD_UPDATE,
      variables: { head: dataList[0]?.value ?? null },
    });
  }

  // 單向與雙向共用：斷開被刪除節點的 next
  const s3DelElement = makeNodeAndPointers(
    deletedNodeData,
    0,
    currentLen + 1,
    startX,
    baseY,
    hasTailMode,
    Status.Inactive,
    "",
  );
  const s3RestElements = dataList.flatMap((item, i) => {
    let label = i === 0 ? "head" : undefined;
    if (hasTailMode && i === currentLen - 1) label = "tail";
    if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";
    return makeNodeAndPointers(
      item,
      i + 1,
      currentLen + 1,
      startX + (i + 1) * gap,
      baseY,
      hasTailMode,
      i === 0 ? Status.Prepare : Status.Unfinished,
      label,
    );
  });

  const allS3 = [...s3DelElement, ...s3RestElements];
  const actualAllS3 = allS3.filter((n) => !(n instanceof Pointer)) as any[];

  if (currentIsDoubly) {
    linkNodesDoubly(actualAllS3);
    actualAllS3[0].next = null; // 斷開舊 Head 指向新 Head 的 next 箭頭
    if (actualAllS3.length > 1) {
      actualAllS3[1].prev = null; // 保持新 Head 的 prev 處於斷開狀態
    }
    syncPointersFromNextPrev(actualAllS3);
  } else {
    // 單向直接讓後面的節點互連，舊節點把 pointers 清空即可
    const restNodesOnly = s3RestElements.filter((n) => !(n instanceof Pointer));
    linkCurrentNodes(restNodesOnly as any);
    actualAllS3[0].pointers = [];
  }

  steps.push({
    stepNumber: currentStepIdx++,
    description: "釋放記憶體：斷開被刪除節點的連結",
    elements: allS3 as any,
    actionTag: TAGS.DELETE_HEAD_UPDATE,
    variables: { head: dataList[0]?.value ?? null },
  });

  const s4Elements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      currentLen,
      startX + (i + 1) * gap,
      baseY,
      hasTailMode,
      Status.Prepare,
    ),
  );
  const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS4Nodes as any);

  steps.push({
    stepNumber: currentStepIdx++,
    description: "移除舊節點實體",
    elements: s4Elements as any,
    actionTag: TAGS.DELETE_HEAD_END,
    variables: { head: dataList[0]?.value ?? null, length: currentLen },
  });

  const s5Elements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      currentLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Complete,
    ),
  );
  const actualS5Nodes = s5Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS5Nodes as any);

  steps.push({
    stepNumber: currentStepIdx++,
    description: "DeleteHead 完成",
    elements: s5Elements as any,
    actionTag: TAGS.DELETE_HEAD_END,
    variables: { head: dataList[0]?.value ?? null, length: currentLen },
  });

  return steps;
}

function createDeleteTailSteps(
  dataList: ListNodeData[],
  deletedNodeData: any,
  mode: string,
  actionIndex: number | undefined,
  hasTailMode: boolean,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];

  const currentLen = dataList.length;
  const originalLen = currentLen + 1;
  const N = actionIndex !== undefined ? actionIndex : -1;
  const value = deletedNodeData.value;

  // 如果從 Node N 觸發的，多加一個判斷的動畫步驟
  if (mode === "Node N") {
    const fullList = [...dataList, deletedNodeData];
    const checkElements = fullList.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        originalLen,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
      ),
    );
    const actualCheckNodes = checkElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualCheckNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `DeleteAtIndex(${value}, ${N}): index 等於長度 ${currentLen}，執行 deleteAtTail`,
      elements: checkElements as any,
      actionTag: TAGS.DELETE_INDEX_START,
      variables: {
        index: N,
        length: currentLen,
        condition: "index == length",
        action: "deleteAtTail",
      },
    });
  }

  for (let i = 0; i < currentLen; i++) {
    const traverseElements = [
      ...dataList.flatMap((item, idx) => {
        let status: Status = Status.Unfinished;
        let extra = undefined;
        if (idx === i) {
          status = Status.Prepare;
          extra = "current";
        }
        if (i > 0 && idx === i - 1) {
          extra = "pre";
        }
        return makeNodeAndPointers(
          item,
          idx,
          currentLen + 1,
          startX + idx * gap,
          baseY,
          hasTailMode,
          status,
          undefined,
          extra,
        );
      }),
      ...makeNodeAndPointers(
        deletedNodeData,
        currentLen,
        currentLen + 1,
        startX + currentLen * gap,
        baseY,
        hasTailMode,
        i === currentLen ? Status.Target : Status.Unfinished,
        hasTailMode ? "tail" : "",
      ),
    ];
    const actualTraverseNodes = traverseElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualTraverseNodes as any);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `遍歷中：current = current.next (尋找尾端節點)`,
      elements: traverseElements as any,
      actionTag: TAGS.DELETE_TAIL_TRAVERSE,
      variables: {
        current: (actualTraverseNodes[i] as any)?.value ?? null,
        index: i,
      },
    });
  }

  const s2Elements = [
    ...dataList.flatMap((item, idx) => {
      let label = "";
      if (idx === 0) label = "head";
      let extra = undefined;
      if (idx === currentLen - 1) extra = "pre";

      return makeNodeAndPointers(
        item,
        idx,
        currentLen,
        startX + idx * gap,
        baseY,
        hasTailMode,
        idx === currentLen - 1 ? Status.Prepare : Status.Unfinished,
        label,
        extra,
      );
    }),
    ...makeNodeAndPointers(
      deletedNodeData,
      currentLen,
      currentLen + 1,
      startX + currentLen * gap,
      baseY,
      hasTailMode,
      Status.Target,
      "tail",
      "current",
    ),
  ];
  const actualS2Nodes = s2Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS2Nodes as any);
  addStep(steps, {
    stepNumber: steps.length + 1,
    description: `DeleteTail(): 找到尾端節點 ${deletedNodeData.value}`,
    elements: s2Elements as any,
    actionTag: TAGS.DELETE_TAIL_TRAVERSE,
    variables: {
      current: deletedNodeData.value,
      pre: dataList[currentLen - 1].value ?? null,
    },
  });

  const s3Elements = [
    ...dataList.flatMap((item, idx) => {
      let label = "";
      if (idx === 0) label = "head";
      let extra = undefined;
      if (idx === currentLen - 1) extra = "pre";
      return makeNodeAndPointers(
        item,
        idx,
        currentLen,
        startX + idx * gap,
        baseY,
        hasTailMode,
        idx === currentLen - 1 ? Status.Target : Status.Unfinished,
        label,
        extra,
      );
    }),
    ...makeNodeAndPointers(
      deletedNodeData,
      currentLen,
      currentLen + 1,
      startX + currentLen * gap,
      baseY,
      hasTailMode,
      Status.Inactive,
      hasTailMode ? "tail" : "",
      "current",
    ),
  ];
  const actualS3Nodes = s3Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS3Nodes as any);

  const newTailObj = actualS3Nodes.find(
    (n: any) => n.description === String(currentLen - 1),
  ) as Node | undefined;
  if (newTailObj) {
    newTailObj.next = null;
    if (currentIsDoubly) {
      syncPointersFromNextPrev(actualS3Nodes as Node[]);
    } else {
      newTailObj.pointers = [];
    }
  }

  addStep(steps, {
    stepNumber: steps.length + 1,
    description: "pre.next = null (斷開前一個節點的連結)",
    elements: s3Elements as any,
    actionTag: TAGS.DELETE_TAIL_UNLINK,
    variables: {
      "pre.next": null,
      pre: dataList[currentLen - 1].value ?? null,
    },
  });

  if (hasTailMode) {
    const sTailElements = [
      ...dataList.flatMap((item, idx) => {
        let label = "";
        if (idx === 0) label = "head";
        if (idx === currentLen - 1) label = (label ? label + "/" : "") + "tail";
        let extra = undefined;
        if (idx === currentLen - 1) extra = "pre";
        return makeNodeAndPointers(
          item,
          idx,
          currentLen,
          startX + idx * gap,
          baseY,
          hasTailMode,
          idx === currentLen - 1 ? Status.Target : Status.Unfinished,
          label,
          extra,
        );
      }),
      ...makeNodeAndPointers(
        deletedNodeData,
        currentLen,
        currentLen + 1,
        startX + currentLen * gap,
        baseY,
        hasTailMode,
        Status.Inactive,
        "",
        "current",
      ),
    ];
    const actualSTailNodes = sTailElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualSTailNodes as any);
    const tailPreObj = actualSTailNodes.find(
      (n: any) => n.description === String(currentLen - 1),
    ) as Node | undefined;
    if (tailPreObj) {
      tailPreObj.next = null;
      if (currentIsDoubly) {
        syncPointersFromNextPrev(actualSTailNodes as Node[]);
      } else {
        tailPreObj.pointers = [];
      }
    }

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "tail = pre (更新 tail 指標指向新的尾節點)",
      elements: sTailElements as any,
      actionTag: TAGS.DELETE_TAIL_UNLINK,
      variables: {
        tail: dataList[currentLen - 1].value ?? null,
        pre: dataList[currentLen - 1].value ?? null,
      },
    });
  }

  const s4Elements = dataList.flatMap((item, i) =>
    makeNodeAndPointers(
      item,
      i,
      currentLen,
      startX + i * gap,
      baseY,
      hasTailMode,
      Status.Complete,
    ),
  );
  const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS4Nodes as any);
  addStep(steps, {
    stepNumber: steps.length + 1,
    description: "DeleteTail 完成",
    elements: s4Elements as any,
    actionTag: TAGS.DELETE_TAIL_END,
    variables: {
      tail: dataList[currentLen - 1].value ?? null,
      length: currentLen,
    },
  });
  return steps;
}

function createDeleteIndexSteps(
  dataList: ListNodeData[],
  deletedNodeData: any,
  actionIndex: number | undefined,
  hasTailMode: boolean,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const currentLen = dataList.length;
  const originalLen = currentLen + 1;
  const N = actionIndex !== undefined ? actionIndex : -1;

  const oldList = [...dataList];
  oldList.splice(N, 0, deletedNodeData);

  for (let i = 0; i <= N; i++) {
    const traverseElements = oldList.flatMap((item, idx) => {
      let status: Status = Status.Unfinished;
      if (idx === i - 1) status = Status.Prepare;
      if (idx === i) status = Status.Target;
      let extra: string | undefined =
        idx === i ? "current" : i > 0 && idx === i - 1 ? "pre" : undefined;

      let override = undefined;
      if (i > 0 && idx === i - 1)
        override = getLabel(idx, originalLen, hasTailMode) + "/pre";

      return makeNodeAndPointers(
        item,
        idx,
        originalLen,
        startX + idx * gap,
        baseY,
        hasTailMode,
        status,
        override,
        extra,
      );
    });
    const actualTraverseNodes = traverseElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualTraverseNodes as any);
    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `遍歷中：current = current.next (尋找 index ${N})`,
      elements: traverseElements as any,
      actionTag: TAGS.DELETE_INDEX_TRAVERSE,
      variables: {
        current: oldList[i].value ?? null,
        pre: i > 0 ? (oldList[i - 1].value ?? null) : null,
        index: i,
        targetIndex: N,
      },
    });
  }

  const s2Elements = oldList.flatMap((item, idx) => {
    let y = baseY;
    if (idx === N) y = baseY - 60;
    let label = undefined;
    if (idx === N - 1) label = getLabel(idx, originalLen, hasTailMode) + "pre";
    let extra = idx === N ? "current" : idx === N - 1 ? "pre" : undefined;
    let status: Status = idx === N - 1 ? Status.Prepare : Status.Unfinished;
    if (idx === N) status = Status.Target;
    return makeNodeAndPointers(
      item,
      idx,
      originalLen,
      startX + idx * gap,
      y,
      hasTailMode,
      status,
      label,
      extra,
    );
  });
  const actualS2Nodes = s2Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS2Nodes as any);
  addStep(steps, {
    stepNumber: steps.length + 1,
    description: `DeleteAtIndex(${deletedNodeData.value}, ${N}): 找到目標節點並移出`,
    elements: s2Elements as any,
    actionTag: TAGS.DELETE_INDEX_TRAVERSE,
    variables: {
      nodeToDelete: oldList[N].value ?? null,
      pre: oldList[N - 1].value ?? null,
    },
  });

  const s3Elements = oldList.flatMap((item, idx) => {
    let y = baseY;
    if (idx === N) y = baseY - 60;
    let label =
      idx === N - 1
        ? getLabel(idx, originalLen, hasTailMode) + "pre"
        : undefined;
    if (hasTailMode && N === originalLen - 1 && idx === N) {
      label = (label ? label + "/" : "") + "tail";
    }
    let extra = idx === N ? "current" : idx === N - 1 ? "pre" : undefined;
    let status: Status = idx === N - 1 ? Status.Prepare : Status.Unfinished;
    if (idx === N) status = Status.Target;
    return makeNodeAndPointers(
      item,
      idx,
      originalLen,
      startX + idx * gap,
      y,
      hasTailMode,
      status,
      label,
      extra,
    );
  });
  const actualS3Nodes = s3Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS3Nodes as any);
  const preNodeObj = actualS3Nodes.find(
    (n: any) => n.description === String(N - 1),
  );
  const nextNodeObj = actualS3Nodes.find(
    (n: any) => n.description === String(N + 1),
  );
  if (currentIsDoubly) {
    if (preNodeObj && nextNodeObj) {
      (preNodeObj as Node).next = nextNodeObj as Node;
      // 不更新 nextNodeObj.prev，留到下一步
    }
    syncPointersFromNextPrev(actualS3Nodes as Node[]);
  } else {
    if (preNodeObj && nextNodeObj) {
      (preNodeObj as Node).next = nextNodeObj as Node;
      (preNodeObj as any).pointers = [nextNodeObj];
    }
  }

  addStep(steps, {
    stepNumber: steps.length + 1,
    description: `pre.next = current.next (前驅節點跳過目標指向下一個節點)`,
    elements: s3Elements as any,
    actionTag: TAGS.DELETE_INDEX_UNLINK,
    variables: {
      "pre.next": oldList[N + 1]?.value ?? null,
      pre: oldList[N - 1].value ?? null,
      nodeToDelete: oldList[N].value ?? null,
    },
  });

  // 把 current.next.prev = pre 拆開成獨立的下一步 (只在 Doubly 且有下一個節點時執行)
  if (currentIsDoubly && nextNodeObj) {
    const s3bElements = oldList.flatMap((item, idx) => {
      let y = baseY;
      if (idx === N) y = baseY - 60;
      let label =
        idx === N - 1
          ? getLabel(idx, originalLen, hasTailMode) + "pre"
          : undefined;
      if (hasTailMode && N === originalLen - 1 && idx === N) {
        label = (label ? label + "/" : "") + "tail";
      }
      let extra = idx === N ? "current" : idx === N - 1 ? "pre" : undefined;
      let status: Status = idx === N - 1 ? Status.Prepare : Status.Unfinished;
      if (idx === N) status = Status.Target;
      return makeNodeAndPointers(
        item,
        idx,
        originalLen,
        startX + idx * gap,
        y,
        hasTailMode,
        status,
        label,
        extra,
      );
    });
    const actualS3bNodes = s3bElements.filter((n) => !(n instanceof Pointer));
    linkCurrentNodes(actualS3bNodes as any);

    const preNodeObjB = actualS3bNodes.find(
      (n: any) => n.description === String(N - 1),
    );
    const nextNodeObjB = actualS3bNodes.find(
      (n: any) => n.description === String(N + 1),
    );

    if (preNodeObjB && nextNodeObjB) {
      (preNodeObjB as Node).next = nextNodeObjB as Node; // 保持上一步的狀態
      (nextNodeObjB as Node).prev = preNodeObjB as Node; // 在這步更新 prev 回指箭頭
    }
    // delNode 依然不釋放，保留指出去的 next/prev 指標
    syncPointersFromNextPrev(actualS3bNodes as Node[]);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `current.next.prev = pre (後繼節點的 prev 回指前驅節點)`,
      elements: s3bElements as any,
      actionTag: TAGS.DELETE_INDEX_UNLINK,
      variables: {
        "current.next.prev": oldList[N - 1]?.value ?? null,
      },
    });
  }

  if (hasTailMode && N === originalLen - 1) {
    const sTailElements = oldList.flatMap((item, idx) => {
      let y = baseY;
      if (idx === N) y = baseY - 60;
      let label =
        idx === N - 1
          ? getLabel(idx, originalLen, true) + "pre/tail"
          : undefined;
      let extra = idx === N ? "current" : undefined;
      let status: Status = idx === N - 1 ? Status.Prepare : Status.Unfinished;
      if (idx === N) status = Status.Target;
      return makeNodeAndPointers(
        item,
        idx,
        originalLen,
        startX + idx * gap,
        y,
        hasTailMode,
        status,
        label,
        extra,
      );
    });
    const actualSTailNodes = sTailElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkCurrentNodes(actualSTailNodes as any);

    const preObj = actualSTailNodes.find(
      (n: any) => n.description === String(N - 1),
    );
    if (currentIsDoubly) {
      if (preObj) {
        (preObj as Node).next = null;
        syncPointersFromNextPrev(actualSTailNodes as Node[]);
      }
    } else {
      if (preObj) {
        (preObj as Node).next = null;
        (preObj as any).pointers = [];
      }
    }

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "tail = pre (更新 tail 指標指向新的尾節點)",
      elements: sTailElements as any,
      actionTag: TAGS.DELETE_INDEX_UNLINK,
      variables: {
        tail: oldList[N - 1].value ?? null,
        pre: oldList[N - 1].value ?? null,
      },
    });
  }

  const s4Elements = oldList.flatMap((item, idx) => {
    let y = baseY;
    if (idx === N) y = baseY - 60;
    let label =
      idx === N - 1
        ? getLabel(idx, originalLen, hasTailMode) + "pre"
        : undefined;
    let extra = idx === N ? "current" : idx === N - 1 ? "pre" : undefined;
    let status: Status = idx === N - 1 ? Status.Prepare : Status.Unfinished;
    if (idx === N) status = Status.Target;
    return makeNodeAndPointers(
      item,
      idx,
      originalLen,
      startX + idx * gap,
      y,
      hasTailMode,
      status,
      label,
      extra,
    );
  });
  const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS4Nodes as any);
  const preNodeObj4 = actualS4Nodes.find(
    (n: any) => n.description === String(N - 1),
  );
  const nextNodeObj4 = actualS4Nodes.find(
    (n: any) => n.description === String(N + 1),
  );
  const delNodeObj4 = actualS4Nodes.find(
    (n: any) => n.description === String(N),
  );
  if (currentIsDoubly) {
    if (preNodeObj4 && nextNodeObj4) {
      (preNodeObj4 as Node).next = nextNodeObj4 as Node;
      (nextNodeObj4 as Node).prev = preNodeObj4 as Node;
    }
    if (delNodeObj4) {
      (delNodeObj4 as Node).next = null;
      (delNodeObj4 as Node).prev = null;
    }
    syncPointersFromNextPrev(actualS4Nodes as Node[]);
  } else {
    if (preNodeObj4 && nextNodeObj4) {
      (preNodeObj4 as Node).next = nextNodeObj4 as Node;
      (preNodeObj4 as any).pointers = [nextNodeObj4];
    }
    if (delNodeObj4) {
      (delNodeObj4 as Node).next = null;
      (delNodeObj4 as any).pointers = [];
    }
  }

  addStep(steps, {
    stepNumber: steps.length + 1,
    description: "釋放記憶體：斷開被刪除節點的連結",
    elements: s4Elements as any,
    actionTag: TAGS.DELETE_INDEX_UNLINK,
    variables: {
      "current.next": null,
      pre: oldList[N - 1].value ?? null,
      nodeToDelete: oldList[N].value ?? null,
    },
  });

  const s5Elements = dataList.flatMap((item, idx) =>
    makeNodeAndPointers(
      item,
      idx,
      currentLen,
      startX + idx * gap,
      baseY,
      hasTailMode,
      Status.Complete,
    ),
  );
  const actualS5Nodes = s5Elements.filter((n) => !(n instanceof Pointer));
  linkCurrentNodes(actualS5Nodes as any);
  addStep(steps, {
    stepNumber: steps.length + 1,
    description: "DeleteAtIndex 完成",
    elements: s5Elements as any,
    actionTag: TAGS.DELETE_INDEX_END,
    variables: { length: currentLen },
  });
  return steps;
}

/** 頂層工廠函式：依 hasTailMode 決定是否顯示 tail pointer */
export function makeNodeAndPointers(
  item: ListNodeData,
  i: number,
  total: number,
  x: number,
  y: number,
  hasTailMode: boolean,
  status: Status = Status.Unfinished,
  overrideLabel?: string,
  extraLabel?: string,
) {
  const node = createNodeInstance(item.id, item.value, x, y, status, "");
  node.description = String(i);

  let isHead = false;
  let isTail = false;

  if (overrideLabel === "head" || overrideLabel === "head/tail") {
    isHead = true;
  } else if (overrideLabel === undefined && i === 0) {
    isHead = true;
  }

  if (hasTailMode) {
    if (overrideLabel === "tail" || overrideLabel === "head/tail") {
      isTail = true;
    } else if (overrideLabel === undefined && i === total - 1) {
      isTail = true;
    }
  }

  const pointers = createPointers(x, y, { isHead, isTail, extraLabel });
  (node as any).pointers = pointers;
  return [node, ...pointers];
}

export function createLinkedListAnimationSteps(
  dataList: ListNodeData[],
  action?: ActionType,
  hasTailMode: boolean = false,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 200;
  const gap = 100;
  const baseY = 200;


  if (!action) {
    const elements = dataList.flatMap((item, i) =>
      makeNodeAndPointers(
        item,
        i,
        dataList.length,
        startX + i * gap,
        baseY,
        hasTailMode,
        Status.Unfinished,
      ),
    );
    const actualNodes = elements.filter((n) => !(n instanceof Pointer));
    linkCurrentNodes(actualNodes as any);

    addStep(steps, {
      stepNumber: 1,
      description: `初始${currentIsDoubly ? "雙向" : "單向"}鏈結串列`,
      elements: elements as any,
    });
    return steps;
  }

  const { type, value, mode, targetId, index: actionIndex } = action;

  if (type === "search") {
    return createSearchSteps(
      dataList,
      value,
      startX,
      gap,
      baseY,
      TAGS,
      hasTailMode,
    );
  }
  if (type === "add") {
    if (mode === "Head") {
      return createInsertHeadSteps(
        dataList,
        value,
        hasTailMode,
        startX,
        gap,
        baseY,
        TAGS,
      );
    }
    if (mode === "Tail") {
      return createInsertTailSteps(
        dataList,
        value,
        hasTailMode,
        startX,
        gap,
        baseY,
        TAGS,
      );
    }
    if (mode === "Node N") {
      return createInsertIndexSteps(
        dataList,
        value,
        actionIndex,
        hasTailMode,
        startX,
        gap,
        baseY,
        TAGS,
      );
    }
  }
  if (type === "delete") {
    const deletedNodeData = { id: targetId || "temp-del", value: value };
    const N = actionIndex !== undefined ? actionIndex : -1;
    const isDeleteHead = mode === "Head" || (mode === "Node N" && N === 0);
    const isDeleteTail =
      mode === "Tail" || (mode === "Node N" && N === dataList.length);

    // last element is being deleted
    if (dataList.length === 0) {
      const s1DelElement = makeNodeAndPointers(
        deletedNodeData,
        0,
        1,
        startX,
        baseY,
        hasTailMode,
        Status.Target,
        hasTailMode ? "head/tail" : "head",
      );
      addStep(steps, {
        stepNumber: 1,
        description: "Delete: 鏈結串列只有一個節點，標記準備刪除",
        elements: s1DelElement,
        actionTag: TAGS.DELETE_TAIL_SINGLE,
      });
      addStep(steps, {
        stepNumber: 2,
        description: "移除節點，head 設為 null",
        elements: [],
        actionTag: TAGS.DELETE_TAIL_SINGLE,
      });
      addStep(steps, {
        stepNumber: 3,
        description: "刪除完成，鏈結串列目前為空",
        elements: [],
        actionTag: TAGS.DELETE_TAIL_END,
      });
      return steps;
    }

    if (isDeleteHead) {
      return createDeleteHeadSteps(
        dataList,
        deletedNodeData,
        mode,
        actionIndex,
        hasTailMode,
        startX,
        gap,
        baseY,
        TAGS,
      );
    }
    if (isDeleteTail) {
      return createDeleteTailSteps(
        dataList,
        deletedNodeData,
        mode,
        actionIndex,
        hasTailMode,
        startX,
        gap,
        baseY,
        TAGS,
      );
    }
    if (mode === "Node N") {
      return createDeleteIndexSteps(
        dataList,
        deletedNodeData,
        actionIndex,
        hasTailMode,
        startX,
        gap,
        baseY,
        TAGS,
      );
    }
  }

  return steps;
}

const linkedListNoTailCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null

    Class LinkedList:
      Data:
        head ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        newNode.next ← head
        head ← newNode
      End Procedure

      Procedure insertAtTail(value):
        If head = null Then
          newNode ← new Node(value)
          head ← newNode
          Return
        End If
        current ← head
        While current.next ≠ null Do
          current ← current.next
        End While
        newNode ← new Node(value)
        current.next ← newNode
      End Procedure

      Procedure insertAtIndex(index, value):
        If index = 0 Then
          insertAtHead(value)
          Return
        End If
        current ← head
        For i ← 0 To index - 1 Do
          current ← current.next
        End For
        newNode ← new Node(value)
        newNode.next ← current.next
        current.next ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return Error
        head ← head.next
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return Error
        If head.next = null Then
          head ← null
          Return
        End If
        prev ← null
        current ← head
        While current.next ≠ null Do
          prev ← current
          current ← current.next
        End While
        prev.next ← null
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        prev ← null
        current ← head
        For i ← 0 To index Do
          If i = index Then Break
          prev ← current
          current ← current.next
        End For
        prev.next ← current.next
      End Procedure

      Procedure search(value):
        current ← head
        index ← 0
        While current ≠ null Do
          If current.value = value Then Return index
          current ← current.next
          index ← index + 1
        End While
        Return -1
      End Procedure`,
    mappings: {
      [TAGS.INSERT_HEAD_START]: [10],
      [TAGS.INSERT_HEAD_CREATE]: [11],
      [TAGS.INSERT_HEAD_LINK]: [12],
      [TAGS.INSERT_HEAD_UPDATE]: [13],
      [TAGS.INSERT_HEAD_END]: [14],

      [TAGS.INSERT_TAIL_START]: [16],
      [TAGS.INSERT_TAIL_TRAVERSE]: [22, 23, 24, 25],
      [TAGS.INSERT_TAIL_CREATE]: [26],
      [TAGS.INSERT_TAIL_LINK]: [27],
      [TAGS.INSERT_TAIL_END]: [28],

      [TAGS.INSERT_INDEX_START]: [30],
      [TAGS.INSERT_INDEX_IFZERO]: [30, 31, 32],
      [TAGS.INSERT_INDEX_TRAVERSE]: [35, 36, 37, 38],
      [TAGS.INSERT_INDEX_CREATE]: [39],
      [TAGS.INSERT_INDEX_LINK]: [40, 41],
      [TAGS.INSERT_INDEX_END]: [42],

      [TAGS.DELETE_HEAD_START]: [44],
      [TAGS.DELETE_HEAD_CHECK]: [45],
      [TAGS.DELETE_HEAD_UPDATE]: [46],
      [TAGS.DELETE_HEAD_END]: [47],

      [TAGS.DELETE_TAIL_START]: [48],
      [TAGS.DELETE_TAIL_TRAVERSE]: [55, 56, 57, 58, 59],
      [TAGS.DELETE_TAIL_UNLINK]: [61],
      [TAGS.DELETE_TAIL_END]: [62],

      [TAGS.DELETE_INDEX_START]: [63],
      [TAGS.DELETE_INDEX_IFZERO]: [64, 65, 66],
      [TAGS.DELETE_INDEX_TRAVERSE]: [68, 69, 70, 71, 72, 73, 74],
      [TAGS.DELETE_INDEX_UNLINK]: [75],
      [TAGS.DELETE_INDEX_END]: [76],

      [TAGS.SEARCH_START]: [78],
      [TAGS.SEARCH_COMPARE]: [81, 82],
      [TAGS.SEARCH_FOUND]: [82],
      [TAGS.SEARCH_NEXT]: [83, 84, 85],
      [TAGS.SEARCH_NOT_FOUND]: [86],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = new_node
            return
        current = self.head
        while current.next is not None:
            current = current.next
        current.next = new_node

    def insert_at_index(self, index, value):
        if index == 0:
            self.insert_at_head(value)
            return
        new_node = Node(value)
        current = self.head
        for _ in range(index - 1):
            current = current.next
        new_node.next = current.next
        current.next = new_node

    def delete_at_head(self):
        if self.head is None: return
        self.head = self.head.next

    def delete_at_tail(self):
        if self.head is None: return
        if self.head.next is None:
            self.head = None
            return
        prev = None
        current = self.head
        while current.next is not None:
            prev = current
            current = current.next
        prev.next = None

    def delete_at_index(self, index):
        if index == 0:
            self.delete_at_head()
            return
        prev = None
        current = self.head
        for i in range(index):
            prev = current
            current = current.next
        if prev and current:
            prev.next = current.next

    def search(self, value):
        current = self.head
        index = 0
        while current:
            if current.value == value: return index
            current = current.next
            index += 1
        return -1`,
  },
};

const linkedListHasTailCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null

    Class LinkedList:
      Data:
        head ← null
        tail ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        newNode.next ← head
        head ← newNode
        If tail = null Then tail ← newNode
      End Procedure

      Procedure insertAtTail(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          tail ← newNode
          Return
        End If
        tail.next ← newNode
        tail ← newNode
      End Procedure

      Procedure insertAtIndex(index, value):
        If index = 0 Then
          insertAtHead(value)
          Return
        End If
        If tail ≠ null And index = length Then
          insertAtTail(value)
          Return
        End If
        current ← head
        For i ← 0 To index - 1 Do
          current ← current.next
        End For
        newNode ← new Node(value)
        newNode.next ← current.next
        current.next ← newNode
        If newNode.next = null Then tail ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return Error
        head ← head.next
        If head = null Then tail ← null
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return Error
        If head.next = null Then
          head ← null
          tail ← null
          Return
        End If
        prev ← null
        current ← head
        While current.next ≠ null Do
          prev ← current
          current ← current.next
        End While
        prev.next ← null
        tail ← prev
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        prev ← null
        current ← head
        For i ← 0 To index Do
          If i = index Then Break
          prev ← current
          current ← current.next
        End For
        prev.next ← current.next
        If prev.next = null Then tail ← prev
      End Procedure

      Procedure search(value):
        current ← head
        index ← 0
        While current ≠ null Do
          If current.value = value Then Return index
          current ← current.next
          index ← index + 1
        End While
        Return -1
      End Procedure`,
    mappings: {
      [TAGS.INSERT_HEAD_START]: [11],
      [TAGS.INSERT_HEAD_CREATE]: [12],
      [TAGS.INSERT_HEAD_LINK]: [13],
      [TAGS.INSERT_HEAD_UPDATE]: [14, 15],
      [TAGS.INSERT_HEAD_END]: [16],

      [TAGS.INSERT_TAIL_START]: [18],
      [TAGS.INSERT_TAIL_CREATE]: [19],
      [TAGS.INSERT_TAIL_LINK]: [25, 26],
      [TAGS.INSERT_TAIL_END]: [27],

      [TAGS.INSERT_INDEX_START]: [29],
      [TAGS.INSERT_INDEX_IFZERO]: [30, 31],
      [TAGS.INSERT_INDEX_IFTAIL]: [34, 35],
      [TAGS.INSERT_INDEX_TRAVERSE]: [38, 39, 40, 41],
      [TAGS.INSERT_INDEX_CREATE]: [42],
      [TAGS.INSERT_INDEX_LINK]: [43, 44],
      [TAGS.INSERT_INDEX_END]: [46],

      [TAGS.DELETE_HEAD_START]: [48],
      [TAGS.DELETE_HEAD_CHECK]: [49],
      [TAGS.DELETE_HEAD_UPDATE]: [50, 51],
      [TAGS.DELETE_HEAD_END]: [52],

      [TAGS.DELETE_TAIL_START]: [54],
      [TAGS.DELETE_TAIL_SINGLE]: [54, 55, 56, 57],
      [TAGS.DELETE_TAIL_TRAVERSE]: [61, 62, 63, 64, 65, 66],
      [TAGS.DELETE_TAIL_UNLINK]: [67, 68],
      [TAGS.DELETE_TAIL_END]: [69],

      [TAGS.DELETE_INDEX_START]: [71],
      [TAGS.DELETE_INDEX_IFZERO]: [72, 73, 74],
      [TAGS.DELETE_INDEX_TRAVERSE]: [76, 77, 78, 79, 80, 81, 82],
      [TAGS.DELETE_INDEX_UNLINK]: [83, 84],
      [TAGS.DELETE_INDEX_END]: [85],

      [TAGS.SEARCH_START]: [87],
      [TAGS.SEARCH_COMPARE]: [90, 91],
      [TAGS.SEARCH_FOUND]: [91],
      [TAGS.SEARCH_NEXT]: [92, 93],
      [TAGS.SEARCH_NOT_FOUND]: [95],
    },
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def insert_at_head(self, value):
        new_node = Node(value)
        new_node.next = self.head
        self.head = new_node
        if self.tail is None: self.tail = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if self.head is None:
            self.head = self.tail = new_node
            return
        self.tail.next = new_node
        self.tail = new_node

    def insert_at_index(self, index, value):
        if index == 0:
            self.insert_at_head(value)
            return
        new_node = Node(value)
        current = self.head
        for _ in range(index - 1):
            current = current.next
        new_node.next = current.next
        current.next = new_node
        if new_node.next is None: self.tail = new_node

    def delete_at_head(self):
        if self.head is None: return
        self.head = self.head.next
        if self.head is None: self.tail = None

    def delete_at_tail(self):
        if self.head is None: return
        if self.head.next is None:
            self.head = self.tail = None
            return
        prev = None
        current = self.head
        while current.next is not None:
            prev = current
            current = current.next
        prev.next = None
        self.tail = prev

    def delete_at_index(self, index):
        if index == 0:
            self.delete_at_head()
            return
        prev = None
        current = self.head
        for i in range(index):
            prev = current
            current = current.next
        if prev and current:
            prev.next = current.next
            if prev.next is None: self.tail = prev

    def search(self, value):
        current = self.head
        index = 0
        while current:
            if current.value == value: return index
            current = current.next
            index += 1
        return -1`,
  },
};

const doublyLinkedListNoTailCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null
      prev ← null

    Class DoublyLinkedList:
      Data:
        head ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
        Else
          newNode.next ← head
          head.prev ← newNode
          head ← newNode
        End If
      End Procedure

      Procedure insertAtTail(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          Return
        End If
        current ← head
        While current.next ≠ null Do
          current ← current.next
        End While
        current.next ← newNode
        newNode.prev ← current
      End Procedure

      Procedure insertAtIndex(index, value):
        If index = 0 Then
          insertAtHead(value)
          Return
        End If
        current ← head
        For i ← 0 To index - 1 Do
          current ← current.next
        End For
        newNode ← new Node(value)
        newNode.next ← current.next
        If current.next ≠ null Then current.next.prev ← newNode
        newNode.prev ← current
        current.next ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return Error
        head ← head.next
        If head ≠ null Then head.prev ← null
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return Error
        If head.next = null Then
          head ← null
          Return
        End If
        current ← head
        While current.next ≠ null Do
          current ← current.next
        End While
        current.prev.next ← null
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        current ← head
        For i ← 0 To index Do
          If i = index Then Break
          current ← current.next
        End For
        current.prev.next ← current.next
        If current.next ≠ null Then current.next.prev ← current.prev
      End Procedure

      Procedure search(value):
        current ← head
        index ← 0
        While current ≠ null Do
          If current.value = value Then Return index
          current ← current.next
          index ← index + 1
        End While
        Return -1
      End Procedure`,
    mappings: {},
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
        new_node.prev = current

    def insert_at_index(self, index, value):
        if index == 0:
            self.insert_at_head(value)
            return
        new_node = Node(value)
        current = self.head
        for _ in range(index - 1):
            current = current.next
        new_node.next = current.next
        if current.next:
            current.next.prev = new_node
        new_node.prev = current
        current.next = new_node

    def delete_at_head(self):
        if not self.head: return
        self.head = self.head.next
        if self.head:
            self.head.prev = None

    def delete_at_tail(self):
        if not self.head: return
        if not self.head.next:
            self.head = None
            return
        current = self.head
        while current.next:
            current = current.next
        current.prev.next = None

    def delete_at_index(self, index):
        if index == 0:
            self.delete_at_head()
            return
        current = self.head
        for i in range(index):
            current = current.next
        current.prev.next = current.next
        if current.next:
            current.next.prev = current.prev

    def search(self, value):
        current = self.head
        index = 0
        while current:
            if current.value == value: return index
            current = current.next
            index += 1
        return -1`,
  },
};

const doublyLinkedListHasTailCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Node:
    Data:
      value ← null
      next ← null
      prev ← null

    Class DoublyLinkedList:
      Data:
        head ← null
        tail ← null

      Procedure insertAtHead(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          tail ← newNode
        Else
          newNode.next ← head
          head.prev ← newNode
          head ← newNode
        End If
      End Procedure

      Procedure insertAtTail(value):
        newNode ← new Node(value)
        If head = null Then
          head ← newNode
          tail ← newNode
        Else
          tail.next ← newNode
          newNode.prev ← tail
          tail ← newNode
        End If
      End Procedure

      Procedure insertAtIndex(index, value):
        If index = 0 Then
          insertAtHead(value)
          Return
        End If
        If tail ≠ null And index = length Then
          insertAtTail(value)
          Return
        End If
        current ← head
        For i ← 0 To index - 1 Do
          current ← current.next
        End For
        newNode ← new Node(value)
        newNode.next ← current.next
        If current.next ≠ null Then current.next.prev ← newNode
        newNode.prev ← current
        current.next ← newNode
        If newNode.next = null Then tail ← newNode
      End Procedure

      Procedure deleteAtHead():
        If head = null Then Return Error
        head ← head.next
        If head ≠ null Then head.prev ← null
        Else tail ← null
      End Procedure

      Procedure deleteAtTail():
        If head = null Then Return Error
        If head.next = null Then
          head ← null
          tail ← null
          Return
        End If
        tail ← tail.prev
        tail.next ← null
      End Procedure

      Procedure deleteAtIndex(index):
        If index = 0 Then
          deleteAtHead()
          Return
        End If
        current ← head
        For i ← 0 To index Do
          If i = index Then Break
          current ← current.next
        End For
        current.prev.next ← current.next
        If current.next ≠ null Then current.next.prev ← current.prev
        Else tail ← current.prev
      End Procedure

      Procedure search(value):
        current ← head
        index ← 0
        While current ≠ null Do
          If current.value = value Then Return index
          current ← current.next
          index ← index + 1
        End While
        Return -1
      End Procedure`,
    mappings: {},
  },
  python: {
    content: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def insert_at_head(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node

    def insert_at_tail(self, value):
        new_node = Node(value)
        if not self.head:
            self.head = self.tail = new_node
        else:
            self.tail.next = new_node
            new_node.prev = self.tail
            self.tail = new_node

    def insert_at_index(self, index, value):
        if index == 0:
            self.insert_at_head(value)
            return
        new_node = Node(value)
        current = self.head
        for _ in range(index - 1):
            current = current.next
        new_node.next = current.next
        if current.next:
            current.next.prev = new_node
        new_node.prev = current
        current.next = new_node
        if new_node.next is None:
            self.tail = new_node

    def delete_at_head(self):
        if not self.head: return
        self.head = self.head.next
        if self.head:
            self.head.prev = None
        else:
            self.tail = None

    def delete_at_tail(self):
        if not self.head: return
        if not self.head.next:
            self.head = self.tail = None
            return
        self.tail = self.tail.prev
        self.tail.next = None

    def delete_at_index(self, index):
        if index == 0:
            self.delete_at_head()
            return
        current = self.head
        for i in range(index):
            current = current.next
        current.prev.next = current.next
        if current.next:
            current.next.prev = current.prev
        else:
            self.tail = current.prev

    def search(self, value):
        current = self.head
        index = 0
        while current:
            if current.value == value: return index
            current = current.next
            index += 1
        return -1`,
  },
};

/** LinkedList actionHandler：純資料變換，不碰 React state */
function linkedListActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: ListNodeData[],
  context: ActionContext,
): ActionResult<ListNodeData[]> | null {
  const { value, mode, index } = payload as {
    value?: number;
    mode?: string;
    index?: number;
  };
  const newData = [...data];

  const defaultParams = { isDirected: true };

  if (actionType === "switch_mode") {
    currentIsDoubly = !!payload.isDoubly; // 更新全域狀態
    return {
      animationData: data,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }

  if (actionType === "add") {
    const newId = context.nextId();
    const newNode = { id: newId, value: value! };
    const idx = index ?? -1;
    if (mode === "Head") {
      newData.unshift(newNode);
    } else if (mode === "Tail") {
      newData.push(newNode);
    } else if (mode === "Node N") {
      if (idx < 0) {
        context.toast.warning("Invalid index: Index cannot be negative.");
        return null;
      }
      if (idx > data.length) {
        context.toast.warning(
          `Index ${idx} is out of bounds. The maximum index for insertion is ${data.length}.`,
        );
        return null;
      }
      if (idx === 0) newData.unshift(newNode);
      else if (idx === data.length) newData.push(newNode);
      else newData.splice(idx, 0, newNode);
    }
    return {
      animationData: newData,
      animationParams: {
        targetId: newId,
        value,
        mode,
        index,
        ...defaultParams,
      },
    };
  }

  if (actionType === "delete") {
    if (newData.length === 0) {
      context.toast.warning("Linked List is empty");
      return null;
    }
    let deletedNode: ListNodeData | null = null;
    if (mode === "Head") {
      deletedNode = newData[0];
      if (deletedNode) newData.shift();
    } else if (mode === "Tail") {
      deletedNode = newData[newData.length - 1];
      if (deletedNode) newData.pop();
    } else if (mode === "Node N") {
      const idx = index ?? -1;
      if (idx >= 0 && idx < newData.length) {
        deletedNode = newData[idx];
        newData.splice(idx, 1);
      }
    }
    if (!deletedNode) return null;
    return {
      animationData: newData,
      animationParams: {
        targetId: deletedNode.id,
        value: deletedNode.value,
        mode,
        index,
        ...defaultParams,
      },
    };
  }

  if (actionType === "search") {
    return { animationData: data, animationParams: { ...defaultParams } };
  }

  if (actionType === "load") {
    const loadArr = (payload.data as number[]) ?? [];
    const useExistingIds = loadArr.length === data.length;
    const newDataLoad = loadArr.map((v, i) => ({
      id: useExistingIds ? data[i].id : context.nextId(),
      value: v,
    }));
    return {
      animationData: newDataLoad,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }

  if (actionType === "random") {
    const count =
      (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
    const useExistingIds = count === data.length;
    const newDataRand = Array.from({ length: count }, (_, i) => ({
      id: useExistingIds ? data[i].id : context.nextId(),
      value: Math.floor(Math.random() * 100),
    }));
    return {
      animationData: newDataRand,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }

  if (actionType === "reset") {
    const defaultData = (context.defaultData as ListNodeData[]) ?? data;
    const newDataReset = defaultData.map((d) => ({
      ...d,
      id: d.id || context.nextId(),
    }));
    return {
      animationData: newDataReset,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }

  if (actionType === "refresh") {
    return {
      animationData: data,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }

  return null;
}

export const linkedListConfig: LevelImplementationConfig = {
  id: "linkedlist",
  type: "dataStructure",
  name: "鏈結串列 (Linked List)",
  categoryName: "資料結構",
  description: "動態的線性數據結構",
  codeConfig: linkedListNoTailCodeConfig,
  getCodeConfig: (payload?: any) => {
    const isDoubly = payload?.isDoubly ?? currentIsDoubly;
    if (isDoubly) {
      return payload?.hasTailMode
        ? doublyLinkedListHasTailCodeConfig
        : doublyLinkedListNoTailCodeConfig;
    }
    return payload?.hasTailMode
      ? linkedListHasTailCodeConfig
      : linkedListNoTailCodeConfig;
  },
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  introduction: `鏈表是一種基本的線性數據結構，由一系列節點組成，每個節點包含數據和指向下一個節點的指針。
與陣列不同，鏈表的元素在記憶體中不是連續存儲的，這使得插入和刪除操作更加高效。
鏈表分為單向鏈表、雙向鏈表和循環鏈表等類型。單向鏈表的每個節點只有一個指向下一個節點的指針，
適合需要頻繁插入和刪除的場景，但訪問特定位置的元素需要從頭開始遍歷。`,
  defaultData: [
    { id: "node-1", value: 10 },
    { id: "node-2", value: 40 },
    { id: "node-3", value: 30 },
    { id: "node-4", value: 20 },
  ],
  createAnimationSteps: createLinkedListAnimationSteps,
  actionHandler: linkedListActionHandler,
  renderActionBar: (props) => <LinkedListActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 206,
      title: "Reverse Linked List",
      concept: "鏈結串列基礎操作：反轉單向鏈結串列",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/reverse-linked-list/",
    },
    {
      id: 141,
      title: "Linked List Cycle",
      concept: "快慢指標應用：檢測鏈結串列是否有環",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/linked-list-cycle/",
    },
    {
      id: 21,
      title: "Merge Two Sorted Lists",
      concept: "鏈結串列合併：合併兩個已排序的鏈結串列",
      difficulty: "Easy",
      url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    },
  ],
  maxNodes: 20,
};
