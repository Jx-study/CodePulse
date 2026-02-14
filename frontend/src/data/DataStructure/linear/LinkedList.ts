import { Pointer } from "@/modules/core/DataLogic/Pointer";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep, CodeConfig } from "@/types";
import { LevelImplementationConfig } from "@/types/implementation";
import {
  LinearData as ListNodeData,
  LinearAction as ActionType,
  createNodeInstance,
  linkNodes,
} from "./utils";

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
  INSERT_HEAD_UPDATE: "INSERT_HEAD_UPDATE",
  INSERT_HEAD_END: "INSERT_HEAD_END",

  INSERT_TAIL_START: "INSERT_TAIL_START",
  INSERT_TAIL_TRAVERSE: "INSERT_TAIL_TRAVERSE",
  INSERT_TAIL_CREATE: "INSERT_TAIL_CREATE",
  INSERT_TAIL_LINK: "INSERT_TAIL_LINK",
  INSERT_TAIL_END: "INSERT_TAIL_END",

  INSERT_INDEX_START: "INSERT_INDEX_START",
  INSERT_INDEX_IFZERO: "INSERT_INDEX_IFZERO",
  INSERT_INDEX_IFTAIL: "INSERT_INDEX_IFTAIL",
  INSERT_INDEX_TRAVERSE: "INSERT_INDEX_TRAVERSE",
  INSERT_INDEX_CREATE: "INSERT_INDEX_CREATE",
  INSERT_INDEX_LINK: "INSERT_INDEX_LINK",
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
  nodeId: string,
  config: {
    isHead?: boolean;
    isTail?: boolean;
    extraLabel?: string;
  },
): Pointer[] {
  const pointers: Pointer[] = [];
  const gap = 80;
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
  createNodeAndPointers: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const oldNodesData = dataList.slice(0, -1);
  const newNodeData = dataList[dataList.length - 1];
  const totalLen = dataList.length;
  const oldLen = oldNodesData.length;

  const s1OldElements = oldNodesData.flatMap((item, i) =>
    createNodeAndPointers(
      item,
      i,
      oldLen,
      startX + i * gap,
      baseY,
      "unfinished",
    ),
  );
  const actualS1OldNodes = s1OldElements.filter(
    (n: any) => !(n instanceof Pointer),
  );
  linkNodes(actualS1OldNodes as any);

  const s1NewElement = createNodeAndPointers(
    newNodeData,
    totalLen - 1,
    totalLen,
    startX + oldLen * gap,
    baseY,
    "target",
    "",
    "new",
  );

  steps.push({
    stepNumber: 1,
    description: `InsertTail(${value}): 在尾端建立新節點並分配記憶體`,
    elements: [...s1OldElements, ...s1NewElement] as any,
    actionTag: TAGS.INSERT_TAIL_CREATE,
    variables: { value, "newNode.value": value },
  });

  const s2OldElements = oldNodesData.flatMap((item, i) =>
    createNodeAndPointers(
      item,
      i,
      oldLen,
      startX + i * gap,
      baseY,
      "unfinished",
    ),
  );
  const s2NewElement = createNodeAndPointers(
    newNodeData,
    totalLen - 1,
    totalLen,
    startX + oldLen * gap,
    baseY,
    "target",
    "",
    "new",
  );
  const allS2 = [...s2OldElements, ...s2NewElement];
  const actualAllS2 = allS2.filter((n: any) => !(n instanceof Pointer));
  linkNodes(actualAllS2 as any);

  steps.push({
    stepNumber: 2,
    description: `tail.next = newNode (舊尾節點指向新節點)`,
    elements: allS2 as any,
    actionTag: TAGS.INSERT_TAIL_LINK,
    variables: { "tail.next": value },
  });

  const s3OldElements = oldNodesData.flatMap((item, i) =>
    createNodeAndPointers(
      item,
      i,
      totalLen,
      startX + i * gap,
      baseY,
      "unfinished",
    ),
  );
  const s3NewElement = createNodeAndPointers(
    newNodeData,
    totalLen - 1,
    totalLen,
    startX + oldLen * gap,
    baseY,
    "target",
    "tail",
    "new",
  );
  const allS3 = [...s3OldElements, ...s3NewElement];
  const actualAllS3 = allS3.filter((n: any) => !(n instanceof Pointer));
  linkNodes(actualAllS3 as any);

  steps.push({
    stepNumber: 3,
    description: `tail = newNode (更新 tail 指標指向新節點)`,
    elements: allS3 as any,
    actionTag: TAGS.INSERT_TAIL_END,
    variables: { tail: value },
  });

  const s4Elements = dataList.flatMap((item, i) =>
    createNodeAndPointers(
      item,
      i,
      totalLen,
      startX + i * gap,
      baseY,
      "complete",
    ),
  );
  const actualS4Nodes = s4Elements.filter((n: any) => !(n instanceof Pointer));
  linkNodes(actualS4Nodes as any);

  steps.push({
    stepNumber: 4,
    description: "InsertTail 完成",
    elements: s4Elements as any,
    actionTag: TAGS.INSERT_TAIL_END,
    variables: { tail: value, length: totalLen },
  });

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
  createNodeAndPointers: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const newNodeData = dataList[0];
  const oldNodesData = dataList.slice(1);
  const totalLen = dataList.length;

  const createOldNodesWithHeadLabel = () =>
    oldNodesData.flatMap((item, i) => {
      let label = undefined;
      if (i === 0) {
        label = "head";
        if (hasTailMode && oldNodesData.length === 1) label = "head/tail";
      } else if (hasTailMode && i === oldNodesData.length - 1) {
        label = "tail";
      }
      return createNodeAndPointers(
        item,
        i,
        totalLen,
        startX + i * gap,
        baseY,
        "unfinished",
        label,
      );
    });

  const s1OldElements = createOldNodesWithHeadLabel();
  const actualS1OldNodes = s1OldElements.filter(
    (n: any) => !(n instanceof Pointer),
  );
  linkNodes(actualS1OldNodes as any);

  const s1NewElement = createNodeAndPointers(
    newNodeData,
    0,
    totalLen,
    startX - gap,
    baseY,
    "target",
    "",
    "new",
  );

  steps.push({
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
    if (hasTailMode && i === oldNodesData.length - 1) {
      label = (label ? label + "/" : "") + "tail";
    }
    const status = i === 0 ? "prepare" : "unfinished";

    return createNodeAndPointers(
      item,
      i + 1,
      totalLen,
      startX + i * gap,
      baseY,
      status,
      label,
    );
  });

  const s2NewElement = createNodeAndPointers(
    newNodeData,
    0,
    totalLen,
    startX - gap,
    baseY,
    "target",
    "",
    "new",
  );

  const allS2 = [...s2NewElement, ...s2OldElements];
  const actualAllS2 = allS2.filter((n: any) => !(n instanceof Pointer));
  linkNodes(actualAllS2 as any);

  steps.push({
    stepNumber: 2,
    description: `newNode.next = head (新節點指向原頭節點 ${oldNodesData[0]?.value ?? "null"})`,
    elements: allS2 as any,
    actionTag: TAGS.INSERT_HEAD_LINK,
    variables: {
      "newNode.next": oldNodesData[0]?.value ?? null,
      head: oldNodesData[0]?.value ?? null,
    },
  });

  const s3OldElements = oldNodesData.flatMap((item, i) => {
    let label = undefined;
    if (hasTailMode && i === oldNodesData.length - 1) label = "tail";
    return createNodeAndPointers(
      item,
      i + 1,
      totalLen,
      startX + i * gap,
      baseY,
      "unfinished",
      label,
    );
  });

  const s3NewElement = createNodeAndPointers(
    newNodeData,
    0,
    totalLen,
    startX - gap,
    baseY,
    "target",
    "head",
    "new",
  );

  const allS3 = [...s3NewElement, ...s3OldElements];
  const actualAllS3 = allS3.filter((n: any) => !(n instanceof Pointer));
  linkNodes(actualAllS3 as any);

  steps.push({
    stepNumber: 3,
    description: `head = newNode (更新 head 指標指向新節點)`,
    elements: allS3 as any,
    actionTag: TAGS.INSERT_HEAD_UPDATE,
    variables: {
      head: value,
    },
  });

  const s4Elements = dataList.flatMap((item, i) =>
    createNodeAndPointers(
      item,
      i,
      totalLen,
      startX + i * gap,
      baseY,
      "complete",
      undefined,
      undefined,
    ),
  );
  const actualS4Nodes = s4Elements.filter((n: any) => !(n instanceof Pointer));
  linkNodes(actualS4Nodes as any);

  steps.push({
    stepNumber: 4,
    description: "InsertHead 完成",
    elements: s4Elements as any,
    actionTag: TAGS.INSERT_HEAD_END,
    variables: {
      head: value,
      length: totalLen,
    },
  });

  return steps;
}

