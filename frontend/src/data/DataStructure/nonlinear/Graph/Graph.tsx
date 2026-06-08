import type { AnimationStep, CodeConfig } from "@/types";
import type { LevelImplementationConfig } from "@/types/implementation";
import { graphRealWorldStories } from "./graph.stories";
import type { ActionContext } from "@/modules/core/visualization/types";
import { GraphActionBar } from "./GraphActionBar";
import { generateRandomGraphDS } from "@/modules/core/visualization/visualizationUtils";
import type { ActionResult } from "@/modules/core/visualization/types";
import type { GraphData } from "@/modules/core/visualization/types";
import { simulateGraphTrace } from "./simulateTrace";
import { graphTraceToSteps } from "./traceToSteps";
import { GraphStatusConfig, TAGS } from "./tags";

export function createGraphAnimationSteps(
  inputData: any[],
  action?: any,
): AnimationStep[] {
  const trace = simulateGraphTrace(inputData, action);
  return graphTraceToSteps(trace);
}

function isGraphData(d: any): d is GraphData {
  return d && !Array.isArray(d) && Array.isArray(d.nodes);
}

/** Graph actionHandler */
function graphActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: GraphData,
  context: ActionContext,
): ActionResult<GraphData> | null {
  if (!isGraphData(data)) return null;
  const newData = JSON.parse(JSON.stringify(data));
  const { nodes, edges } = newData;
  const isDirected = payload.isDirected as boolean;

  if (actionType === "addVertex") {
    const val = payload.value ? String(payload.value) : `node-${nodes.length}`;
    const id = `node-${val}`;
    if (!val || val.trim() === "") {
      context.toast.warning("請輸入節點 ID");
      return null;
    }
    if (nodes.find((n: any) => n.id === id)) {
      context.toast.warning(`節點 ${val} 已存在`);
      return null;
    }
    nodes.push({ id, value: val });
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: { type: "addVertex", value: val, isDirected },
    };
  }

  if (actionType === "removeVertex") {
    const targetVal = String(payload.id ?? "");
    const targetIdVal = `node-${targetVal}`;
    if (!targetVal || targetVal.trim() === "") {
      context.toast.warning("請輸入節點 ID");
      return null;
    }
    const idx = nodes.findIndex((n: any) => n.id === targetIdVal);
    if (idx === -1) {
      context.toast.warning(`節點 ${targetVal} 不存在`);
      return null;
    }
    const relatedEdges = edges.filter(
      (e: any[]) => e[0] === targetIdVal || e[1] === targetIdVal,
    );
    const deletedNodeCoords = { x: nodes[idx].x, y: nodes[idx].y };
    nodes.splice(idx, 1);
    newData.edges = edges.filter(
      (e: any[]) => e[0] !== targetIdVal && e[1] !== targetIdVal,
    );
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: {
        type: "removeVertex",
        id: targetVal,
        isDirected,
        deletedEdges: relatedEdges,
        deletedNodeCoords,
        ...payload,
      },
    };
  }

  if (actionType === "addEdge") {
    const sourceId = `node-${payload.source}`;
    const targetIdVal = `node-${payload.target}`;
    if (
      !nodes.find((n: any) => n.id === sourceId) ||
      !nodes.find((n: any) => n.id === targetIdVal)
    ) {
      context.toast.warning("來源或目標節點不存在");
      return null;
    }
    const exists = edges.some(
      (e: any[]) =>
        (e[0] === sourceId && e[1] === targetIdVal) ||
        (!isDirected && e[0] === targetIdVal && e[1] === sourceId),
    );
    if (exists) {
      context.toast.warning("該連線已存在");
      return null;
    }
    edges.push([sourceId, targetIdVal]);
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: {
        type: "addEdge",
        source: payload.source,
        target: payload.target,
        isDirected,
        ...payload,
      },
    };
  }

  if (actionType === "removeEdge") {
    const sourceId = `node-${payload.source}`;
    const targetIdVal = `node-${payload.target}`;
    const initialLength = edges.length;
    newData.edges = edges.filter((e: any[]) => {
      const isForward = e[0] === sourceId && e[1] === targetIdVal;
      const isBackward = e[0] === targetIdVal && e[1] === sourceId;
      return isDirected ? !isForward : !(isForward || isBackward);
    });
    if (newData.edges.length === initialLength) {
      context.toast.warning("找不到該連線，無法刪除");
      return null;
    }
    return {
      animationData: newData,
      useRawAnimationParams: true,
      animationParams: {
        type: "removeEdge",
        source: payload.source,
        target: payload.target,
        isDirected,
        ...payload,
      },
    };
  }

  if (
    [
      "getNeighbors",
      "getDegree",
      "checkAdjacent",
      "checkConnected",
      "checkCycle",
    ].includes(actionType)
  ) {
    if (
      (actionType === "getNeighbors" || actionType === "getDegree") &&
      (!payload.id || String(payload.id).trim() === "")
    ) {
      context.toast.warning("請輸入節點 ID");
      return null;
    }
    if (
      actionType === "checkAdjacent" &&
      (!payload.source ||
        String(payload.source).trim() === "" ||
        !payload.target ||
        String(payload.target).trim() === "")
    ) {
      context.toast.warning("請輸入來源與目標節點 ID");
      return null;
    }
    if (actionType === "getNeighbors" || actionType === "getDegree") {
      if (!nodes.find((n: any) => n.id === `node-${payload.id}`)) {
        context.toast.warning(`節點 ${payload.id} 不存在`);
        return null;
      }
    }
    if (actionType === "checkAdjacent") {
      if (
        !nodes.find((n: any) => n.id === `node-${payload.source}`) ||
        !nodes.find((n: any) => n.id === `node-${payload.target}`)
      ) {
        context.toast.warning("來源或目標節點不存在");
        return null;
      }
    }
    if (
      (actionType === "checkConnected" || actionType === "checkCycle") &&
      nodes.length === 0
    ) {
      context.toast.warning("圖形為空");
      return null;
    }
    return {
      animationData: data,
      useRawAnimationParams: true,
      animationParams: { type: actionType, ...payload, isDirected },
    };
  }

  if (["random", "reset", "load", "refresh"].includes(actionType)) {
    if (actionType === "random") {
      const nodeCount = typeof payload.randomCount === "number" && payload.randomCount > 0
        ? payload.randomCount
        : Math.floor(Math.random() * 6) + 5;
      const randData = generateRandomGraphDS(nodeCount);
      return {
        animationData: randData,
        isResetAction: true,
        useRawAnimationParams: true,
        animationParams: { type: "random", mode: "graph", isDirected },
      };
    }
    if (actionType === "reset") {
      const defaultData = (context.defaultData ?? data) as GraphData;
      const resetData = JSON.parse(JSON.stringify(defaultData));
      if (isGraphData(data)) {
        const coordMap = new Map(
          data.nodes.map((n: any) => [n.id, { x: n.x, y: n.y }]),
        );
        resetData.nodes.forEach((n: any) => {
          const saved = coordMap.get(n.id);
          if (saved?.x !== undefined && saved?.y !== undefined) {
            n.x = saved.x;
            n.y = saved.y;
            if (!n.position) n.position = { x: saved.x, y: saved.y };
            else {
              n.position.x = saved.x;
              n.position.y = saved.y;
            }
          }
        });
      }
      return {
        animationData: resetData,
        isResetAction: true,
        useRawAnimationParams: true,
        animationParams: { type: "reset", mode: "graph", isDirected },
      };
    }
    if (actionType === "load") {
      const loadStr = payload.data as string;
      if (typeof loadStr === "string" && loadStr.startsWith("GRAPH:")) {
        const parts = loadStr.split(":");
        if (parts.length >= 3) {
          const nodeCount = parseInt(parts[1]);
          const edgeStr = parts.slice(2).join(":");
          const nodesArr: any[] = [];
          for (let i = 0; i < nodeCount; i++)
            nodesArr.push({ id: `node-${i}`, value: String(i) });
          const edgesArr: string[][] = [];
          if (edgeStr.trim() !== "") {
            edgeStr.split(",").forEach((pair) => {
              const [u, v] = pair.trim().split(/\s+/);
              if (u && v) edgesArr.push([`node-${u}`, `node-${v}`]);
            });
          }
          return {
            animationData: { nodes: nodesArr, edges: edgesArr },
            isResetAction: true,
            useRawAnimationParams: true,
            animationParams: {
              type: "load",
              mode: "graph",
              isDirected: payload.Directed,
            },
          };
        }
      }
    }
    return {
      animationData: data,
      isResetAction: true,
      useRawAnimationParams: true,
      animationParams: { type: "refresh", mode: "graph", isDirected },
    };
  }
  return null;
}

