import { Node } from "@/modules/core/DataLogic/Node";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { AnimationStep, DataStructureConfig, CodeConfig } from "@/types";
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
  extra: string = ""
): string {
  const labels: string[] = [];
  if (index === 0) labels.push("head");
  if (hasTailMode && index === totalLength - 1) labels.push("tail");
  if (extra) labels.push(extra);

  // 如果有多個標籤用 / 分隔 (例如 "head/tail")
  return labels.length > 0 ? labels.join("/") : "";
}

export function createLinkedListAnimationSteps(
  dataList: ListNodeData[],
  action?: ActionType,
  hasTailMode: boolean = false
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const startX = 200;
  const gap = 80;
  const baseY = 200;

  const createNode = (
    item: ListNodeData,
    i: number, // 傳入目前的 index
    total: number, // 傳入目前的總長度
    x: number,
    y: number,
    status: Status = "unfinished",
    overrideLabel?: string,
    extraLabel?: string
  ) => {
    const label =
      overrideLabel !== undefined
        ? overrideLabel
        : getLabel(i, total, hasTailMode, extraLabel);

    return createNodeInstance(item.id, item.value, x, y, status, label);
  };

  // 初始/靜態渲染
  if (!action) {
    const nodes = dataList.map((item, i) =>
      createNode(
        item,
        i,
        dataList.length,
        startX + i * gap,
        baseY,
        "unfinished"
      )
    );
    linkNodes(nodes);
    steps.push({ stepNumber: 1, description: "初始鏈表", elements: nodes });
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

    // 開始遍歷
    for (let i = 0; i < totalLen; i++) {
      // Step A: 比較中 (Highlight current node)
      const compareNodes = dataList.map((item, idx) => {
        let status: Status = "unfinished";
        let extra = undefined;

        // 當前遍歷到的節點
        if (idx === i) {
          status = "prepare"; // 橘色/準備狀態代表 "Comparing"
          extra = "tmp"; // 顯示 tmp 標籤
        }

        return createNode(
          item,
          idx,
          totalLen,
          startX + idx * gap,
          baseY,
          status,
          undefined,
          extra
        );
      });
      linkNodes(compareNodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: `遍歷 node ${i}：比較 ${dataList[i].value} 是否等於目標值 ${value}`,
        elements: compareNodes,
      });

      // Step B: 檢查是否符合
      if (dataList[i].value === value) {
        isFound = true;

        const foundNodes = dataList.map((item, idx) => {
          let status: Status = "unfinished";
          let extra = undefined;

          if (idx === i) {
            status = "complete";
            extra = "tmp";
          }

          return createNode(
            item,
            idx,
            totalLen,
            startX + idx * gap,
            baseY,
            status,
            undefined,
            extra
          );
        });
        linkNodes(foundNodes);

        steps.push({
          stepNumber: steps.length + 1,
          description: `搜尋成功！在第 ${i} 個節點 (index ${i}) 找到數值 ${value}。`,
          elements: foundNodes,
        });

        break;
      }
    }

    if (!isFound) {
      const notFoundNodes = dataList.map((item, idx) =>
        createNode(item, idx, totalLen, startX + idx * gap, baseY, "unfinished")
      );
      linkNodes(notFoundNodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: `搜尋結束：未在鏈結串列中找到數值 ${value}。`,
        elements: notFoundNodes,
      });
    }
  }

  // --- Insert Head 邏輯 ---
  if (type === "add" && mode === "Head") {
    const newNodeData = dataList[0];
    const oldNodesData = dataList.slice(1);
    const totalLen = dataList.length;

    const createOldNodesWithHeadLabel = () =>
      oldNodesData.map((item, i) => {
        let label = undefined;
        // 強制保留 head 標籤在舊的第一個節點上
        if (i === 0) {
          label = "head";
          if (hasTailMode && oldNodesData.length === 1) label = "head/tail";
        } else if (hasTailMode && i === oldNodesData.length - 1) {
          label = "tail";
        }
        return createNode(
          item,
          i + 1,
          totalLen,
          startX + i * gap,
          baseY,
          "unfinished",
          label
        );
      });

    // --- Step 1: 新增節點 (Appear) ---
    const s1OldNodes = createOldNodesWithHeadLabel();
    linkNodes(s1OldNodes);

    const s1NewNode = createNode(
      newNodeData,
      0,
      totalLen,
      startX - gap,
      baseY,
      "target",
      "new"
    );

    steps.push({
      stepNumber: 1,
      description: `1. 建立新節點 ${value}`,
      elements: [s1NewNode, ...s1OldNodes],
    });

    // --- Step 2: 連接箭頭 (Connect) ---
    // 狀態：新節點仍是 "new"，舊 Head 仍是 "head"，位置不變
    const s2OldNodes = oldNodesData.map((item, i) => {
      let label = undefined;
      if (i === 0) label = "head";
      if (hasTailMode && i === oldNodesData.length - 1) {
        label = (label ? label + "/" : "") + "tail";
      }

      // 這裡加入狀態判斷：如果是原 Head (i===0)，狀態改為 "prepare"
      const status = i === 0 ? "prepare" : "unfinished";

      return createNode(
        item,
        i + 1,
        totalLen,
        startX + i * gap,
        baseY,
        status,
        label
      );
    });
    const s2NewNode = createNode(
      newNodeData,
      0,
      totalLen,
      startX - gap,
      baseY,
      "target",
      "new"
    );
    const allS2 = [s2NewNode, ...s2OldNodes];
    linkNodes(allS2); // 建立連線

    steps.push({
      stepNumber: 2,
      description: "2. 建立連線指向原 Head",
      elements: allS2,
    });

    // --- Step 3: 轉移 Head 標籤 (Label Transfer) ---
    // 狀態：新節點變成 "head"，舊 Head 失去標籤
    const createOldNodesStep3 = () =>
      oldNodesData.map((item, i) => {
        let label = undefined;
        if (hasTailMode && i === oldNodesData.length - 1) label = "tail";
        return createNode(
          item,
          i + 1,
          totalLen,
          startX + i * gap,
          baseY,
          "unfinished",
          label
        );
      });
    const s3OldNodes = createOldNodesStep3();
    const s3NewNode = createNode(
      newNodeData,
      0,
      totalLen,
      startX - gap,
      baseY,
      "target",
      "head"
    ); // 這裡強制變 head
    const allS3 = [s3NewNode, ...s3OldNodes];
    linkNodes(allS3);

    steps.push({
      stepNumber: 3,
      description: "3. 更新 Head 指標指向新節點",
      elements: allS3,
    });

    // --- Step 4: 完成並位移 (Shift & Complete) ---
    // 狀態：使用標準 generate 邏輯，所有節點右移歸位
    const s4Nodes = dataList.map((item, i) =>
      createNode(item, i, totalLen, startX + i * gap, baseY, "complete")
    );
    linkNodes(s4Nodes);

    steps.push({
      stepNumber: 4,
      description: "4. 調整節點位置，新增完成",
      elements: s4Nodes,
    });
  }

  // --- Insert Tail 邏輯 ---
  else if (type === "add" && mode === "Tail") {
    const oldNodesData = dataList.slice(0, -1); // 排除最後一個(剛新增的)
    const newNodeData = dataList[dataList.length - 1];
    const totalLen = dataList.length;
    const oldLen = oldNodesData.length;

    // ----- 情境 A: 有 Tail Mode (直接插入，無遍歷) -----
    if (hasTailMode) {
      // --- Step 1: 建立新節點 ---
      // 舊 Tail 保持 "tail" 標籤
      const s1OldNodes = oldNodesData.map((item, i) =>
        createNode(item, i, oldLen, startX + i * gap, baseY, "unfinished")
      );
      linkNodes(s1OldNodes);

      // 新節點標籤 "new"
      const s1NewNode = createNode(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        "new"
      );

      steps.push({
        stepNumber: 1,
        description: `1. 直接在 Tail 後建立新節點 ${value}`,
        elements: [...s1OldNodes, s1NewNode],
      });

      // --- Step 2: 連接箭頭 ---
      const s2OldNodes = oldNodesData.map((item, i) =>
        createNode(item, i, oldLen, startX + i * gap, baseY, "unfinished")
      );
      const s2NewNode = createNode(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        "new"
      );
      const allS2 = [...s2OldNodes, s2NewNode];
      linkNodes(allS2);

      steps.push({
        stepNumber: 2,
        description: "2. 將舊 Tail 指向新節點",
        elements: allS2,
      });

      // --- Step 3: 轉移 Tail 標籤 ---
      // 舊節點使用 totalLen 渲染 -> 舊 Tail 失去 "tail" 標籤
      const s3OldNodes = oldNodesData.map((item, i) =>
        createNode(item, i, totalLen, startX + i * gap, baseY, "unfinished")
      );
      // 新節點獲得 "tail" 標籤
      const s3NewNode = createNode(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        "tail"
      );
      const allS3 = [...s3OldNodes, s3NewNode];
      linkNodes(allS3);

      steps.push({
        stepNumber: 3,
        description: "3. 更新 Tail 指標指向新節點",
        elements: allS3,
      });

      // --- Step 4: 完成 ---
      const s4Nodes = dataList.map((item, i) =>
        createNode(item, i, totalLen, startX + i * gap, baseY, "complete")
      );
      linkNodes(s4Nodes);

      steps.push({
        stepNumber: 4,
        description: "4. 新增完成",
        elements: s4Nodes,
      });
    }

    // ----- 情境 B: 無 Tail Mode (需要遍歷) -----
    else {
      // --- Step 1 ~ N: 遍歷過程 ---
      for (let i = 0; i < oldNodesData.length; i++) {
        const traverseNodes = oldNodesData.map((item, idx) => {
          let extra = undefined;
          if (idx === i) extra = "tmp";
          // 未來如果是 Node N 且 idx === i-1 可以設 extra = "pre"

          return createNode(
            item,
            idx,
            oldLen,
            startX + idx * gap,
            baseY,
            idx === i ? "prepare" : "unfinished",
            undefined, // overrideLabel
            extra // extraLabel
          );
        });
        linkNodes(traverseNodes);

        steps.push({
          stepNumber: steps.length + 1,
          description: `遍歷中：tmp 指向節點 ${oldNodesData[i].value}`,
          elements: traverseNodes,
        });
      }

      // --- Step N+1: 建立新節點 ---
      const sNewCreateNodes = oldNodesData.map((item, i) =>
        createNode(
          item,
          i,
          oldLen,
          startX + i * gap,
          baseY,
          i === oldLen - 1 ? "prepare" : "unfinished",
          undefined, // overrideLabel
          i === oldLen - 1 ? "tmp" : undefined // extraLabel
        )
      );
      linkNodes(sNewCreateNodes);

      const sNewNode = createNode(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        "new"
      );

      steps.push({
        stepNumber: steps.length + 1,
        description: `找到尾端，建立新節點 ${value}`,
        elements: [...sNewCreateNodes, sNewNode],
      });

      // --- Step N+2: 連接 ---
      const sConnectOldNodes = oldNodesData.map((item, i) =>
        createNode(
          item,
          i,
          oldLen,
          startX + i * gap,
          baseY,
          i === oldLen - 1 ? "prepare" : "unfinished",
          undefined, // overrideLabel
          i === oldLen - 1 ? "tmp" : undefined // extraLabel
        )
      );
      const sConnectNewNode = createNode(
        newNodeData,
        totalLen - 1,
        totalLen,
        startX + oldLen * gap,
        baseY,
        "target",
        "new"
      );
      const allConnect = [...sConnectOldNodes, sConnectNewNode];
      linkNodes(allConnect);

      steps.push({
        stepNumber: steps.length + 1,
        description: "連接新節點",
        elements: allConnect,
      });

      // --- Step N+3: 完成 ---
      const doneNodes = dataList.map((item, i) =>
        createNode(item, i, totalLen, startX + i * gap, baseY, "complete")
      );
      linkNodes(doneNodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: "插入完成",
        elements: doneNodes,
      });
    }
  }
  if (type === "add" && mode === "Node N") {
    const N = action.index !== undefined ? action.index : -1;

    // 雖然 Tutorial.tsx 有防呆，這裡保險起見再做一次資料分割
    // dataList 已經是插入後的結果，我們需要還原出舊的列表
    // 在 handleAddNode 中我們是 splice(N+1, 0, newNode)
    // 所以 dataList[N+1] 是新節點
    const newNodeData = dataList[N + 1];
    const oldNodesData = [...dataList];
    oldNodesData.splice(N + 1, 1); // 移除新節點，還原舊列表

    const oldLen = oldNodesData.length;
    const totalLen = dataList.length;

    // Edge Case 0: 判斷是否轉為 Head 或 Tail 處理
    // (視覺上這已經由 Tutorial.tsx 決定好了，若 N<0 或 N>=oldLen-1 會走其他分支，
    // 但若漏接會流到這裡，我們用通用邏輯處理)

    // --- Step 1: 遍歷到 Node N ---
    // 這部分跟 Search 類似，只遍歷到 N
    for (let i = 0; i <= N; i++) {
      const traverseNodes = oldNodesData.map((item, idx) => {
        let status: Status = "unfinished";
        if (idx <= i) status = "prepare"; // 走過的路徑
        if (idx === i) status = "target"; // 當前 N 為 target

        // 標籤處理
        let extra = undefined;
        if (idx === i) extra = "tmp"; // 標示 tmp

        return createNode(
          item,
          idx,
          oldLen,
          startX + idx * gap,
          baseY,
          status,
          undefined,
          extra
        );
      });
      linkNodes(traverseNodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: `遍歷：找到位置 ${i} (Node ${i})`,
        elements: traverseNodes,
      });
    }

    // --- Step 2: 右移 (Shift) 與 拉伸箭頭 ---
    // Node 0 ~ N: 位置不變
    // Node N+1 ~ End: 位置右移 (x += gap)
    // 箭頭：保持舊的連接結構 (N 指向 N+1)，所以箭頭會被拉長
    const s2Nodes = oldNodesData.map((item, i) => {
      let x = startX + i * gap;
      if (i > N) x += gap; // N 後面的右移一格

      let status: Status = "unfinished";
      if (i <= N) status = "prepare";
      return createNode(
        item,
        i,
        oldLen,
        x,
        baseY,
        status,
        undefined,
        i === N ? "tmp" : undefined
      );
    });
    linkNodes(s2Nodes); // D3 會自動繪製 N 到 N+1 的長箭頭

    steps.push({
      stepNumber: steps.length + 1,
      description: `1. 將 Node ${N} 之後的節點右移，騰出空間`,
      elements: s2Nodes,
    });

    // --- Step 3: 創建節點 (上方出現) ---
    // 舊節點維持 Step 2 狀態
    const s3OldNodes = oldNodesData.map((item, i) => {
      let x = startX + i * gap;
      if (i > N) x += gap;
      let status: Status = "unfinished";
      if (i <= N) status = "prepare";
      return createNode(item, i, oldLen, x, baseY, status);
    });
    linkNodes(s3OldNodes); // 箭頭仍是 N -> N+1

    // 新節點：位置在 N+1 的空位上方
    const s3NewNode = createNode(
      newNodeData,
      N + 1,
      totalLen,
      startX + (N + 1) * gap,
      baseY - 60,
      "target",
      "new"
    );

    steps.push({
      stepNumber: steps.length + 1,
      description: `2. 在 Node ${N} 後方建立新節點`,
      elements: [...s3OldNodes, s3NewNode],
    });

    // --- Step 4: Link New -> Node N+1 ---
    // 這裡需要手動構建 pointers
    // 需要把所有節點放在一起，但只改變 NewNode 的 pointer
    const s4OldNodes = oldNodesData.map((item, i) => {
      let x = startX + i * gap;
      if (i > N) x += gap;
      return createNode(
        item,
        i,
        oldLen,
        x,
        baseY,
        i <= N ? "prepare" : "unfinished"
      );
    });
    // 連結舊的： N -> N+1 依然存在
    linkNodes(s4OldNodes);

    const s4NewNode = createNode(
      newNodeData,
      N + 1,
      totalLen,
      startX + (N + 1) * gap,
      baseY - 60,
      "target",
      "new"
    );

    // 手動設定新節點指向 oldNode[N+1] (如果存在)
    // oldNode[N+1] 在 s4OldNodes 陣列中的 index 也是 N+1
    if (N + 1 < s4OldNodes.length) {
      s4NewNode.pointers = [s4OldNodes[N + 1]];
    }

    steps.push({
      stepNumber: steps.length + 1,
      description: `3. 將新節點指向 Node ${N + 1}`,
      elements: [...s4OldNodes, s4NewNode],
    });

    // --- Step 5: 縮回箭頭 (Relink Node N -> New) ---
    // 這是最複雜的一步：我们要斷開 N->N+1，改為 N->New
    const s5OldNodes = oldNodesData.map((item, i) => {
      let x = startX + i * gap;
      if (i > N) x += gap;
      return createNode(
        item,
        i,
        oldLen,
        x,
        baseY,
        i <= N ? "prepare" : "unfinished"
      );
    });
    // 先連好基本的 0->1...->N->...
    linkNodes(s5OldNodes);

    const s5NewNode = createNode(
      newNodeData,
      N + 1,
      totalLen,
      startX + (N + 1) * gap,
      baseY - 60,
      "target",
      "new"
    );
    // 新節點依然指向 N+1
    if (N + 1 < s5OldNodes.length) {
      s5NewNode.pointers = [s5OldNodes[N + 1]];
    }

    // 修改 Node N 的 pointer，使其指向 NewNode
    // s5OldNodes[N] 是 Node N
    s5OldNodes[N].pointers = [s5NewNode];
    // 這樣 D3 會移除 N->N+1 的長線，改畫 N->New (往右上指)

    steps.push({
      stepNumber: steps.length + 1,
      description: `4. 將 Node ${N} 指向新節點`,
      elements: [...s5OldNodes, s5NewNode],
    });

    // --- Step 6: 下放 (Drop) 與 完成 ---
    // 使用標準生成邏輯，所有節點回到標準位置，Y 軸歸零，ID 順序正確
    const s6Nodes = dataList.map((item, i) =>
      createNode(item, i, totalLen, startX + i * gap, baseY, "complete")
    );
    linkNodes(s6Nodes);

    steps.push({
      stepNumber: steps.length + 1,
      description: `5. 調整位置，插入完成`,
      elements: s6Nodes,
    });
  }

  if (type === "delete") {
    const deletedNodeData = {
      id: targetId || "temp-del",
      value: value,
    };

    // 刪除後長度
    const currentLen = dataList.length;
    const originalLen = currentLen + 1;

    const N = actionIndex !== undefined ? actionIndex : -1;

    const isDeleteHead = mode === "Head" || (mode === "Node N" && N === 0);
    const isDeleteTail =
      mode === "Tail" || (mode === "Node N" && N === currentLen);

    if (currentLen === 0) {
      // Step 1: 標記唯一節點 (準備刪除)
      const s1DelNode = createNode(
        deletedNodeData,
        0,
        1,
        startX,
        baseY,
        "target",
        "head/tail"
      );

      steps.push({
        stepNumber: 1,
        description: "1. 標記唯一節點準備刪除",
        elements: [s1DelNode],
      });

      // Step 2: 刪除節點 (消失)
      steps.push({
        stepNumber: 2,
        description: "2. 移除節點",
        elements: [],
      });

      // Step 3: 完成 (空狀態)
      steps.push({
        stepNumber: 3,
        description: "3. 刪除完成，鏈結串列為空",
        elements: [],
      });

      return steps;
    }

    if (isDeleteHead) {
      // Step 1: 標記 Head (準備刪除)
      const s1DelNode = createNode(
        deletedNodeData,
        0,
        currentLen + 1,
        startX,
        baseY,
        "target",
        "head"
      );
      const s1RestNodes = dataList.map((item, i) =>
        createNode(
          item,
          i + 1,
          currentLen + 1,
          startX + (i + 1) * gap,
          baseY,
          "unfinished"
        )
      );
      const allS1 = [s1DelNode, ...s1RestNodes];
      linkNodes(allS1);

      steps.push({
        stepNumber: 1,
        description: "1. 標記 Head 節點準備刪除",
        elements: allS1,
      });

      // Step 2: 標記新 Head (原本的 Node 1)
      const s2DelNode = createNode(
        deletedNodeData,
        0,
        currentLen + 1,
        startX,
        baseY,
        "target",
        ""
      );

      const s2RestNodes = dataList.map((item, i) => {
        let label = undefined;
        if (i === 0) label = "head";
        if (hasTailMode && i === currentLen - 1) label = "tail";
        if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";

        return createNode(
          item,
          i + 1,
          currentLen + 1,
          startX + (i + 1) * gap,
          baseY,
          i === 0 ? "prepare" : "unfinished",
          label
        );
      });
      const allS2 = [s2DelNode, ...s2RestNodes];

      linkNodes(allS2);

      steps.push({
        stepNumber: 2,
        description: "2. 將 Head 指標移至下一個節點",
        elements: allS2,
      });

      // Step 3: 斷開連結
      const s3DelNode = createNode(
        deletedNodeData,
        0,
        currentLen + 1,
        startX,
        baseY,
        "target",
        ""
      );

      const s3RestNodes = dataList.map((item, i) => {
        let label = undefined;
        if (i === 0) label = "head";
        if (hasTailMode && i === currentLen - 1) label = "tail";
        if (hasTailMode && currentLen === 1 && i === 0) label = "head/tail";

        return createNode(
          item,
          i + 1,
          currentLen + 1,
          startX + (i + 1) * gap,
          baseY,
          i === 0 ? "prepare" : "unfinished",
          label
        );
      });

      const allS3 = [s3DelNode, ...s3RestNodes];

      // 斷開連結：s3DelNode 指向空，其餘節點互連
      s3DelNode.pointers = [];
      linkNodes(s3RestNodes);

      steps.push({
        stepNumber: 3,
        description: "3. 斷開舊 Head 的連結",
        elements: allS3,
      });

      // Step 4: 刪除節點 (消失)
      const s4Nodes = dataList.map((item, i) =>
        createNode(
          item,
          i,
          currentLen,
          startX + (i + 1) * gap,
          baseY,
          "prepare"
        )
      );
      linkNodes(s4Nodes);

      steps.push({
        stepNumber: 4,
        description: "4. 移除舊 Head 節點",
        elements: s4Nodes,
      });

      // Step 5: 左移歸位
      const s5Nodes = dataList.map((item, i) =>
        createNode(item, i, currentLen, startX + i * gap, baseY, "complete")
      );
      linkNodes(s5Nodes);

      steps.push({
        stepNumber: 5,
        description: "5. 調整位置，刪除完成",
        elements: s5Nodes,
      });
    }

    // Delete Tail
    else if (isDeleteTail) {
      // Step 1: 遍歷 (tmp 找 tail, pre 找倒數第二)
      for (let i = 0; i < currentLen; i++) {
        // 構建包含舊 Tail 的完整列表
        const traverseNodes = [
          ...dataList.map((item, idx) =>
            createNode(
              item,
              idx,
              currentLen + 1,
              startX + idx * gap,
              baseY,
              "unfinished"
            )
          ),
          createNode(
            deletedNodeData,
            currentLen,
            currentLen + 1,
            startX + currentLen * gap,
            baseY,
            "unfinished",
            hasTailMode ? "tail" : ""
          ),
        ];
        linkNodes(traverseNodes);

        // 設定標籤
        // tmp 遍歷到 i
        // pre 在 i-1 (若 i>0)
        // 這裡我們直接操作 traverseNodes[i] 的 description
        const tmpNode = traverseNodes[i];
        tmpNode.description = tmpNode.description
          ? `${tmpNode.description}/tmp`
          : "tmp";

        if (i > 0) {
          const preNode = traverseNodes[i - 1];
          // 如果 preNode 還是 head，保留 head
          const preLabel = preNode.description;
          // 簡單處理：覆蓋為 pre (或疊加)
          preNode.description = preLabel.includes("head") ? "head/pre" : "pre";
        } else {
          // i=0, pre = null (或 head 兼任 pre 的語意，視需求)
          // 這裡假設 pre 還沒進場
        }

        // 當 tmp 走到最後一個 (新 Tail) 時，它其實遇到了舊 Tail 的前一個
        // 此時 tmp 是 pre, 舊 Tail 是 target
        if (i === currentLen) {
          traverseNodes[i].setStatus("prepare"); // pre (新 tail)
          traverseNodes[currentLen].setStatus("target"); // 舊 tail
        } else {
          traverseNodes[i].setStatus("prepare"); // 遍歷中
        }

        steps.push({
          stepNumber: steps.length + 1,
          description: `遍歷：tmp 指向 index ${i}`,
          elements: traverseNodes,
        });
      }

      // Step 2: 轉移 Tail 標籤 (若有 Tail Mode) & 斷開連結
      // 新 Tail (dataList 最後一個) 獲得 "tail"
      // 舊 Tail 失去 "tail"
      const s2Nodes = [
        ...dataList.map((item, idx) => {
          let label = undefined;
          if (idx === 0) label = "head";
          if (hasTailMode && idx === currentLen - 1)
            label = (label ? label + "/" : "") + "tail";
          if (idx === currentLen - 1) {
            label = (label ? label + "/" : "") + "pre";
          }

          return createNode(
            item,
            idx,
            currentLen,
            startX + idx * gap,
            baseY,
            idx === currentLen - 1 ? "prepare" : "unfinished",
            label
          );
        }),
        createNode(
          deletedNodeData,
          currentLen,
          currentLen + 1,
          startX + currentLen * gap,
          baseY,
          "target",
          "tmp"
        ), // 舊 tail 變成 tmp (因為 tmp 其實是指向要被刪除的那個)
      ];

      linkNodes(s2Nodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: "找到 Tail",
        elements: s2Nodes,
      });

      // Step 3: 斷開連結
      const s3Nodes = [
        ...dataList.map((item, idx) => {
          let label = undefined;
          if (idx === 0) label = "head";
          if (hasTailMode && idx === currentLen - 1)
            label = (label ? label + "/" : "") + "tail";
          if (idx === currentLen - 1)
            label = (label ? label + "/" : "") + "pre";
          return createNode(
            item,
            idx,
            currentLen,
            startX + idx * gap,
            baseY,
            idx === currentLen - 1 ? "prepare" : "unfinished",
            label
          );
        }),
        createNode(
          deletedNodeData,
          currentLen,
          currentLen + 1,
          startX + currentLen * gap,
          baseY,
          "target",
          "tmp"
        ),
      ];

      linkNodes(s3Nodes);
      s3Nodes[currentLen - 1].pointers = []; // 斷開連結：新 Tail 指向 null

      steps.push({
        stepNumber: steps.length + 1,
        description: "斷開前一個節點 (Pre) 的連結",
        elements: s3Nodes,
      });

      // Step 4: 刪除節點 (消失)
      const s4Nodes = dataList.map((item, i) =>
        createNode(item, i, currentLen, startX + i * gap, baseY, "complete")
      );
      linkNodes(s4Nodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: "移除舊 Tail 節點，完成刪除",
        elements: s4Nodes,
      });
    } else if (mode === "Node N") {
      // 1. 重建舊列表 (為了遍歷)
      const oldList = [...dataList];
      oldList.splice(N, 0, deletedNodeData); // 把刪除的節點塞回去，還原舊列表

      // Step 1: 遍歷 (找到 Node N 和 Pre)
      for (let i = 0; i <= N; i++) {
        const traverseNodes = oldList.map((item, idx) => {
          let status: Status = "unfinished";
          if (idx === i - 1) status = "prepare";
          if (idx === i) status = "target"; // 當前 tmp

          let extra = undefined;
          if (idx === i) extra = "tmp";

          // Pre 標籤 (當 tmp 走到 i 時，i-1 是 pre)
          if (i > 0 && idx === i - 1) {
            const baseLabel = getLabel(idx, originalLen, hasTailMode);
            const newLabel = baseLabel ? `${baseLabel}/pre` : "pre";

            return createNode(
              item,
              idx,
              originalLen,
              startX + idx * gap,
              baseY,
              status,
              newLabel
            );
          }

          return createNode(
            item,
            idx,
            originalLen,
            startX + idx * gap,
            baseY,
            status,
            undefined,
            extra
          );
        });
        linkNodes(traverseNodes);

        steps.push({
          stepNumber: steps.length + 1,
          description: `遍歷：尋找 Node ${N} (tmp 指向 ${i})`,
          elements: traverseNodes,
        });
      }

      // Step 2: Node N 上移 (Target)
      // 畫面：Pre(N-1) -> N(上移) -> Next(N+1)
      const s2Nodes = oldList.map((item, idx) => {
        let y = baseY;
        if (idx === N) y = baseY - 60; // Node N 上移

        let label = undefined;
        if (idx === N - 1)
          label = getLabel(idx, originalLen, hasTailMode) + "pre";
        if (idx === N) label = "tmp";

        let status: Status = idx === N - 1 ? "prepare" : "unfinished";
        if (idx === N) status = "target";

        return createNode(
          item,
          idx,
          originalLen,
          startX + idx * gap,
          y,
          status,
          label
        );
      });
      linkNodes(s2Nodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: `找到 Node ${N}，將其移出`,
        elements: s2Nodes,
      });

      // Step 3: 連接 Pre -> Next (拉長箭頭)
      // 畫面：Pre 直接連到 Next，Node N 依然連著 Next
      const s3Nodes = oldList.map((item, idx) => {
        let y = baseY;
        if (idx === N) y = baseY - 60;

        let label = undefined;
        if (idx === N - 1)
          label = getLabel(idx, originalLen, hasTailMode) + "pre";
        if (idx === N) label = "tmp";

        let status: Status = idx === N - 1 ? "prepare" : "unfinished";
        if (idx === N) status = "target";

        return createNode(
          item,
          idx,
          originalLen,
          startX + idx * gap,
          y,
          status,
          label
        );
      });

      // 手動連接：先連一般的，再改 Pre 的
      linkNodes(s3Nodes);
      // Pre (N-1) 指向 Next (N+1)
      if (N - 1 >= 0 && N + 1 < originalLen) {
        s3Nodes[N - 1].pointers = [s3Nodes[N + 1]];
      }
      // Node N (浮在上面) 依然指向 Next (N+1)
      if (N + 1 < originalLen) {
        s3Nodes[N].pointers = [s3Nodes[N + 1]];
      }

      steps.push({
        stepNumber: steps.length + 1,
        description: `將 Pre (Node ${N - 1}) 指向 Next (Node ${N + 1})`,
        elements: s3Nodes,
      });

      // Step 4: 刪除 Node N (消失)
      // 畫面：Node N 消失，Pre 指向 Next
      const s4Nodes = dataList.map((item, idx) => {
        // idx 是在新 list 的索引
        // 如果原本在 N 之後 (現在 idx >= N)，位置要在 (idx+1) * gap
        let posIdx = idx;
        if (idx >= N) posIdx = idx + 1; // 留出空隙

        let label = undefined;
        if (idx === N - 1)
          label = getLabel(idx, originalLen, hasTailMode) + "pre";

        return createNode(
          item,
          idx,
          originalLen,
          startX + posIdx * gap,
          baseY,
          idx === N - 1 ? "prepare" : "unfinished",
          label
        );
      });

      linkNodes(s4Nodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: `移除 Node ${N} (tmp)`,
        elements: s4Nodes,
      });

      // Step 5: 左移補齊 (完成)
      const s5Nodes = dataList.map((item, idx) =>
        createNode(item, idx, currentLen, startX + idx * gap, baseY, "complete")
      );
      linkNodes(s5Nodes);

      steps.push({
        stepNumber: steps.length + 1,
        description: "調整位置，刪除完成",
        elements: s5Nodes,
      });
    }
  }
  return steps;
}