export function createLinkedListAnimationSteps(
  dataList: ListNodeData[],
  action?: ActionType,
  hasTailMode: boolean = false,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 200;
  const gap = 80;
  const baseY = 200;

  const createNodeAndPointers = (
    item: ListNodeData,
    i: number,
    total: number,
    x: number,
    y: number,
    status: Status = "unfinished",
    overrideLabel?: string,
    extraLabel?: string,
  ) => {
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

    const pointers = createPointers(x, y, item.id, {
      isHead,
      isTail,
      extraLabel,
    });

    (node as any).pointers = pointers;

    return [node, ...pointers];
  };

  if (!action) {
    const elements = dataList.flatMap((item, i) =>
      createNodeAndPointers(
        item,
        i,
        dataList.length,
        startX + i * gap,
        baseY,
        "unfinished",
      ),
    );
    const actualNodes = elements.filter((n) => !(n instanceof Pointer));
    linkNodes(actualNodes as any);

    steps.push({
      stepNumber: 1,
      description: "初始鏈表",
      elements: elements as any,
    });
    return steps;
  }

  const { type, value, mode, targetId, index: actionIndex } = action;

  if (type === "search") {
    const totalLen = dataList.length;
    let isFound = false;

    if (totalLen === 0) {
      steps.push({
        stepNumber: 1,
        description: "鏈結串列為空，無法搜尋",
        elements: [],
      });
      return steps;
    }

    for (let i = 0; i < totalLen; i++) {
      const compareElements = dataList.flatMap((item, idx) => {
        let status: Status = "unfinished";
        let extra = undefined;

        if (idx === i) {
          status = "prepare";
          extra = "current";
        }

        return createNodeAndPointers(
          item,
          idx,
          totalLen,
          startX + idx * gap,
          baseY,
          status,
          undefined,
          extra,
        );
      });

      const actualNodes = compareElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualNodes as any);

      steps.push({
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
          let status: Status = "unfinished";
          let extra = undefined;

          if (idx === i) {
            status = "complete";
            extra = "current";
          }

          return createNodeAndPointers(
            item,
            idx,
            totalLen,
            startX + idx * gap,
            baseY,
            status,
            undefined,
            extra,
          );
        });

        const actualFoundNodes = foundElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualFoundNodes as any);

        steps.push({
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
        createNodeAndPointers(
          item,
          idx,
          totalLen,
          startX + idx * gap,
          baseY,
          "unfinished",
        ),
      );
      const actualNotFoundNodes = notFoundElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualNotFoundNodes as any);

      steps.push({
        stepNumber: steps.length + 1,
        description: `搜尋結束：未在鏈結串列中找到數值 ${value}。`,
        elements: notFoundElements as any,
        actionTag: TAGS.SEARCH_NOT_FOUND,
        variables: {
          current: null,
          target: value,
          index: -1,
        },
      });
    }
  }

  if (type === "add" && mode === "Head") {
    return createInsertHeadSteps(
      dataList,
      value,
      hasTailMode,
      startX,
      gap,
      baseY,
      TAGS,
      createNodeAndPointers,
    );
  } else if (type === "add" && mode === "Tail") {
    const totalLen = dataList.length;

    if (totalLen === 1) {
      const newNodeData = dataList[0];

      const s1Elements = createNodeAndPointers(
        newNodeData,
        0,
        1,
        startX,
        baseY,
        "target",
        "",
        "new",
      );
      steps.push({
        stepNumber: 1,
        description: `InsertTail(${value}): 鏈結串列為空，建立新節點作為頭節點`,
        elements: s1Elements as any,
        actionTag: TAGS.INSERT_TAIL_CREATE,
        variables: { value, "newNode.value": value, head: null },
      });

      const s2Elements = createNodeAndPointers(
        newNodeData,
        0,
        1,
        startX,
        baseY,
        "complete",
        hasTailMode ? "head/tail" : "head",
      );
      steps.push({
        stepNumber: 2,
        description: `head = newNode (更新 ${hasTailMode ? "head 與 tail" : "head"} 指標指向新節點)`,
        elements: s2Elements as any,
        actionTag: TAGS.INSERT_TAIL_END,
        variables: { head: value, tail: hasTailMode ? value : null, length: 1 },
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
        createNodeAndPointers,
      );
    } else {
      for (let i = 0; i < oldNodesData.length; i++) {
        const traverseElements = oldNodesData.flatMap((item, idx) => {
          let extra = undefined;
          if (idx === i) extra = "current";

          return createNodeAndPointers(
            item,
            idx,
            oldLen,
            startX + idx * gap,
            baseY,
            idx === i ? "prepare" : "unfinished",
            undefined,
            extra,
          );
        });
        const actualTraverseNodes = traverseElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualTraverseNodes as any);

        steps.push({
          stepNumber: steps.length + 1,
          description: `遍歷中：current = current.next (目前指向節點 ${oldNodesData[i].value})`,
          elements: traverseElements as any,
          actionTag: TAGS.INSERT_TAIL_TRAVERSE,
          variables: {
            current: oldNodesData[i].value ?? null,
            index: i,
          },
        });
      }

      const sNewCreateElements = oldNodesData.flatMap((item, i) =>
        createNodeAndPointers(
          item,
          i,
          oldLen,
          startX + i * gap,
          baseY,
          i === oldLen - 1 ? "prepare" : "unfinished",
          undefined,
          i === oldLen - 1 ? "current" : undefined,
        ),
      );
      const actualNewCreateNodes = sNewCreateElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualNewCreateNodes as any);

      const sNewElement = createNodeAndPointers(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        undefined,
        "new",
      );

      steps.push({
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
        createNodeAndPointers(
          item,
          i,
          oldLen,
          startX + i * gap,
          baseY,
          i === oldLen - 1 ? "prepare" : "unfinished",
          undefined,
          i === oldLen - 1 ? "current" : undefined,
        ),
      );
      const sConnectNewElement = createNodeAndPointers(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        undefined,
        "new",
      );
      const allConnect = [...sConnectOldElements, ...sConnectNewElement];
      const actualAllConnect = allConnect.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualAllConnect as any);

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

      const doneElements = dataList.flatMap((item, i) =>
        createNodeAndPointers(
          item,
          i,
          totalLen,
          startX + i * gap,
          baseY,
          "complete",
        ),
      );
      const actualDoneNodes = doneElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualDoneNodes as any);

      steps.push({
        stepNumber: steps.length + 1,
        description: "InsertTail 完成",
        elements: doneElements as any,
        actionTag: TAGS.INSERT_TAIL_END,
        variables: {
          tail: value,
          length: totalLen,
        },
      });
    }
  }

  if (type === "add" && mode === "Node N") {
    const N = action.index !== undefined ? action.index : -1;
    const currentLen = dataList.length - 1;

    if (N < 0 || N > currentLen) {
      return [];
    }

    if (N === 0) {
      const checkElements = dataList
        .slice(1, dataList.length)
        .flatMap((item, i) =>
          createNodeAndPointers(
            item,
            i,
            currentLen,
            startX + i * gap,
            baseY,
            "unfinished",
          ),
        );
      const actualCheckNodes = checkElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualCheckNodes as any);

      steps.push({
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
        createNodeAndPointers,
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
          createNodeAndPointers(
            item,
            i,
            currentLen,
            startX + i * gap,
            baseY,
            "unfinished",
          ),
        );
      const actualCheckNodes = checkElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualCheckNodes as any);

      steps.push({
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
        createNodeAndPointers,
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
        let status: Status = "unfinished";
        if (idx <= i) status = "prepare";
        if (idx === i) status = "target";

        let extra = undefined;
        if (idx === i) extra = "current";

        return createNodeAndPointers(
          item,
          idx,
          oldLen,
          startX + idx * gap,
          baseY,
          status,
          undefined,
          extra,
        );
      });
      const actualTraverseNodes = traverseElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualTraverseNodes as any);

      steps.push({
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
      let status: Status = "unfinished";
      if (i < N) status = "prepare";
      return createNodeAndPointers(
        item,
        i,
        oldLen,
        x,
        baseY,
        status,
        undefined,
        i === N - 1 ? "current" : undefined,
      );
    });
    const actualS2Nodes = s2Elements.filter((n) => !(n instanceof Pointer));
    linkNodes(actualS2Nodes as any);

    steps.push({
      stepNumber: steps.length + 1,
      description: `1. 將 Node ${N} 及其後節點右移，騰出空間`,
      elements: s2Elements as any,
      actionTag: TAGS.INSERT_INDEX_TRAVERSE,
      variables: {
        current: oldNodesData[N - 1]?.value ?? null,
        index: N - 1,
      },
    });

    const s3OldElements = oldNodesData.flatMap((item, i) => {
      let x = startX + i * gap;
      if (i >= N) x += gap;
      let status: Status = "unfinished";
      if (i < N) status = "prepare";
      return createNodeAndPointers(
        item,
        i,
        oldLen,
        x,
        baseY,
        status,
        undefined,
        i === N - 1 ? "current" : undefined,
      );
    });
    const actualS3OldNodes = s3OldElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkNodes(actualS3OldNodes as any);

    const s3NewElement = createNodeAndPointers(
      newNodeData,
      N,
      totalLen,
      startX + N * gap,
      baseY - 60,
      "target",
      undefined,
      "new",
    );

    steps.push({
      stepNumber: steps.length + 1,
      description: `2. 建立新節點 ${value}`,
      elements: [...s3OldElements, ...s3NewElement] as any,
      actionTag: TAGS.INSERT_INDEX_CREATE,
      variables: {
        "newNode.value": value,
        current: oldNodesData[N - 1]?.value ?? null,
      },
    });

    const s4OldElements = oldNodesData.flatMap((item, i) => {
      let x = startX + i * gap;
      if (i >= N) x += gap;
      return createNodeAndPointers(
        item,
        i,
        oldLen,
        x,
        baseY,
        i < N ? "prepare" : "unfinished",
        undefined,
        i === N - 1 ? "current" : undefined,
      );
    });
    const actualS4OldNodes = s4OldElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkNodes(actualS4OldNodes as any);

    const s4NewElement = createNodeAndPointers(
      newNodeData,
      N,
      totalLen,
      startX + N * gap,
      baseY - 60,
      "target",
      undefined,
      "new",
    );

    const newNodeObj4 = s4NewElement.find(
      (n) => !(n instanceof Pointer),
    ) as any;
    const nextNodeObj4 = actualS4OldNodes.find(
      (n: any) => n.description === String(N),
    );
    if (newNodeObj4 && nextNodeObj4) {
      newNodeObj4.pointers = [nextNodeObj4];
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `3. 將新節點指向原 Node ${N}`,
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
      return createNodeAndPointers(
        item,
        i,
        oldLen,
        x,
        baseY,
        i < N ? "prepare" : "unfinished",
        undefined,
        i === N - 1 ? "current" : undefined,
      );
    });
    const actualS5OldNodes = s5OldElements.filter(
      (n) => !(n instanceof Pointer),
    );
    linkNodes(actualS5OldNodes as any);

    const s5NewElement = createNodeAndPointers(
      newNodeData,
      N,
      totalLen,
      startX + N * gap,
      baseY - 60,
      "target",
      undefined,
      "new",
    );
    const newNodeObj5 = s5NewElement.find(
      (n) => !(n instanceof Pointer),
    ) as any;
    const nextNodeObj5 = actualS5OldNodes.find(
      (n: any) => n.description === String(N),
    );
    if (newNodeObj5 && nextNodeObj5) {
      newNodeObj5.pointers = [nextNodeObj5];
    }

    const prevNodeObj5 = actualS5OldNodes.find(
      (n: any) => n.description === String(N - 1),
    ) as any;
    if (prevNodeObj5 && newNodeObj5) {
      prevNodeObj5.pointers = [newNodeObj5];
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `4. 將 Node ${N - 1} 指向新節點`,
      elements: [...s5OldElements, ...s5NewElement] as any,
      actionTag: TAGS.INSERT_INDEX_LINK,
      variables: {
        "current.next": value,
        current: oldNodesData[N - 1]?.value ?? null,
      },
    });

    const s6Elements = dataList.flatMap((item, i) =>
      createNodeAndPointers(
        item,
        i,
        totalLen,
        startX + i * gap,
        baseY,
        "complete",
      ),
    );
    const actualS6Nodes = s6Elements.filter((n) => !(n instanceof Pointer));
    linkNodes(actualS6Nodes as any);

    steps.push({
      stepNumber: steps.length + 1,
      description: "InsertAtIndex 完成",
      elements: s6Elements as any,
      actionTag: TAGS.INSERT_INDEX_END,
      variables: {
        length: totalLen,
      },
    });
  }

  if (type === "delete") {
    const deletedNodeData = {
      id: targetId || "temp-del",
      value: value,
    };
    const currentLen = dataList.length;
    const originalLen = currentLen + 1;
    const N = actionIndex !== undefined ? actionIndex : -1;
    const isDeleteHead = mode === "Head" || (mode === "Node N" && N === 0);
    const isDeleteTail =
      mode === "Tail" || (mode === "Node N" && N === currentLen);

    if (currentLen === 1) {
      const s1DelElement = createNodeAndPointers(
        deletedNodeData,
        0,
        1,
        startX,
        baseY,
        "target",
        "head/tail",
      );
      steps.push({
        stepNumber: 1,
        description: "Delete: 鏈結串列只有一個節點，標記準備刪除",
        elements: s1DelElement,
        actionTag: TAGS.DELETE_TAIL_SINGLE,
      });
      steps.push({
        stepNumber: 2,
        description: "移除節點，head 設為 null",
        elements: [],
        actionTag: TAGS.DELETE_TAIL_SINGLE,
      });
      steps.push({
        stepNumber: 3,
        description: "刪除完成，鏈結串列目前為空",
        elements: [],
        actionTag: TAGS.DELETE_TAIL_END,
      });
      return steps;
    }

    if (isDeleteHead) {
      if (mode === "Node N") {
        const fullList = [deletedNodeData, ...dataList];
        const checkElements = fullList.flatMap((item, i) =>
          createNodeAndPointers(
            item,
            i,
            originalLen,
            startX + i * gap,
            baseY,
            "unfinished",
          ),
        );
        const actualCheckNodes = checkElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualCheckNodes as any);

        steps.push({
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

      const s1DelElement = createNodeAndPointers(
        deletedNodeData,
        0,
        currentLen + 1,
        startX,
        baseY,
        "target",
        "head",
      );
      const s1RestElements = dataList.flatMap((item, i) =>
        createNodeAndPointers(
          item,
          i + 1,
          currentLen + 1,
          startX + (i + 1) * gap,
          baseY,
          "unfinished",
        ),
      );
      const allS1 = [...s1DelElement, ...s1RestElements];
      const actualAllS1 = allS1.filter((n) => !(n instanceof Pointer));
      linkNodes(actualAllS1 as any);

      steps.push({
        stepNumber: 1,
        description: `DeleteHead(): 標記頭節點 ${deletedNodeData.value} 準備刪除`,
        elements: allS1 as any,
        actionTag: TAGS.DELETE_HEAD_START,
        variables: { head: deletedNodeData.value },
      });

      const s2DelElement = createNodeAndPointers(
        deletedNodeData,
        0,
        currentLen + 1,
        startX,
        baseY,
        "target",
        "",
      );
      const s2RestElements = dataList.flatMap((item, i) => {
        let label = undefined;
        if (i === 0) label = "head";
        if (hasTailMode && i === currentLen - 1) label = "tail";
        if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";
        return createNodeAndPointers(
          item,
          i + 1,
          currentLen + 1,
          startX + (i + 1) * gap,
          baseY,
          i === 0 ? "prepare" : "unfinished",
          label,
        );
      });
      const allS2 = [...s2DelElement, ...s2RestElements];
      const actualAllS2 = allS2.filter((n) => !(n instanceof Pointer));
      linkNodes(actualAllS2 as any);

      steps.push({
        stepNumber: 2,
        description: "head = head.next (將 head 指標移至下一個節點)",
        elements: allS2 as any,
        actionTag: TAGS.DELETE_HEAD_UPDATE,
        variables: { head: dataList[0]?.value ?? null },
      });

      const s3DelElement = createNodeAndPointers(
        deletedNodeData,
        0,
        currentLen + 1,
        startX,
        baseY,
        "inactive",
        "",
      );
      const delNodeObj = s3DelElement.find(
        (n) => !(n instanceof Pointer),
      ) as any;
      if (delNodeObj) delNodeObj.pointers = [];

      const s3RestElements = dataList.flatMap((item, i) => {
        let label = undefined;
        if (i === 0) label = "head";
        if (hasTailMode && i === currentLen - 1) label = "tail";
        if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";
        return createNodeAndPointers(
          item,
          i + 1,
          currentLen + 1,
          startX + (i + 1) * gap,
          baseY,
          i === 0 ? "prepare" : "unfinished",
          label,
        );
      });
      const actualS3RestNodes = s3RestElements.filter(
        (n) => !(n instanceof Pointer),
      );
      linkNodes(actualS3RestNodes as any);

      steps.push({
        stepNumber: 3,
        description: "釋放記憶體：斷開被刪除節點的連結",
        elements: [...s3DelElement, ...s3RestElements] as any,
        actionTag: TAGS.DELETE_HEAD_UPDATE,
        variables: { head: dataList[0]?.value ?? null },
      });

      const s4Elements = dataList.flatMap((item, i) =>
        createNodeAndPointers(
          item,
          i,
          currentLen,
          startX + (i + 1) * gap,
          baseY,
          "prepare",
        ),
      );
      const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS4Nodes as any);
      steps.push({
        stepNumber: 4,
        description: "移除舊節點實體",
        elements: s4Elements as any,
        actionTag: TAGS.DELETE_HEAD_END,
        variables: { head: dataList[0]?.value ?? null, length: currentLen },
      });

      const s5Elements = dataList.flatMap((item, i) =>
        createNodeAndPointers(
          item,
          i,
          currentLen,
          startX + i * gap,
          baseY,
          "complete",
        ),
      );
      const actualS5Nodes = s5Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS5Nodes as any);
      steps.push({
        stepNumber: 5,
        description: "DeleteHead 完成",
        elements: s5Elements as any,
        actionTag: TAGS.DELETE_HEAD_END,
        variables: { head: dataList[0]?.value ?? null, length: currentLen },
      });
    } else if (isDeleteTail) {
      if (mode === "Node N") {
        const fullList = [...dataList, deletedNodeData];
        const checkElements = fullList.flatMap((item, i) =>
          createNodeAndPointers(
            item,
            i,
            originalLen,
            startX + i * gap,
            baseY,
            "unfinished",
          ),
        );
        const actualCheckNodes = checkElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualCheckNodes as any);

        steps.push({
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
            let status: Status = "unfinished";
            let extra = undefined;
            if (idx === i) {
              status = "prepare";
              extra = "current";
            }
            if (i > 0 && idx === i - 1) {
              extra = "pre";
            }
            return createNodeAndPointers(
              item,
              idx,
              currentLen + 1,
              startX + idx * gap,
              baseY,
              status,
              undefined,
              extra,
            );
          }),
          ...createNodeAndPointers(
            deletedNodeData,
            currentLen,
            currentLen + 1,
            startX + currentLen * gap,
            baseY,
            i === currentLen ? "target" : "unfinished",
            hasTailMode ? "tail" : "",
          ),
        ];
        const actualTraverseNodes = traverseElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualTraverseNodes as any);

        steps.push({
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

          return createNodeAndPointers(
            item,
            idx,
            currentLen,
            startX + idx * gap,
            baseY,
            idx === currentLen - 1 ? "prepare" : "unfinished",
            label,
            extra,
          );
        }),
        ...createNodeAndPointers(
          deletedNodeData,
          currentLen,
          currentLen + 1,
          startX + currentLen * gap,
          baseY,
          "target",
          "tail",
          "current",
        ),
      ];
      const actualS2Nodes = s2Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS2Nodes as any);
      steps.push({
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
          return createNodeAndPointers(
            item,
            idx,
            currentLen,
            startX + idx * gap,
            baseY,
            idx === currentLen - 1 ? "target" : "unfinished",
            label,
            extra,
          );
        }),
        ...createNodeAndPointers(
          deletedNodeData,
          currentLen,
          currentLen + 1,
          startX + currentLen * gap,
          baseY,
          "inactive",
          hasTailMode ? "tail" : "",
          "current",
        ),
      ];
      const actualS3Nodes = s3Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS3Nodes as any);

      const newTailObj = actualS3Nodes.find(
        (n: any) => n.description === String(currentLen - 1),
      ) as any;
      if (newTailObj) newTailObj.pointers = [];

      steps.push({
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
            if (idx === currentLen - 1)
              label = (label ? label + "/" : "") + "tail";
            let extra = undefined;
            if (idx === currentLen - 1) extra = "pre";
            return createNodeAndPointers(
              item,
              idx,
              currentLen,
              startX + idx * gap,
              baseY,
              idx === currentLen - 1 ? "target" : "unfinished",
              label,
              extra,
            );
          }),
          ...createNodeAndPointers(
            deletedNodeData,
            currentLen,
            currentLen + 1,
            startX + currentLen * gap,
            baseY,
            "inactive",
            "",
            "current",
          ),
        ];
        const actualSTailNodes = sTailElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualSTailNodes as any);
        const tailPreObj = actualSTailNodes.find(
          (n: any) => n.description === String(currentLen - 1),
        ) as any;
        if (tailPreObj) tailPreObj.pointers = [];

        steps.push({
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
        createNodeAndPointers(
          item,
          i,
          currentLen,
          startX + i * gap,
          baseY,
          "complete",
        ),
      );
      const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS4Nodes as any);
      steps.push({
        stepNumber: steps.length + 1,
        description: "DeleteTail 完成",
        elements: s4Elements as any,
        actionTag: TAGS.DELETE_TAIL_END,
        variables: {
          tail: dataList[currentLen - 1].value ?? null,
          length: currentLen,
        },
      });
    } else if (mode === "Node N") {
      const oldList = [...dataList];
      oldList.splice(N, 0, deletedNodeData);

      for (let i = 0; i <= N; i++) {
        const traverseElements = oldList.flatMap((item, idx) => {
          let status: Status = "unfinished";
          if (idx === i - 1) status = "prepare";
          if (idx === i) status = "target";
          let extra = idx === i ? "current" : undefined;

          let override = undefined;
          if (i > 0 && idx === i - 1)
            override = getLabel(idx, originalLen, hasTailMode) + "/pre";

          return createNodeAndPointers(
            item,
            idx,
            originalLen,
            startX + idx * gap,
            baseY,
            status,
            override,
            extra,
          );
        });
        const actualTraverseNodes = traverseElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualTraverseNodes as any);
        steps.push({
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
        if (idx === N - 1)
          label = getLabel(idx, originalLen, hasTailMode) + "pre";
        let extra = idx === N ? "current" : undefined;
        let status: Status = idx === N - 1 ? "prepare" : "unfinished";
        if (idx === N) status = "target";
        return createNodeAndPointers(
          item,
          idx,
          originalLen,
          startX + idx * gap,
          y,
          status,
          label,
          extra,
        );
      });
      const actualS2Nodes = s2Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS2Nodes as any);
      steps.push({
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
        let extra = idx === N ? "current" : undefined;
        let status: Status = idx === N - 1 ? "prepare" : "unfinished";
        if (idx === N) status = "target";
        return createNodeAndPointers(
          item,
          idx,
          originalLen,
          startX + idx * gap,
          y,
          status,
          label,
          extra,
        );
      });
      const actualS3Nodes = s3Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS3Nodes as any);
      const preNodeObj = actualS3Nodes.find(
        (n: any) => n.description === String(N - 1),
      );
      const nextNodeObj = actualS3Nodes.find(
        (n: any) => n.description === String(N + 1),
      );
      const delNodeObj = actualS3Nodes.find(
        (n: any) => n.description === String(N),
      );
      if (preNodeObj && nextNodeObj)
        (preNodeObj as any).pointers = [nextNodeObj];
      if (delNodeObj && nextNodeObj)
        (delNodeObj as any).pointers = [nextNodeObj];

      steps.push({
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

      if (hasTailMode && N === originalLen - 1) {
        const sTailElements = oldList.flatMap((item, idx) => {
          let y = baseY;
          if (idx === N) y = baseY - 60;
          let label =
            idx === N - 1
              ? getLabel(idx, originalLen, hasTailMode) + "pre/tail"
              : undefined;
          let extra = idx === N ? "current" : undefined;
          let status: Status = idx === N - 1 ? "prepare" : "unfinished";
          if (idx === N) status = "target";
          return createNodeAndPointers(
            item,
            idx,
            originalLen,
            startX + idx * gap,
            y,
            status,
            label,
            extra,
          );
        });
        const actualSTailNodes = sTailElements.filter(
          (n) => !(n instanceof Pointer),
        );
        linkNodes(actualSTailNodes as any);

        const preObj = actualSTailNodes.find(
          (n: any) => n.description === String(N - 1),
        );
        const nextObj = actualSTailNodes.find(
          (n: any) => n.description === String(N + 1),
        );
        if (preObj && nextObj) (preObj as any).pointers = [nextObj];

        steps.push({
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
        let extra = idx === N ? "current" : undefined;
        let status: Status = idx === N - 1 ? "prepare" : "unfinished";
        if (idx === N) status = "target";
        return createNodeAndPointers(
          item,
          idx,
          originalLen,
          startX + idx * gap,
          y,
          status,
          label,
          extra,
        );
      });
      const actualS4Nodes = s4Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS4Nodes as any);
      const preNodeObj4 = actualS4Nodes.find(
        (n: any) => n.description === String(N - 1),
      );
      const nextNodeObj4 = actualS4Nodes.find(
        (n: any) => n.description === String(N + 1),
      );
      const delNodeObj4 = actualS4Nodes.find(
        (n: any) => n.description === String(N),
      );
      if (preNodeObj4 && nextNodeObj4)
        (preNodeObj4 as any).pointers = [nextNodeObj4];
      if (delNodeObj4) (delNodeObj4 as any).pointers = [];

      steps.push({
        stepNumber: steps.length + 1,
        description: "釋放記憶體：斷開被刪除節點的連結",
        elements: s4Elements as any,
        actionTag: TAGS.DELETE_INDEX_UNLINK,
        variables: {
          "current.next": null,
          nodeToDelete: oldList[N].value ?? null,
        },
      });

      const s5Elements = dataList.flatMap((item, idx) =>
        createNodeAndPointers(
          item,
          idx,
          currentLen,
          startX + idx * gap,
          baseY,
          "complete",
        ),
      );
      const actualS5Nodes = s5Elements.filter((n) => !(n instanceof Pointer));
      linkNodes(actualS5Nodes as any);
      steps.push({
        stepNumber: steps.length + 1,
        description: "DeleteAtIndex 完成",
        elements: s5Elements as any,
        actionTag: TAGS.DELETE_INDEX_END,
        variables: { length: currentLen },
      });
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

export const linkedListConfig: LevelImplementationConfig = {
  id: "linkedlist",
  type: "dataStructure",
  name: "鏈結串列 (Linked List)",
  categoryName: "線性表",
  description: "動態的線性數據結構",
  codeConfig: linkedListNoTailCodeConfig,
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
  getCodeConfig: (payload?: any) => {
    return payload?.hasTailMode
      ? linkedListHasTailCodeConfig
      : linkedListNoTailCodeConfig;
  },
};