const graphCodeConfig: CodeConfig = {
  pseudo: {
    content: `Class Graph:
  Procedure AddVertex(id):
    If id is not in adjList Then
      adjList[id] ← Empty List
    End If
  End Procedure

  Procedure RemoveVertex(id):
    If id is in adjList Then
      Remove adjList[id]
      For Each u in adjList Do
        If id is in adjList[u] Then
          Remove id from adjList[u]
        End If
      End For
    End If
  End Procedure

  Procedure AddEdge(u, v):
    If u in adjList And v in adjList Then
      If v is not in adjList[u] Then
        Append v to adjList[u]
      End If
      If isDirected = False Then
        If u is not in adjList[v] Then
          Append u to adjList[v]
        End If
      End If
    End If
  End Procedure

  Procedure RemoveEdge(u, v):
    If u in adjList And v in adjList Then
      If v is in adjList[u] Then
        Remove v from adjList[u]
      End If
      If isDirected = False Then
        If u is in adjList[v] Then
          Remove u from adjList[v]
        End If
      End If
    End If
  End Procedure

  Procedure GetNeighbors(id):
    If id is in adjList Then
      Return adjList[id]
    End If
    Return Empty List
  End Procedure

  Procedure CheckAdjacent(u, v):
    If u is in adjList Then
      Return v is in adjList[u]
    End If
    Return False
  End Procedure

  Procedure GetDegree(id):
    If id is not in adjList Then
      Return -1
    End If
    If isDirected = False Then
      Return size of adjList[id]
    Else
      outDeg ← size of adjList[id]
      inDeg ← number of nodes that point to id
      Return outDeg, inDeg
    End If
  End Procedure

  Procedure CheckConnected():
    visited ← Empty Set
    queue ← Empty Queue
    start ← First node in adjList
    visited.Add(start)
    queue.Enqueue(start)

    While queue is not Empty Do
      curr ← queue.Dequeue()
      For Each neighbor in adjList[curr] Do
        If neighbor is not in visited Then
          visited.Add(neighbor)
          queue.Enqueue(neighbor)
        End If
      End For
    End While

    Return size of visited = size of adjList
  End Procedure

  Procedure CheckCycle():
    visited ← Empty Set
    recStack ← Empty Set
    pathStack ← Empty Stack

    Function DFS(curr, parent):
      visited.Add(curr)
      recStack.Add(curr)
      pathStack.Push(curr)

      For Each neighbor in adjList[curr] Do
        If neighbor is not in visited Then
          result ← DFS(neighbor, curr)
          If result is not Null Then Return result
        Else If isDirected = True And neighbor is in recStack Then Return pathStack
        Else If isDirected = False And neighbor ≠ parent Then Return pathStack
      End For

      recStack.Remove(curr)
      pathStack.Pop()
      Return Null
    End Function

    For Each node in adjList Do
      If node is not in visited Then
        result ← DFS(node, Null)
        If result is not Null Then Return result
    End For
    Return Null
  End Procedure
End Class`,
    mappings: {
      [TAGS.ADD_VERTEX]: [2, 3, 4],
      [TAGS.ADD_VERTEX_RESULT]: [6],
      [TAGS.REMOVE_VERTEX]: [8, 9],
      [TAGS.REMOVE_VERTEX_UPDATE]: [10, 11, 12, 13, 14],
      [TAGS.ADD_EDGE]: [19, 20, 21, 22],
      [TAGS.ADD_EDGE_UNDIRECTED]: [24, 25, 26, 27],
      [TAGS.REMOVE_EDGE]: [32, 33, 34, 35],
      [TAGS.REMOVE_EDGE_UNDIRECTED]: [37, 38, 39, 40],
      [TAGS.GET_NEIGHBORS]: [45, 46],
      [TAGS.GET_NEIGHBORS_RESULT_TRUE]: [47],
      [TAGS.GET_NEIGHBORS_RESULT_FALSE]: [49],
      [TAGS.CHECK_ADJACENT]: [52, 53],
      [TAGS.CHECK_ADJACENT_RESULT_TRUE]: [54],
      [TAGS.CHECK_ADJACENT_RESULT_FALSE]: [56],
      [TAGS.GET_DEGREE_UNDIRECTED]: [63, 64],
      [TAGS.GET_DEGREE_DIRECTED]: [65, 66, 67, 68, 69],
      [TAGS.CHECK_CONNECTED_INIT]: [72, 73, 74, 75, 76, 77],
      [TAGS.CHECK_CONNECTED_WHILE]: [79, 80, 81, 82, 83, 84, 85, 86],
      [TAGS.CHECK_CONNECTED_RESULT]: [89],
      [TAGS.CHECK_CYCLE_INIT]: [92, 93, 94],
      [TAGS.CHECK_CYCLE_DFS]: [
        97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
        112,
      ],
      [TAGS.CHECK_CYCLE_FOUND_TRUE]: [105, 106],
      [TAGS.CHECK_CYCLE_FOUND_FALSE]: [112],
      [TAGS.CHECK_CYCLE_END_TRUE]: [116, 117, 118],
      [TAGS.CHECK_CYCLE_END_FALSE]: [120],
    },
  },
  python: {
    content: `class Graph:
    def __init__(self, is_directed: bool = False):
        self.adj_list = {}
        self.is_directed = is_directed

    def add_vertex(self, vertex_id: str) -> None:
        if vertex_id not in self.adj_list:
            self.adj_list[vertex_id] = []

    def remove_vertex(self, vertex_id: str) -> None:
        if vertex_id in self.adj_list:
            del self.adj_list[vertex_id]
            for u in self.adj_list:
                if vertex_id in self.adj_list[u]:
                    self.adj_list[u].remove(vertex_id)

    def add_edge(self, source: str, target: str) -> None:
        if source in self.adj_list and target in self.adj_list:
            if target not in self.adj_list[source]:
                self.adj_list[source].append(target)
            if not self.is_directed:
                if source not in self.adj_list[target]:
                    self.adj_list[target].append(source)

    def remove_edge(self, source: str, target: str) -> None:
        if source in self.adj_list and target in self.adj_list:
            if target in self.adj_list[source]:
                self.adj_list[source].remove(target)
            if not self.is_directed and source in self.adj_list[target]:
                self.adj_list[target].remove(source)

    def get_neighbors(self, vertex_id: str) -> list:
        if vertex_id in self.adj_list:
            return self.adj_list[vertex_id]
        return []

    def check_adjacent(self, source: str, target: str) -> bool:
        if source in self.adj_list:
            return target in self.adj_list[source]
        return False

    def get_degree(self, vertex_id: str) -> int:
        if vertex_id not in self.adj_list:
            return -1
        if not self.is_directed:
            return len(self.adj_list[vertex_id])
        out_deg = len(self.adj_list[vertex_id])
        in_deg = sum(1 for u in self.adj_list if vertex_id in self.adj_list[u])
        return out_deg, in_deg

    def check_connected(self) -> bool:
        if not self.adj_list:
            return True
        visited = set()
        start = next(iter(self.adj_list))
        queue = [start]
        visited.add(start)
        
        while queue:
            curr = queue.pop(0)
            for neighbor in self.adj_list[curr]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    
        return len(visited) == len(self.adj_list)

    def check_cycle(self) -> list:
        visited = set()
        rec_stack = set()
        path_stack = []
        
        def dfs(curr: str, parent: str) -> list:
            visited.add(curr)
            rec_stack.add(curr)
            path_stack.append(curr)
            
            for neighbor in self.adj_list[curr]:
                if neighbor not in visited:
                    result = dfs(neighbor, curr)
                    if result: return result
                elif self.is_directed and neighbor in rec_stack: return path_stack.copy()
                elif not self.is_directed and neighbor != parent: return path_stack.copy()
                
            rec_stack.remove(curr)
            path_stack.pop()
            return []
            
        for node in self.adj_list:
            if node not in visited:
                result = dfs(node, None)
                if result: return result
        return []`,
  },
};

