import type { AnimationStep, CodeConfig, StatusConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import { Node } from "@/modules/core/DataLogic/Node";
import { Box } from "@/modules/core/DataLogic/Box";
import type {
  ActionContext,
  ActionResult,
} from "@/modules/core/visualization/types";
import { cloneData } from "@/modules/core/visualization/visualizationUtils";
import { TopologicalSortActionBar } from "./TopologicalSortActionBar";
import { createGraphElements } from "@/data/DataStructure/nonlinear/utils";

const TAGS = {
  INIT: "INIT",
  ENQUEUE_ZERO: "ENQUEUE_ZERO",
  WHILE_LOOP: "WHILE_LOOP",
  DEQUEUE: "DEQUEUE",
  REDUCE_NEIGHBOR: "REDUCE_NEIGHBOR",
  CHECK_ZERO: "CHECK_ZERO",
  CHECK_CYCLE: "CHECK_CYCLE",
  DONE: "DONE",
};

export const TopoStatus = {
  Inactive: Status.Inactive,
  Target: Status.Target,
  InQueue: Status.Prepare,
  Reducing: "reducing", // 拔除邊
  Complete: Status.Complete,
  Error: "error", // 循環依賴死鎖
} as const;

export const TopoStatusConfig: StatusConfig = {
  statuses: [
    { key: TopoStatus.Inactive, label: "未處理", color: "#475569" },
    { key: TopoStatus.InQueue, label: "在 Queue 中", color: "#3b82f6" },
    { key: TopoStatus.Target, label: "當前處理節點", color: "#f59e0b" },
    { key: TopoStatus.Reducing, label: "拔除邊/減入度", color: "#ef4444" },
    { key: TopoStatus.Complete, label: "排序完成", color: "#10b981" },
    { key: TopoStatus.Error, label: "循環死鎖", color: "#991b1b" },
  ],
};

type GraphData = {
  nodes: { id: string; value?: string; x?: number; y?: number }[];
  edges: string[][];
};

// 隨機產生有向無環圖 (DAG)
function generateRandomDAG(nodeCount: number): GraphData {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `node-${i}`,
    value: String(i),
  }));
  const edges: string[][] = [];

  // 建立連通骨架：讓每個新節點都至少被一個「前面的節點」指著
  // 這樣能確保絕對不會有孤立的節點 (除了起點)，且依然是由小指到大 (DAG)
  for (let i = 1; i < nodeCount; i++) {
    const sourceIndex = Math.floor(Math.random() * i);
    edges.push([`node-${sourceIndex}`, `node-${i}`]);
  }

  const extraEdgesCount = Math.floor(nodeCount * 0.6); // 增加一些複雜度
  for (let k = 0; k < extraEdgesCount; k++) {
    const u = Math.floor(Math.random() * nodeCount);
    const v = Math.floor(Math.random() * nodeCount);

    // 只允許 ID 小的指向 ID 大的，維持 DAG 性質
    if (u < v) {
      const exists = edges.some(
        (e) => e[0] === `node-${u}` && e[1] === `node-${v}`,
      );
      if (!exists) {
        edges.push([`node-${u}`, `node-${v}`]);
      }
    }
  }
  return { nodes, edges };
}

function topoActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: GraphData,
  context: ActionContext,
): ActionResult<GraphData> | null {
  if (actionType === "random") {
    const count = Math.floor(Math.random() * 4) + 5; // 5~8 個節點
    return {
      animationData: generateRandomDAG(count),
      isResetAction: true,
      animationParams: { isDirected: true },
    };
  }

  if (actionType === "load") {
    const raw = payload.data as string;
    if (!raw?.startsWith("GRAPH:")) return null;
    const parts = raw.split(":");
    const nodeCount = parseInt(parts[1], 10);
    const edgeStr = parts.slice(2).join(":");

    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      value: String(i),
    }));
    const edges: string[][] = [];
    if (edgeStr.trim() !== "") {
      edgeStr.split(",").forEach((pair) => {
        const [u, v] = pair.trim().split(/\s+/);
        const uIdx = parseInt(u, 10);
        const vIdx = parseInt(v, 10);
        const isValid = (n: number) => !isNaN(n) && n >= 0 && n < nodeCount;
        if (isValid(uIdx) && isValid(vIdx)) {
          edges.push([`node-${uIdx}`, `node-${vIdx}`]);
        }
      });
    }
    return {
      animationData: { nodes, edges },
      isResetAction: true,
      animationParams: { isDirected: true },
    };
  }

  if (actionType === "reset") {
    const newData = cloneData(context.defaultData as GraphData);

    const isGraphData = (d: any): d is GraphData =>
      d && !Array.isArray(d) && Array.isArray(d.nodes);

    if (isGraphData(data)) {
      const coordMap = new Map(
        data.nodes.map((n: any) => [n.id, { x: n.x, y: n.y }]),
      );
      newData.nodes.forEach((n: any) => {
        const saved = coordMap.get(n.id);
        if (saved?.x != null && saved?.y != null) {
          n.x = saved.x;
          n.y = saved.y;
        }
      });
    }

    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { isDirected: true, ...payload },
      isResetAction: true,
    };
  }

  if (actionType === "run") {
    return {
      animationData: cloneData(data),
      animationParams: { isDirected: true },
    };
  }
  return null;
}

