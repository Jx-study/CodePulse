import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep } from "@/types";
import {
  LinearData as ListNodeData,
  LinearAction as ActionType,
  linkNodesDoubly,
  syncPointersFromNextPrev,
} from "../../utils";
import {
  addStep,
  linkForVariant,
  wireIndexDoublyLinkNext,
  wireIndexDoublySuccPrev,
  wireIndexDoublyPredNext,
  wireIndexDoublyFull,
  getLabel,
  makeNodeAndPointers,
} from "./shared";


export function createLinkedListSteps(
  dataList: ListNodeData[],
  action: ActionType | undefined,
  TAGS: Record<string, string>,
  isDoubly: boolean,
  hasTailMode: boolean,
): AnimationStep[] {
function createInsertTailHasTailSteps(
  dataList: ListNodeData[],
  value: any,
  startX: number,
  gap: number,
  baseY: number,
  TAGS: any,
  hasTailMode: boolean,
  isDoubly: boolean,
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
  linkForVariant(actualS1OldNodes as any, isDoubly);

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

  if (isDoubly) {
    linkNodesDoubly(actualAllS2);
    actualAllS2[actualAllS2.length - 1].prev = null;
    syncPointersFromNextPrev(actualAllS2);
  } else {
    linkForVariant(actualAllS2, isDoubly);
  }

  steps.push({
    stepNumber: steps.length + 1,
    description: `tail.next = newNode (舊尾節點指向新節點)`,
    elements: allS2 as any,
    actionTag: TAGS.INSERT_TAIL_LINK,
    variables: { "tail.next": value },
  });

  if (isDoubly) {
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
      actionTag: TAGS.INSERT_TAIL_LINK_PREV,
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
  linkForVariant(actualAllS3 as any, isDoubly);

  steps.push({
    stepNumber: steps.length + 1,
    description: `tail = newNode (更新 tail 指標指向新節點)`,
    elements: allS3 as any,
    actionTag: TAGS.INSERT_TAIL_POINTER_MOVE,
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
  linkForVariant(actualS4Nodes as any, isDoubly);

  steps.push({
    stepNumber: steps.length + 1,
    description: "InsertTail 完成",
    elements: s4Elements as any,
    actionTag: TAGS.INSERT_TAIL_END_NOTNULL || TAGS.INSERT_TAIL_END,
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
  isDoubly: boolean,
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
    linkForVariant(actualNodes as any, isDoubly);

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
      linkForVariant(actualFoundNodes as any, isDoubly);

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
    linkForVariant(actualNotFoundNodes as any, isDoubly);

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
  isDoubly: boolean,
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
  linkForVariant(actualS1OldNodes as any, isDoubly);

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

  let currentStepIdx = 2; // Step 1 is CREATE

  if (isDoubly && actualAllS2.length >= 2) {
    linkNodesDoubly(actualAllS2);
    const newNode = actualAllS2[0];
    const headNode = actualAllS2[1];
    newNode.prev = null;
    headNode.prev = null;
    syncPointersFromNextPrev(actualAllS2);

    addStep(steps, {
      stepNumber: currentStepIdx++,
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
      stepNumber: currentStepIdx++,
      description: `head.prev = newNode (原頭節點 prev 回指新節點)`,
      elements: allS2b as any,
      actionTag: TAGS.INSERT_HEAD_LINK_PREV,
      variables: { "head.prev": value },
    });
  } else if (!isDoubly) {
    linkForVariant(actualAllS2, isDoubly);
    addStep(steps, {
      stepNumber: currentStepIdx++,
      description: `newNode.next = head (新節點指向原頭節點 ${oldNodesData[0]?.value ?? "null"})`,
      elements: allS2 as any,
      actionTag: TAGS.INSERT_HEAD_LINK,
      variables: {
        "newNode.next": oldNodesData[0]?.value ?? null,
        head: oldNodesData[0]?.value ?? null,
      },
    });
  } else {
    // 雙向鏈結串列且 head === null (oldNodesData.length === 0)
    // 根據虛擬碼，這裡不需要執行 newNode.next = head，直接跳過這一步
    linkForVariant(actualAllS2, isDoubly);
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
  linkForVariant(actualAllS3 as any, isDoubly);

  let updateTag = TAGS.INSERT_HEAD_UPDATE;
  if (isDoubly) {
    updateTag = oldNodesData.length === 0 ? TAGS.INSERT_HEAD_UPDATE_ISNULL : TAGS.INSERT_HEAD_UPDATE_NOTNULL;
  }

  addStep(steps, {
    stepNumber: currentStepIdx++,
    description: `head = newNode (更新 head 指標指向新節點)`,
    elements: allS3 as any,
    actionTag: updateTag,
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
    linkForVariant(actualTailNodes as any, isDoubly);

    addStep(steps, {
      stepNumber: currentStepIdx++,
      description: `原本鏈結串列為空，更新 tail 指標指向新節點`,
      elements: sTailNewElement as any,
      actionTag: TAGS.INSERT_HEAD_UPDATE_TAIL,
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
  linkForVariant(actualFinalNodes as any, isDoubly);

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
  isDoubly: boolean,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const totalLen = dataList.length;

  if (totalLen === 1) {
    const newNodeData = dataList[0];
    let currentStepIdx = 1;

    steps.push({
      stepNumber: currentStepIdx++,
      description: `檢查是否為空串列: head == null，成立`,
      elements: [] as any,
      actionTag: TAGS.INSERT_TAIL_UPDATE_ISNULL_TRUE,
      variables: { head: null },
    });

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
      description: `建立新節點`,
      elements: s1Elements as any,
      actionTag: TAGS.INSERT_TAIL_CREATE_NEW_NODE_ISNULL,
      variables: { head: null },
    });

    const updateHeadTag = TAGS.INSERT_TAIL_UPDATE_HEAD_ISNULL;

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
      actionTag: updateHeadTag,
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
        actionTag: TAGS.INSERT_TAIL_UPDATE_TAIL_ISNULL_ISNULL,
        variables: { head: value, tail: value, length: 1 },
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
      ),
    );
    const actualFinalNodes = sFinalElements.filter(
      (n: any) => !(n instanceof Pointer),
    );
    linkForVariant(actualFinalNodes as any, isDoubly);

    steps.push({
      stepNumber: currentStepIdx++,
      description: "InsertTail 完成",
      elements: sFinalElements as any,
      actionTag: TAGS.INSERT_TAIL_END_ISNULL || TAGS.INSERT_TAIL_END,
      variables: { head: value, tail: hasTailMode ? value : undefined, length: 1 },
    });

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
      isDoubly,
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
      linkForVariant(actualTraverseNodes as any, isDoubly);

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
    linkForVariant(actualNewCreateNodes as any, isDoubly);

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
    if (isDoubly) {
      linkNodesDoubly(actualAllConnect);
      actualAllConnect[actualAllConnect.length - 1].prev = null;
      syncPointersFromNextPrev(actualAllConnect);
    } else {
      linkForVariant(actualAllConnect, isDoubly);
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

    if (isDoubly) {
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
    linkForVariant(actualDoneNodes as any, isDoubly);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "InsertTail 完成",
      elements: doneElements as any,
      actionTag: TAGS.INSERT_TAIL_END_NOTNULL || TAGS.INSERT_TAIL_END,
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
  isDoubly: boolean,
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
    linkForVariant(actualCheckNodes as any, isDoubly);

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
      isDoubly,
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
    linkForVariant(actualCheckNodes as any, isDoubly);

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
      isDoubly,
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
    linkForVariant(actualTraverseNodes as any, isDoubly);

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
  linkForVariant(actualS3OldNodes as any, isDoubly);

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

  if (!isDoubly) {
    const { s4OldElements, actualS4OldNodes, s4NewElement, newNodeObj, succ } =
      buildInsertIndexS4Wire();
    linkForVariant(actualS4OldNodes, isDoubly);

    if (newNodeObj && succ) {
      newNodeObj.next = succ;
      newNodeObj.pointers = [succ];
    }

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `2. 將新節點指向原 Node ${N}`,
      elements: [...s4OldElements, ...s4NewElement] as any,
      actionTag: TAGS.INSERT_INDEX_LINK_NEW_NEXT,
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
    linkForVariant(actualS5OldNodes, isDoubly);

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
      actionTag: TAGS.INSERT_INDEX_LINK_CURRENT_NEXT,
      variables: {
        "current.next": value,
        current: oldNodesData[N - 1]?.value ?? null,
      },
    });
  } else {
    const p1 = buildInsertIndexS4Wire();
    if (p1.newNodeObj && p1.pred) {
      wireIndexDoublyLinkNext(p1.actualS4OldNodes, p1.newNodeObj, p1.succ);
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `2. 將新節點指向原 Node ${N}（newNode.next）`,
        elements: [...p1.s4OldElements, ...p1.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK_NEW_NEXT,
        variables: {
          "newNode.next": oldNodesData[N]?.value ?? null,
          current: oldNodesData[N - 1]?.value ?? null,
        },
      });

      if (p1.succ) {
        const p2 = buildInsertIndexS4Wire();
        wireIndexDoublySuccPrev(p2.actualS4OldNodes, p2.newNodeObj!, p2.succ);
        addStep(steps, {
          stepNumber: steps.length + 1,
          description: `2b. 原 Node ${N} 的 prev 回指新節點`,
          elements: [...p2.s4OldElements, ...p2.s4NewElement] as any,
          actionTag: TAGS.INSERT_INDEX_LINK_NEXT_PREV,
          variables: {
            [`node[${N}].prev`]: value,
          },
        });
      }

      const p3 = buildInsertIndexS4Wire();
      wireIndexDoublyPredNext(
        p3.actualS4OldNodes,
        p3.newNodeObj!,
        p3.pred!,
        p3.succ,
      );
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `3. Node ${N - 1} 的 next 指向新節點`,
        elements: [...p3.s4OldElements, ...p3.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK_CURRENT_NEXT,
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
        p4.succ,
      );
      addStep(steps, {
        stepNumber: steps.length + 1,
        description: `3b. 新節點 prev 回指 Node ${N - 1}`,
        elements: [...p4.s4OldElements, ...p4.s4NewElement] as any,
        actionTag: TAGS.INSERT_INDEX_LINK_NEW_PREV,
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
  linkForVariant(actualS6Nodes as any, isDoubly);

  if (hasTailMode && N === totalLen - 1) {
    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `If newNode.next = null, 成立，更新 tail`,
      elements: s6Elements as any,
      actionTag: TAGS.INSERT_INDEX_UPDATE_TAIL,
      variables: { tail: value },
    });
  }

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
  isDoubly: boolean,
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
    linkForVariant(actualCheckNodes as any, isDoubly);

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
    hasTailMode && currentLen === 0 ? "head/tail" : "head",
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
  linkForVariant(actualAllS1 as any, isDoubly);

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
    hasTailMode && currentLen === 0 ? "tail" : "", // 修改這裡
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
  if (isDoubly) {
    linkNodesDoubly(actualAllS2);
    syncPointersFromNextPrev(actualAllS2);
  } else {
    linkForVariant(actualAllS2, isDoubly);
  }

  let currentStepIdx = 2;
  steps.push({
    stepNumber: currentStepIdx++,
    description: "head = head.next (將 head 指標移至下一個節點)",
    elements: allS2 as any,
    actionTag: TAGS.DELETE_HEAD_UPDATE_HEAD,
    variables: { head: dataList[0]?.value ?? null },
  });

  // 針對雙向鏈結串列：單獨拆出 head.prev = null 的動畫
  if (isDoubly && dataList.length > 0) {
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
      description: "If head ≠ null, head.prev = null (斷開新頭節點的回指連結)",
      elements: allS3b as any,
      actionTag: TAGS.DELETE_HEAD_UPDATE_PREV,
      variables: { head: dataList[0]?.value ?? null },
    });
  }

  // 針對有 Tail 模式且串列清空時，增加 tail = null 動畫
  if (hasTailMode && dataList.length === 0) {
    // 重新建立一個不帶標籤的舊節點集合，確保 tail 指標消失
    const s2DelElementNoTail = makeNodeAndPointers(
      deletedNodeData,
      0,
      currentLen + 1,
      startX,
      baseY,
      hasTailMode,
      Status.Target,
      "", // 強制標籤為空
    );
    steps.push({
      stepNumber: currentStepIdx++,
      description: isDoubly ? "Else tail = null (串列已空，清空 tail)" : "If head = null, tail = null (串列已空，清空 tail)",
      elements: s2DelElementNoTail as any, // 使用不帶標籤的元素
      actionTag: TAGS.DELETE_HEAD_UPDATE_TAIL,
      variables: { head: null, tail: null },
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

  if (isDoubly) {
    linkNodesDoubly(actualAllS3);
    actualAllS3[0].next = null; // 斷開舊 Head 指向新 Head 的 next 箭頭
    if (actualAllS3.length > 1) {
      actualAllS3[1].prev = null; // 保持新 Head 的 prev 處於斷開狀態
    }
    syncPointersFromNextPrev(actualAllS3);
  } else {
    // 單向直接讓後面的節點互連，舊節點把 pointers 清空即可
    const restNodesOnly = s3RestElements.filter((n) => !(n instanceof Pointer));
    linkForVariant(restNodesOnly as any, isDoubly);
    actualAllS3[0].pointers = [];
  }

  steps.push({
    stepNumber: currentStepIdx++,
    description: "釋放記憶體：斷開被刪除節點的連結",
    elements: allS3 as any,
    actionTag: TAGS.DELETE_HEAD_FREE,
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
  linkForVariant(actualS4Nodes as any, isDoubly);

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
  linkForVariant(actualS5Nodes as any, isDoubly);

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
  isDoubly: boolean,
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
    linkForVariant(actualCheckNodes as any, isDoubly);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `DeleteAtIndex(${value}, ${N}): index 等於長度 ${currentLen}，執行 deleteAtTail`,
      elements: checkElements as any,
      actionTag: TAGS.DELETE_INDEX_IFTAIL,
      variables: {
        index: N,
        length: currentLen,
        condition: "index == length",
        action: "deleteAtTail",
      },
    });
  }

  if (isDoubly && hasTailMode && currentLen >= 1) {
    // 雙向鏈結串列且有 Tail：細分步驟，不再遍歷
    const preNodeData = dataList[currentLen - 1]; 
    const value = deletedNodeData.value;

    // 步驟 1：找到目標（這裡直接從 tail 開始）
    const s1Elements = [
      ...dataList.flatMap((item, idx) => 
        makeNodeAndPointers(item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode, Status.Unfinished)
      ),
      ...makeNodeAndPointers(deletedNodeData, currentLen, currentLen + 1, startX + currentLen * gap, baseY, hasTailMode, Status.Target, "tail")
    ];
    const actualS1 = s1Elements.filter(n => !(n instanceof Pointer));
    linkForVariant(actualS1 as any, isDoubly);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `DeleteTail(): 找到尾端節點 ${value}`,
      elements: s1Elements as any,
      actionTag: TAGS.DELETE_TAIL_START,
      variables: {
        current: value,
        tail: value,
      },
    });

    // 步驟 2：找到前驅節點
    const s2Elements = [
      ...dataList.flatMap((item, idx) => 
        makeNodeAndPointers(item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode, idx === currentLen - 1 ? Status.Prepare : Status.Unfinished, idx === 0 ? "head" : undefined, idx === currentLen - 1 ? "prev" : undefined)
      ),
      ...makeNodeAndPointers(deletedNodeData, currentLen, currentLen + 1, startX + currentLen * gap, baseY, hasTailMode, Status.Target, "tail")
    ];
    const actualS2 = s2Elements.filter(n => !(n instanceof Pointer));
    linkForVariant(actualS2 as any, isDoubly);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `prev = tail.prev (找到尾端節點的前驅節點)`,
      elements: s2Elements as any,
      actionTag: TAGS.DELETE_TAIL_TRAVERSE,
      variables: {
        current: value,
        prev: preNodeData.value ?? null,
      },
    });

    // 步驟 3：斷開連結
    const s3Elements = [
      ...dataList.flatMap((item, idx) => 
        makeNodeAndPointers(item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode, idx === currentLen - 1 ? Status.Target : Status.Unfinished, idx === 0 ? "head" : undefined, idx === currentLen - 1 ? "prev" : undefined)
      ),
      ...makeNodeAndPointers(deletedNodeData, currentLen, currentLen + 1, startX + currentLen * gap, baseY, hasTailMode, Status.Inactive)
    ];
    const actualS3 = s3Elements.filter(n => !(n instanceof Pointer)) as Node[];
    linkNodesDoubly(actualS3);
    actualS3[currentLen - 1].next = null;
    syncPointersFromNextPrev(actualS3);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `pre.next = null (斷開前一個節點的連結)`,
      elements: s3Elements as any,
      actionTag: TAGS.DELETE_TAIL_UNLINK,
      variables: {
        "pre.next": null,
        prev: preNodeData.value ?? null,
      },
    });

    // 步驟 4：更新 Tail
    const s4Elements = [
      ...dataList.flatMap((item, idx) => {
        let label = idx === 0 ? "head" : undefined;
        if (idx === currentLen - 1) label = (label ? label + "/" : "") + "tail";
        return makeNodeAndPointers(item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode, idx === currentLen - 1 ? Status.Target : Status.Unfinished, label, idx === currentLen - 1 ? "prev" : undefined)
      }),
      ...makeNodeAndPointers(deletedNodeData, currentLen, currentLen + 1, startX + currentLen * gap, baseY, hasTailMode, Status.Inactive, "")
    ];
    const actualS4 = s4Elements.filter(n => !(n instanceof Pointer)) as Node[];
    linkNodesDoubly(actualS4);
    actualS4[currentLen - 1].next = null;
    syncPointersFromNextPrev(actualS4);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: `tail = pre (更新 tail 指標指向新的尾節點)`,
      elements: s4Elements as any,
      actionTag: TAGS.DELETE_TAIL_END,
      variables: {
        tail: preNodeData.value ?? null,
        prev: preNodeData.value ?? null,
      },
    });

    // 步驟 5：完成
    const s5Elements = dataList.flatMap((item, i) =>
      makeNodeAndPointers(item, i, currentLen, startX + i * gap, baseY, hasTailMode, Status.Complete)
    );
    const actualS5Nodes = s5Elements.filter((n) => !(n instanceof Pointer));
    linkForVariant(actualS5Nodes as any, isDoubly);
    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "DeleteTail 完成",
      elements: s5Elements as any,
      actionTag: TAGS.DELETE_TAIL_END,
      variables: {
        tail: dataList[currentLen - 1].value ?? null,
        length: currentLen,
      },
    });

    return steps; // 關鍵修復：防止掉入下方的舊有遍歷邏輯
  } else if (isDoubly) {
    // ===== 雙向無 Tail：只用 current 遍歷，最後透過 current.prev.next 斷開 =====
    for (let i = 0; i <= currentLen; i++) {
      const isLastStep = i === currentLen;
      const traverseElements = [
        ...dataList.flatMap((item, idx) => {
          let status: Status = Status.Unfinished;
          let extra: string | undefined = undefined;
          if (idx === i) { status = Status.Prepare; extra = "current"; }
          // 最後一步：在前驅節點上顯示 current.prev 標籤
          if (isLastStep && idx === currentLen - 1) {
            status = Status.Prepare;
            extra = "current.prev";
          }
          return makeNodeAndPointers(item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode, status, undefined, extra);
        }),
        ...makeNodeAndPointers(
          deletedNodeData,
          currentLen,
          currentLen + 1,
          startX + currentLen * gap,
          baseY,
          hasTailMode,
          isLastStep ? Status.Target : Status.Unfinished,
          "",
          isLastStep ? "current" : undefined,
        ),
      ];
      const actualTraverseNodes = traverseElements.filter((n) => !(n instanceof Pointer));
      linkForVariant(actualTraverseNodes as any, isDoubly);

      addStep(steps, {
        stepNumber: steps.length + 1,
        description: i < currentLen
          ? `遍歷中：current = current.next (尋找尾端節點)`
          : `找到尾端節點 ${deletedNodeData.value}`,
        elements: traverseElements as any,
        actionTag: TAGS.DELETE_TAIL_TRAVERSE,
        variables: {
          current: i < currentLen
            ? (actualTraverseNodes[i] as any)?.value ?? null
            : deletedNodeData.value,
        },
      });
    }

    // current.prev.next = null
    const doublyUnlinkElements = [
      ...dataList.flatMap((item, idx) => {
        let extra: string | undefined = undefined;
        if (idx === currentLen - 1) extra = "current.prev";
        return makeNodeAndPointers(
          item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode,
          idx === currentLen - 1 ? Status.Target : Status.Unfinished,
          undefined, extra,
        );
      }),
      ...makeNodeAndPointers(deletedNodeData, currentLen, currentLen + 1, startX + currentLen * gap, baseY, hasTailMode, Status.Inactive, "", "current"),
    ];
    const actualDoublyUnlinkNodes = doublyUnlinkElements.filter((n) => !(n instanceof Pointer)) as Node[];
    linkNodesDoubly(actualDoublyUnlinkNodes);
    actualDoublyUnlinkNodes[currentLen - 1].next = null;
    syncPointersFromNextPrev(actualDoublyUnlinkNodes);

    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "current.prev.next = null (透過前驅的 prev 指標直接斷開連結)",
      elements: doublyUnlinkElements as any,
      actionTag: TAGS.DELETE_TAIL_UNLINK,
      variables: { "current.prev.next": null, current: deletedNodeData.value },
    });

    const doublyEndElements = dataList.flatMap((item, i) =>
      makeNodeAndPointers(item, i, currentLen, startX + i * gap, baseY, hasTailMode, Status.Complete),
    );
    const actualDoublyEndNodes = doublyEndElements.filter((n) => !(n instanceof Pointer)) as Node[];
    linkNodesDoubly(actualDoublyEndNodes);
    syncPointersFromNextPrev(actualDoublyEndNodes);
    addStep(steps, {
      stepNumber: steps.length + 1,
      description: "DeleteTail 完成",
      elements: doublyEndElements as any,
      actionTag: TAGS.DELETE_TAIL_END,
      variables: { length: currentLen },
    });
    return steps;

  } else {
    // ===== 單向鏈結：需要 pre + current 兩個指標 =====
    for (let i = 0; i < currentLen; i++) {
      const traverseElements = [
        ...dataList.flatMap((item, idx) => {
          let status: Status = Status.Unfinished;
          let extra = undefined;
          if (idx === i) { status = Status.Prepare; extra = "current"; }
          if (i > 0 && idx === i - 1) extra = "pre";
          return makeNodeAndPointers(item, idx, currentLen + 1, startX + idx * gap, baseY, hasTailMode, status, undefined, extra);
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
      const actualTraverseNodes = traverseElements.filter((n) => !(n instanceof Pointer));
      linkForVariant(actualTraverseNodes as any, isDoubly);

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
  }

  // ===== 以下為單向共用的後續步驟 =====
  const s2Elements = [
    ...dataList.flatMap((item, idx) => {
      let label = "";
      if (idx === 0) label = "head";
      let extra = undefined;
      if (idx === currentLen - 1) extra = "pre";

      return makeNodeAndPointers(
        item, idx, currentLen, startX + idx * gap, baseY, hasTailMode,
        idx === currentLen - 1 ? Status.Prepare : Status.Unfinished,
        label, extra,
      );
    }),
    ...makeNodeAndPointers(
      deletedNodeData, currentLen, currentLen + 1,
      startX + currentLen * gap, baseY, hasTailMode,
      Status.Target, "tail", "current",
    ),
  ];
  const actualS2Nodes = s2Elements.filter((n) => !(n instanceof Pointer));
  linkForVariant(actualS2Nodes as any, isDoubly);
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
        item, idx, currentLen, startX + idx * gap, baseY, hasTailMode,
        idx === currentLen - 1 ? Status.Target : Status.Unfinished,
        label, extra,
      );
    }),
    ...makeNodeAndPointers(
      deletedNodeData, currentLen, currentLen + 1,
      startX + currentLen * gap, baseY, hasTailMode,
      Status.Inactive, hasTailMode ? "tail" : "", "current",
    ),
  ];
  const actualS3Nodes = s3Elements.filter((n) => !(n instanceof Pointer));
  linkForVariant(actualS3Nodes as any, isDoubly);

  const newTailObj = actualS3Nodes.find(
    (n: any) => n.description === String(currentLen - 1),
  ) as Node | undefined;
  if (newTailObj) {
    newTailObj.next = null;
    (newTailObj as any).pointers = [];
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
          item, idx, currentLen, startX + idx * gap, baseY, hasTailMode,
          idx === currentLen - 1 ? Status.Target : Status.Unfinished,
          label, extra,
        );
      }),
      ...makeNodeAndPointers(
        deletedNodeData, currentLen, currentLen + 1,
        startX + currentLen * gap, baseY, hasTailMode,
        Status.Inactive, "", "current",
      ),
    ];
    const actualSTailNodes = sTailElements.filter((n) => !(n instanceof Pointer));
    linkForVariant(actualSTailNodes as any, isDoubly);
    const tailPreObj = actualSTailNodes.find(
      (n: any) => n.description === String(currentLen - 1),
    ) as Node | undefined;
    if (tailPreObj) {
      tailPreObj.next = null;
      (tailPreObj as any).pointers = [];
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
    makeNodeAndPointers(item, i, currentLen, startX + i * gap, baseY, hasTailMode, Status.Complete),
  );
  const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
  linkForVariant(actualS4Nodes as any, isDoubly);
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
  isDoubly: boolean,
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
    linkForVariant(actualTraverseNodes as any, isDoubly);
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
  linkForVariant(actualS3Nodes as any, isDoubly);
  const preNodeObj = actualS3Nodes.find(
    (n: any) => n.description === String(N - 1),
  );
  const nextNodeObj = actualS3Nodes.find(
    (n: any) => n.description === String(N + 1),
  );
  if (isDoubly) {
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
  if (isDoubly && nextNodeObj) {
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
    linkForVariant(actualS3bNodes as any, isDoubly);

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
    linkForVariant(actualSTailNodes as any, isDoubly);

    const preObj = actualSTailNodes.find(
      (n: any) => n.description === String(N - 1),
    );
    if (isDoubly) {
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
  linkForVariant(actualS4Nodes as any, isDoubly);
  const preNodeObj4 = actualS4Nodes.find(
    (n: any) => n.description === String(N - 1),
  );
  const nextNodeObj4 = actualS4Nodes.find(
    (n: any) => n.description === String(N + 1),
  );
  const delNodeObj4 = actualS4Nodes.find(
    (n: any) => n.description === String(N),
  );
  if (isDoubly) {
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
    actionTag: TAGS.DELETE_INDEX_END,
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
  linkForVariant(actualS5Nodes as any, isDoubly);
  addStep(steps, {
    stepNumber: steps.length + 1,
    description: "DeleteAtIndex 完成",
    elements: s5Elements as any,
    actionTag: TAGS.DELETE_INDEX_END,
    variables: { length: currentLen },
  });
  return steps;
}

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
    linkForVariant(actualNodes as any, isDoubly);

    addStep(steps, {
      stepNumber: 1,
      description: `初始${isDoubly ? "雙向" : "單向"}鏈結串列`,
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
      isDoubly,
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
        isDoubly,
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
        isDoubly,
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
        isDoubly,
      );
    }
  }
  if (type === "delete") {
    const deletedNodeData = { id: targetId || "temp-del", value: value };
    const N = actionIndex !== undefined ? actionIndex : -1;
    const isDeleteHead = mode === "Head" || (mode === "Node N" && N === 0);
    const isDeleteTail =
      mode === "Tail" || (mode === "Node N" && N === dataList.length && hasTailMode);

    // 優先處理 DeleteHead 或 DeleteAtIndex(0)，即便刪除後剩下 0 個節點也交給專門的 Head 動畫產生器
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
        isDoubly,
      );
    }

    // last element is being deleted (僅對 DeleteTail 生效，因為如果是 DeleteHead/Index(0) 已經被上方攔截了)
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
        actionTag: TAGS.DELETE_TAIL_ISNEXTNULL,
      });
      addStep(steps, {
        stepNumber: 2,
        description: hasTailMode 
        ? "移除節點，head 與 tail 設為 null" 
        : "移除節點，head 設為 null",
        elements: [],
        actionTag: TAGS.DELETE_TAIL_ISNEXTNULL_REMOVE,
      });
      addStep(steps, {
        stepNumber: 3,
        description: "刪除完成，鏈結串列目前為空",
        elements: [],
        actionTag: TAGS.DELETE_TAIL_END,
      });
      return steps;
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
        isDoubly,
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
        isDoubly,
      );
    }
  }

  return steps;
}