export const GraphConfig: LevelImplementationConfig = {
  id: "graph",
  type: "dataStructure",
  name: "圖 (Graph)",
  categoryName: "非線性表",
  description:
    "由節點 (Vertex) 與邊 (Edge) 組成的資料結構，用於描述物件之間的關係。",
  i18nNamespace: "tutorials/graph",
  // TODO: 補完 Graph 的 pseudo code 與 mappings
  codeConfig: graphCodeConfig,
  linkAnimConfig: {
    animateOn: ["prepare", "target"],
    directOn: ["complete"],
  },
  complexity: {
    timeBest: "O(1)", // 存取特定節點
    timeAverage: "O(V + E)", // 遍歷
    timeWorst: "O(V + E)",
    space: "O(V + E)", // 儲存空間
  },
  introduction: `圖 (Graph) 是一種非線性的資料結構，由節點 (Vertex) 和邊 (Edge) 組成。
  
  - **節點 (Vertex)**: 代表資料元素，例如地圖上的城市、社交網絡中的人。
  - **邊 (Edge)**: 代表節點之間的關係，例如城市間的道路、朋友關係。
  
  圖可以分為「有向圖」與「無向圖」，也可以帶有權重 (Weighted)。在此演示中，我們展示的是無向無權圖。`,

  // 這裡使用了包含 graph 和 grid 的雙重結構，以支援切換模式
  defaultData: {
    nodes: [
      { id: "node-0" },
      { id: "node-1" },
      { id: "node-2" },
      { id: "node-3" },
      { id: "node-4" },
      { id: "node-5" },
      { id: "node-6" },
      { id: "node-7" },
      { id: "node-8" },
    ],
    edges: [
      ["node-0", "node-1"],
      ["node-0", "node-2"],
      ["node-1", "node-3"],
      ["node-2", "node-4"],
      ["node-3", "node-4"],
      ["node-3", "node-5"],
      ["node-4", "node-6"],
      ["node-5", "node-7"],
      ["node-6", "node-8"],
      ["node-7", "node-8"],
    ],
  },
  createAnimationSteps: createGraphAnimationSteps,
  realWorldStories: graphRealWorldStories,
  statusConfig: GraphStatusConfig,
  actionHandler: graphActionHandler,
  maxNodes: 20,
  renderActionBar: (props) => <GraphActionBar {...(props as any)} />,
  relatedProblems: [
    {
      id: 133,
      title: "Clone Graph",
      concept: "relatedProblems.133",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/clone-graph/",
    },
    {
      id: 207,
      title: "Course Schedule",
      concept: "relatedProblems.207",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule/",
    },
    {
      id: 210,
      title: "Course Schedule II",
      concept: "relatedProblems.210",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/course-schedule-ii/",
    },
    {
      id: 684,
      title: "Redundant Connection",
      concept: "relatedProblems.684",
      difficulty: "Medium",
      url: "https://leetcode.com/problems/redundant-connection/",
    },
    {
      id: 269,
      title: "Alien Dictionary",
      concept: "relatedProblems.269",
      difficulty: "Hard",
      url: "https://leetcode.com/problems/alien-dictionary/",
    },
  ],
};