export function createTopologicalSortAnimationSteps(
  inputData: any,
  action?: any,
): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const graph = inputData as GraphData;
  if (!graph?.nodes || graph.nodes.length === 0) return steps;

  const layoutNodes = createGraphElements(graph as any, true, {
    width: 700,
    height: 300,
    offsetX: 0,
    offsetY: 50,
  });
  const layoutMap = new Map(layoutNodes.map((n) => [n.id, n.position]));

  const nodes = graph.nodes;
  let remainingEdges = [...graph.edges];

  // 計算初始 In-Degree
  const inDegree: Record<string, number> = {};
  nodes.forEach((n) => (inDegree[n.id] = 0));
  remainingEdges.forEach((e) => inDegree[e[1]]++);

  const nodeStatus: Record<string, string> = {};
  const edgeStatus: Record<string, string> = {};
  const queue: string[] = [];
  const result: string[] = [];
  let poppingNodeId: string | undefined = undefined; // 記錄目前「正在往下掉」的節點

  const recordStep = (desc: string, tag: string, pushingNodeId?: string) => {
    const elements: (Node | Box)[] = [];

    nodes.forEach((n) => {
      const node = new Node();
      node.id = n.id;
      node.value = n.value || n.id.replace("node-", "");
      node.description = `In: ${inDegree[n.id]}`;

      const pos = layoutMap.get(n.id) || { x: n.x ?? 500, y: n.y ?? 200 };

      node.moveTo(pos.x, pos.y);
      node.setStatus(nodeStatus[n.id] || TopoStatus.Inactive);
      elements.push(node);
    });

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
        box.setStatus(TopoStatus.InQueue);
      }

      box.width = 120;
      box.height = 30;
      elements.push(box);
    });

    if (poppingNodeId) {
      const dropBox = new Box();
      dropBox.id = `box-${poppingNodeId}`;
      dropBox.value = poppingNodeId.replace("node-", "");

      const baseX = 850;
      dropBox.moveTo(baseX, 420);

      dropBox.width = 120;
      dropBox.height = 30;
      dropBox.setStatus(Status.Complete);
      elements.push(dropBox);
    }

    const resStartX = 50,
      resY = 420;
    result.forEach((id, i) => {
      const box = new Box();
      box.id = `box-${id}`;
      box.value = id.replace("node-", "");
      box.moveTo(resStartX + i * 45, resY);
      box.width = 40;
      box.height = 40;
      box.setStatus(TopoStatus.Complete);
      elements.push(box);
    });

    const stepLinks = remainingEdges.map((e) => {
      let linkStatus = edgeStatus[`${e[0]}->${e[1]}`] as any;
      if (linkStatus === TopoStatus.Reducing) {
        linkStatus = Status.Target;
      }
      return {
        sourceId: e[0],
        targetId: e[1],
        status: linkStatus || Status.Inactive,
      };
    });

    const degreeVars: Record<string, any> = {};
    nodes.forEach((n) => {
      degreeVars[`Node ${n.value}`] = inDegree[n.id];
    });

    steps.push({
      stepNumber: steps.length,
      description: desc,
      actionTag: tag,
      elements,
      links: stepLinks,
      variables: {
        "Queue 內容":
          queue.length > 0
            ? queue.map((id) => id.replace("node-", "")).join(", ")
            : "空",
        "Result 數量": result.length,
        ...degreeVars,
      },
    });
  };

  // Kahn's Algorithm
  recordStep(`初始化：計算各節點的 In-degree (入度)。`, TAGS.INIT);

  nodes.forEach((n) => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id);
      nodeStatus[n.id] = TopoStatus.InQueue;
    }
  });

  recordStep(`將所有入度為 0 的節點加入 Queue 待命。`, TAGS.ENQUEUE_ZERO);

  while (queue.length > 0) {
    recordStep(`Queue 不為空，準備取出節點處理。`, TAGS.WHILE_LOOP);

    // 將節點移出 queue，並放入 poppingNodeId 暫存
    const curr = queue.shift()!;
    poppingNodeId = curr;
    nodeStatus[curr] = TopoStatus.Target;

    recordStep(`取出節點 [${curr.replace("node-", "")}]。`, TAGS.DEQUEUE);

    result.push(curr);
    poppingNodeId = undefined;
    nodeStatus[curr] = TopoStatus.Complete;

    recordStep(
      `將節點 [${curr.replace("node-", "")}] 加入 Result。`,
      TAGS.DEQUEUE,
    );

    const neighbors = remainingEdges
      .filter((e) => e[0] === curr)
      .map((e) => e[1]);

    for (const neighbor of neighbors) {
      const edgeKey = `${curr}->${neighbor}`;
      edgeStatus[edgeKey] = TopoStatus.Reducing;
      nodeStatus[neighbor] = TopoStatus.Reducing;

      recordStep(
        `拔除邊 ${curr.replace("node-", "")} → ${neighbor.replace("node-", "")}，目標入度準備減 1。`,
        TAGS.REDUCE_NEIGHBOR,
      );

      inDegree[neighbor]--;
      remainingEdges = remainingEdges.filter(
        (e) => !(e[0] === curr && e[1] === neighbor),
      );
      delete edgeStatus[edgeKey];

      if (inDegree[neighbor] === 0) {
        nodeStatus[neighbor] = TopoStatus.InQueue;
        queue.push(neighbor);
        recordStep(
          `節點 [${neighbor.replace("node-", "")}] 的入度歸零，加入 Queue！`,
          TAGS.CHECK_ZERO,
          neighbor, // pushingNodeId = neighbor
        );
      } else {
        nodeStatus[neighbor] = TopoStatus.Inactive;
        recordStep(
          `節點 [${neighbor.replace("node-", "")}] 的入度變為 ${inDegree[neighbor]}，仍有依賴。`,
          TAGS.CHECK_ZERO,
        );
      }
    }
  }

  recordStep(
    `Queue 是空的，處理迴圈結束。檢查「已排入 Result 的節點數」是否等於「總節點數」。`,
    TAGS.CHECK_CYCLE,
  );

  // Check DAG (偵測 Cycle)
  if (result.length < nodes.length) {
    recordStep(
      `發現已處理節點數 (${result.length}) < 總節點數 (${nodes.length})！表示圖中存在「循環依賴 (Cycle)」，並非有向無環圖 (DAG)。`,
      TAGS.CHECK_CYCLE,
    );

    nodes.forEach((n) => {
      if (nodeStatus[n.id] !== TopoStatus.Complete) {
        nodeStatus[n.id] = TopoStatus.Error;
      }
    });
    recordStep(
      `剩下的節點因為互相等待前置條件（入度永遠無法歸零），發生死鎖 (Deadlock)，拓撲排序失敗。`,
      TAGS.CHECK_CYCLE,
    );
  } else {
    recordStep(
      `已處理節點數 (${result.length}) == 總節點數 (${nodes.length})，代表圖中沒有循環依賴！`,
      TAGS.DONE,
    );
    recordStep(`所有節點排序完成！`, TAGS.DONE);
  }

  return steps;
}