// TODO: 完成 LinkedList 的 actionTag mappings 對應
// 定義 LinkedList 的結構化代碼配置
const linkedListCodeConfig: CodeConfig = {
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
    newNode ← new Node(value)
    If head = null Then
      head ← newNode
    Else
      current ← head
      While current.next ≠ null Do
        current ← current.next
      End While
      current.next ← newNode
    End If
  End Procedure

  Procedure insertAtIndex(index, value):
    If index = 0 Then
      insertAtHead(value)
      Return
    End If
    newNode ← new Node(value)
    current ← head
    For i ← 0 To index - 1 Do
      current ← current.next
    End For
    newNode.next ← current.next
    current.next ← newNode
  End Procedure

  Procedure deleteAtHead():
    If head = null Then
      Return Error
    End If
    head ← head.next
  End Procedure

  Procedure deleteAtTail():
    If head = null Then
      Return Error
    End If
    If head.next = null Then
      head ← null
      Return
    End If
    current ← head
    While current.next.next ≠ null Do
      current ← current.next
    End While
    current.next ← null
  End Procedure

  Procedure deleteAtIndex(index):
    If index = 0 Then
      deleteAtHead()
      Return
    End If
    current ← head
    For i ← 0 To index - 1 Do
      current ← current.next
    End For
    current.next ← current.next.next
  End Procedure

  Procedure search(value):
    current ← head
    index ← 0
    While current ≠ null Do
      If current.value = value Then
        Return index
      End If
      current ← current.next
      index ← index + 1
    End While
    Return -1
  End Procedure`,
    mappings: {
      // TODO: 實作 LinkedList 的 actionTag 對應 pseudo code 行號
      // Insert Head
      "INSERT_HEAD_START": [],
      "INSERT_HEAD_CREATE": [],
      "INSERT_HEAD_LINK": [],
      "INSERT_HEAD_UPDATE": [],
      "INSERT_HEAD_END": [],
      // Insert Tail
      "INSERT_TAIL_START": [],
      "INSERT_TAIL_TRAVERSE": [],
      "INSERT_TAIL_CREATE": [],
      "INSERT_TAIL_LINK": [],
      "INSERT_TAIL_END": [],
      // Insert At Index
      "INSERT_INDEX_START": [],
      "INSERT_INDEX_TRAVERSE": [],
      "INSERT_INDEX_CREATE": [],
      "INSERT_INDEX_LINK": [],
      "INSERT_INDEX_END": [],
      // Delete Head
      "DELETE_HEAD_START": [],
      "DELETE_HEAD_CHECK": [],
      "DELETE_HEAD_UPDATE": [],
      "DELETE_HEAD_END": [],
      // Delete Tail
      "DELETE_TAIL_START": [],
      "DELETE_TAIL_TRAVERSE": [],
      "DELETE_TAIL_UNLINK": [],
      "DELETE_TAIL_END": [],
      // Delete At Index
      "DELETE_INDEX_START": [],
      "DELETE_INDEX_TRAVERSE": [],
      "DELETE_INDEX_UNLINK": [],
      "DELETE_INDEX_END": [],
      // Search
      "SEARCH_START": [],
      "SEARCH_COMPARE": [],
      "SEARCH_FOUND": [],
      "SEARCH_NEXT": [],
      "SEARCH_NOT_FOUND": [],
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
        else:
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
        for i in range(index - 1):
            current = current.next
        new_node.next = current.next
        current.next = new_node

    def delete_at_head(self):
        if self.head is None:
            raise Exception("List is empty")
        self.head = self.head.next

    def delete_at_tail(self):
        if self.head is None:
            raise Exception("List is empty")
        if self.head.next is None:
            self.head = None
            return
        current = self.head
        while current.next.next is not None:
            current = current.next
        current.next = None

    def delete_at_index(self, index):
        if index == 0:
            self.delete_at_head()
            return
        current = self.head
        for i in range(index - 1):
            current = current.next
        current.next = current.next.next

    def search(self, value):
        current = self.head
        index = 0
        while current is not None:
            if current.value == value:
                return index
            current = current.next
            index += 1
        return -1`,
  },
};

// 鏈表數據結構配置
export const linkedListConfig: DataStructureConfig = {
  id: "linkedlist",
  name: "鏈結串列 (Linked List)",
  category: "linear",
  categoryName: "線性表",
  description: "動態的線性數據結構",
  codeConfig: linkedListCodeConfig,
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
};
