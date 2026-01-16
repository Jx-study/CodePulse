import { Node } from "../../../modules/core/DataLogic/Node";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import {
  AnimationStep,
  DataStructureConfig,
} from "../../../types/dataStructure";

interface ListNodeData {
  id: string;
  value: number;
}

interface ActionType {
  type: string;
  value: number;
  mode: string;
  targetId?: string;
  index?: number;
}

// 創建鏈表的動畫步驟

export function createLinkedListAnimationSteps(): AnimationStep[] {
  const steps: AnimationStep[] = [];
  return steps;
}

// 建立節點實例的函式

function createNodeInstance(
  id: string,
  val: number,
  x: number,
  y: number,
  status: Status = "unfinished",
  desc: string = ""
) {
  const n = new Node();
  n.id = id;
  n.value = val;
  n.moveTo(x, y);
  n.setStatus(status);
  n.description = desc;
  return n;
}

function linkNodes(nodes: Node[]) {
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].pointers = [nodes[i + 1]];
  }
  return nodes;
}

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

export function generateStepsFromData(
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

    return createNodeInstance(
      `node-${item.id}`,
      item.value,
      x,
      y,
      status,
      label
    );
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

  const { type, value, mode } = action;

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
        if (idx === i) extra = "curr"; // 標示 current

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

      return createNode(item, i, oldLen, x, baseY, status);
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

  return steps;
}

// 鏈表數據結構配置
export const linkedListConfig: DataStructureConfig = {
  id: "linkedlist",
  name: "鏈結串列 (Linked List)",
  category: "linear",
  categoryName: "線性表",
  description: "動態的線性數據結構",
  pseudoCode: `class Node:
    value: any
    next: Node

class LinkedList:
    head: Node

    // 在頭部插入節點
    insertAtHead(value):
        newNode = new Node(value)
        newNode.next = head
        head = newNode

    // 在尾部插入節點
    insertAtTail(value):
        newNode = new Node(value)
        if head is null:
            head = newNode
        else:
            current = head
            while current.next is not null:
                current = current.next
            current.next = newNode

    // 刪除節點
    deleteNode(value):
        if head is null:
            return
        if head.value == value:
            head = head.next
            return
        current = head
        while current.next is not null:
            if current.next.value == value:
                current.next = current.next.next
                return
            current = current.next

    // 遍歷鏈表
    traverse():
        current = head
        while current is not null:
            print(current.value)
            current = current.next`,
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
  createAnimationSteps: createLinkedListAnimationSteps,
};