const topoCodeConfig: CodeConfig = {
  pseudo: {
    content: `Procedure TopologicalSort(Graph):
  Calculate in-degree for all nodes
  Queue Q
  For each node u in Graph:
    If inDegree[u] == 0 Then Q.enqueue(u)
  While Q is not empty:
    u = Q.dequeue()
    Result.append(u)
    For each neighbor v of u:
      Remove edge (u, v)
      inDegree[v] = inDegree[v] - 1
      If inDegree[v] == 0 Then Q.enqueue(v)
  If Result.size != Graph.nodes.size Then
    Return "Cycle Detected"
  Return Result`,
    mappings: {
      [TAGS.INIT]: [2],
      [TAGS.ENQUEUE_ZERO]: [4, 5],
      [TAGS.WHILE_LOOP]: [6],
      [TAGS.DEQUEUE]: [7, 8],
      [TAGS.REDUCE_NEIGHBOR]: [9, 10, 11],
      [TAGS.CHECK_ZERO]: [12],
      [TAGS.CHECK_CYCLE]: [13, 14],
      [TAGS.DONE]: [15],
    },
  },
  python: {
    content: `def topological_sort(graph):
    in_degree = {u: 0 for u in graph.nodes}
    for u, v in graph.edges:
        in_degree[v] += 1
        
    queue = [u for u in graph.nodes if in_degree[u] == 0]
    result = []
    
    while queue:
        u = queue.pop(0)
        result.append(u)
        
        for v in graph.neighbors(u):
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
                
    if len(result) != len(graph.nodes):
        return "Cycle Detected"
    return result`,
  },
};

export const topologicalSortConfig: LevelImplementationConfig = {
  id: "topological-sort",
  type: "algorithm",
  name: "拓撲排序 (Kahn's Algorithm)",
  categoryName: "圖論演算法 (Graph)",
  description: "針對有向無環圖 (DAG) 進行線性排序，常用於任務排程與依賴解析。",
  codeConfig: topoCodeConfig,
  statusConfig: TopoStatusConfig,
  complexity: {
    timeBest: "O(V + E)",
    timeAverage: "O(V + E)",
    timeWorst: "O(V + E)",
    space: "O(V + E)",
  },
  introduction: `拓撲排序專門用來處理「有向無環圖 (DAG)」的依賴關係。只有當一個節點的「入度 (In-degree)」為 0 時才能被執行。每執行完一個節點，就把它連出去的邊拔掉，釋放後續節點的依賴。`,
  defaultData: {
    nodes: [
      { id: "node-0", value: "0" },
      { id: "node-1", value: "1" },
      { id: "node-2", value: "2" },
      { id: "node-3", value: "3" },
      { id: "node-4", value: "4" },
      { id: "node-5", value: "5" },
    ],
    edges: [
      ["node-5", "node-2"],
      ["node-5", "node-0"],
      ["node-4", "node-0"],
      ["node-4", "node-1"],
      ["node-2", "node-3"],
      ["node-3", "node-1"],
    ],
  },
  actionHandler: topoActionHandler,
  createAnimationSteps: createTopologicalSortAnimationSteps,
  defaultIsDirected: true,
  relatedProblems: [
    {
      id: 207,
      title: "Course Schedule",
      concept: "經典拓撲排序：判斷課程能否全部修完（有無 cycle）",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule/",
    },
    {
      id: 210,
      title: "Course Schedule II",
      concept: "拓撲排序：輸出修課順序（完整的拓撲序列）",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule-ii/",
    },
    {
      id: 802,
      title: "Find Eventual Safe States",
      concept: "反向拓撲排序：找出所有不會陷入環的安全節點",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/find-eventual-safe-states/",
    },
    {
      id: 1462,
      title: "Course Schedule IV",
      concept: "拓撲排序 + 傳遞閉包：判斷課程間的先修關係",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule-iv/",
    },
  ],
  renderActionBar: (props) => <TopologicalSortActionBar {...(props as any)} />,
};
