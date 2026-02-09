import { useState, useEffect, useRef } from "react";

interface AlgorithmNode {
  id: string;
  value?: number | string;
  x?: number;
  y?: number;
  position?: { x: number; y: number };
  [key: string]: any;
}

interface GraphData {
  nodes: AlgorithmNode[];
  edges: string[][];
}

type AlgorithmData = AlgorithmNode[] | GraphData;

export const useAlgorithmLogic = (config: any) => {
  const [data, setData] = useState<AlgorithmData>([]);
  const [activeSteps, setActiveSteps] = useState<any[]>([]);
  const nextIdRef = useRef(100);

  // 將純數字陣列轉為 Box 物件 (給排序/搜尋用)
  const initLinearData = (rawValues: number[]) => {
    return rawValues.map((val) => ({
      id: `box-${nextIdRef.current++}`,
      value: val,
      position: { x: 0, y: 0 },
    }));
  };

  // 深拷貝資料 (給 Graph/Grid 用，避免修改到 config)
  const cloneData = <T>(source: T): T => {
    return JSON.parse(JSON.stringify(source));
  };

  const generateSteps = (inputData: AlgorithmData, actionParams?: any) => {
    if (config && config.createAnimationSteps) {
      return config.createAnimationSteps(inputData, actionParams);
    }
    return [];
  };

  useEffect(() => {
    if (config?.defaultData) {
      let initialData;
      let initialMode = "graph";

      // 判斷資料類型
      if (Array.isArray(config.defaultData)) {
        // A. 排序/搜尋：純數字陣列 -> 轉物件
        // 如果 defaultData 裡已經是物件 (像 BFS grid 定義)，直接 clone
        const isObjectArray = typeof config.defaultData[0] === "object";
        if (isObjectArray) {
          initialData = cloneData(config.defaultData);
        } else {
          initialData = config.defaultData.map((d: any) => ({
            ...d,
            id: d.id || `box-${nextIdRef.current++}`,
          }));
        }
      } else {
        // B. Graph/BFS：複合物件 ({ graph: ..., grid: ... })
        // 預設先載入 graph
        if (config.defaultData.graph) {
          initialData = cloneData(config.defaultData.graph);
          initialMode = "graph";
        } else {
          initialData = cloneData(config.defaultData);
        }
      }

      const steps = generateSteps(initialData, { mode: initialMode });

      // 初始化時也要同步座標 (如果是 Graph)
      if (initialMode === "graph" && steps.length > 0) {
        syncCoordinates(initialData, steps[0].elements);
      }

      setData(initialData);
      setActiveSteps(steps);
    }
  }, [config]);

  const generateRandomGrid = (rows: number, cols: number) => {
    const grid = [];
    for (let i = 0; i < rows * cols; i++) {
      // 40% 機率是牆 (1)，60% 是路 (0)
      const isWall = Math.random() < 0.4 ? 1 : 0;
      grid.push({
        id: `box-${i}`,
        val: isWall,
      });
    }
    // 確保起點 (0) 和終點 (最後一個) 是路
    grid[0].val = 0;
    grid[grid.length - 1].val = 0;
    return grid;
  };

  const generateRandomGraph = (nodeCount: number): GraphData => {
    const nodes: AlgorithmNode[] = [];
    const edges: string[][] = [];

    // 1. 建立節點
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({ id: `node-${i}` });
    }

    // 2. 確保連通性 (生成一棵隨機樹)
    // 策略：對於每個節點 i (從 1 開始)，隨機連到一個前面的節點 (0 ~ i-1)
    // 這保證了圖是連通的，且每個節點至少有一條邊
    for (let i = 1; i < nodeCount; i++) {
      const targetIndex = Math.floor(Math.random() * i);
      edges.push([`node-${i}`, `node-${targetIndex}`]);
    }

    // 3. 增加額外的隨機邊 (讓圖看起來更像網狀，而不只是樹)
    // 嘗試增加 nodeCount * 0.5 條邊
    const extraEdges = Math.floor(nodeCount * 0.5);
    for (let k = 0; k < extraEdges; k++) {
      const u = Math.floor(Math.random() * nodeCount);
      const v = Math.floor(Math.random() * nodeCount);

      if (u !== v) {
        // 簡單檢查邊是否重複 (無向圖需檢查 u-v 和 v-u)
        const exists = edges.some(
          (e) =>
            (e[0] === `node-${u}` && e[1] === `node-${v}`) ||
            (e[0] === `node-${v}` && e[1] === `node-${u}`),
        );

        if (!exists) {
          edges.push([`node-${u}`, `node-${v}`]);
        }
      }
    }

    return { nodes, edges };
  };

  const syncCoordinates = (
    rawData: AlgorithmData,
    calculatedElements: AlgorithmNode[],
  ) => {
    if (!rawData || !calculatedElements) return;

    const isGraphData = (d: any): d is GraphData => {
      return d && !Array.isArray(d) && Array.isArray(d.nodes);
    };

    // 只有 Graph 模式 (rawData 是物件且有 nodes) 需要同步座標
    if (isGraphData(rawData)) {
      const nodeMap = new Map(calculatedElements.map((el) => [el.id, el]));

      rawData.nodes.forEach((rawNode: any) => {
        const calculatedNode = nodeMap.get(rawNode.id);
        // 如果找到對應的已計算節點，且它有座標
        if (calculatedNode) {
          // 同時嘗試讀取 position 物件或直接讀取 x, y 屬性
          // 這是為了防止 Node 實作差異導致讀不到座標
          const x = calculatedNode.position?.x ?? calculatedNode.x;
          const y = calculatedNode.position?.y ?? calculatedNode.y;

          // 只有當座標是有效數字時才寫入，否則給預設值避免黑畫面
          if (
            typeof x === "number" &&
            typeof y === "number" &&
            !isNaN(x) &&
            !isNaN(y)
          ) {
            rawNode.x = x;
            rawNode.y = y;
          } else {
            rawNode.x = 500;
            rawNode.y = 200;
          }
        }
      });
    }
  };

  const executeAction = (actionType: string, payload: any) => {
    let newData = cloneData(data);

    if (actionType === "random") {
      if (config.id === "binarysearch") {
        // 做個排序
        const sortedValues = Array.from({ length: 10 }, () =>
          Math.floor(Math.random() * 100),
        ).sort((a, b) => a - b);
        newData = initLinearData(sortedValues);
      } else if (config.id === "bfs" || config.id === "dfs") {
        const mode = payload?.mode || "graph";
        if (mode === "grid") {
          const rows = payload?.rows || 3;
          const cols = payload?.cols || 5;
          newData = generateRandomGrid(rows, cols);

          const steps = generateSteps(newData, { mode: "grid", cols: cols });
          setData(newData);
          setActiveSteps(steps);
          return steps;
        } else {
          const randomCount = Math.floor(Math.random() * 6) + 5;
          newData = generateRandomGraph(randomCount);

          const steps = generateSteps(newData, { mode: "graph" });

          // 記得同步座標，因為是新生成的圖，需要 D3 計算排版
          if (steps.length > 0) {
            syncCoordinates(newData, steps[0].elements);
          }

          setData(newData);
          setActiveSteps(steps);
          return steps;
        }
      } else {
        // 原本隨機邏輯
        const count = 10;
        const randomValues = Array.from(
          { length: count },
          () => Math.floor(Math.random() * 100) - 20,
        );
        newData = initLinearData(randomValues);
      }

      // 隨機資料生成後，立刻計算所有步驟
      const steps = generateSteps(newData, payload);

      setData(newData);
      setActiveSteps(steps);
      // 回傳 steps 讓 Tutorial 可以重置 currentStep
      // 不自動播放 (return null 或空陣列)，除非想自動播
      return steps;
    } else if (actionType === "load") {
      let loadValues: number[] = [];
      let gridCols = 5; // 預設
      let isGridLoad = false;
      let isGraphLoad = false;
      let graphPayload: { nodes: any[]; edges: string[][] } | null = null;

      // 檢查是否為 Grid 特殊格式 (如果是字串)
      if (typeof payload.data === "string") {
        if (payload.data.startsWith("GRID:")) {
          const parts = payload.data.split(":");
          if (parts.length === 3) {
            gridCols = parseInt(parts[1]);
            loadValues = parts[2].split(",").map(Number);
            isGridLoad = true;
          }
        } else if (payload.data.startsWith("GRAPH:")) {
          // 格式: GRAPH:nodeCount:0 1,0 2,1 3...
          const parts = payload.data.split(":");
          if (parts.length >= 3) {
            const nodeCount = parseInt(parts[1]);
            const edgeStr = parts.slice(2).join(":"); // 避免 edge data 裡也有冒號(雖然機率低)

            // 1. 生成節點 (強制使用確定性 ID: node-0, node-1...)
            const nodes = [];
            for (let i = 0; i < nodeCount; i++) {
              nodes.push({ id: `node-${i}` }); // 不使用 nextIdRef，確保 ID 穩定
            }

            // 2. 生成邊
            const edges: string[][] = [];
            if (edgeStr.trim() !== "") {
              const edgePairs = edgeStr.split(","); // 分割每組邊
              edgePairs.forEach((pair: string) => {
                // pair 可能是 "0 1" (空白分隔)
                const [u, v] = pair.trim().split(/\s+/);
                if (u !== undefined && v !== undefined) {
                  // 將使用者的數字輸入 "0" 轉為內部 ID "node-0"
                  const uIdx = parseInt(u);
                  const vIdx = parseInt(v);
                  if (
                    uIdx >= 0 &&
                    uIdx < nodeCount &&
                    vIdx >= 0 &&
                    vIdx < nodeCount
                  ) {
                    edges.push([`node-${uIdx}`, `node-${vIdx}`]);
                  }
                }
              });
            }

            graphPayload = { nodes, edges };
            isGraphLoad = true;
          }
        }
      } else if (Array.isArray(payload.data)) {
        loadValues = payload.data;
        if (config.id === "binarysearch") {
          // 做個排序
          loadValues = [...payload.data].sort((a: number, b: number) => a - b);
        }
      }

      if (isGraphLoad && graphPayload) {
        newData = cloneData(graphPayload);
        const steps = generateSteps(newData, { mode: "graph" });

        // 新載入的 Graph 沒有座標，必須同步 (觸發 D3 計算)
        if (steps.length > 0) {
          syncCoordinates(newData, steps[0].elements);
          console.log("Synced Coordinates:", newData.nodes[0]);
        }

        setData(newData);
        setActiveSteps(steps);
        return steps;
      } else if (loadValues.length > 0) {
        if (isGridLoad) {
          newData = loadValues.map((val, i) => ({
            id: `box-${i}`,
            val: val,
          }));

          const steps = generateSteps(newData, {
            mode: "grid",
            cols: gridCols,
          });
          setData(newData);
          setActiveSteps(steps);
          return steps;
        } else {
          newData = initLinearData(loadValues);
          const steps = generateSteps(newData, payload);
          setData(newData);
          setActiveSteps(steps);
          return steps;
        }
      }
      return [];
    } else if (actionType === "reset") {
      // Linear (Array) Reset
      if (Array.isArray(config.defaultData)) {
        const isObjectArray = typeof config.defaultData[0] === "object";
        if (isObjectArray) {
          newData = cloneData(config.defaultData);
        } else {
          newData = config.defaultData.map((d: any) => ({
            ...d,
            id: d.id || `box-${nextIdRef.current++}`,
          }));
        }
        const steps = generateSteps(newData, payload);
        setData(newData);
        setActiveSteps(steps);
        return steps;
      }
      // Grid / Graph Reset
      else {
        const mode = payload?.mode || "graph";

        if (mode === "grid") {
          // Grid Reset
          newData = cloneData(config.defaultData.grid);
          const defaultCols = 5;
          const steps = generateSteps(newData, {
            mode: "grid",
            cols: defaultCols,
            ...payload,
          });
          setData(newData);
          setActiveSteps(steps);
          return steps;
        } else {
          // Graph Reset
          const oldData = data; // 參照舊資料
          newData = cloneData(config.defaultData.graph) as GraphData; // 重置為預設資料

          const isGraphData = (d: any): d is GraphData => {
            return d && !Array.isArray(d) && Array.isArray(d.nodes);
          };

          if (isGraphData(oldData)) {
            const coordMap = new Map(
              oldData.nodes.map((n) => [n.id, { x: n.x, y: n.y }]),
            );

            newData.nodes.forEach((n) => {
              const saved = coordMap.get(n.id);
              if (saved && saved.x != null && saved.y != null) {
                n.x = saved.x;
                n.y = saved.y;
              }
            });
          }

          const steps = generateSteps(newData, { mode: "graph", ...payload });

          // 如果沒有座標(上面沒抓到)，這裡會從步驟中同步
          if (steps.length > 0) {
            syncCoordinates(newData, steps[0].elements);
          }

          setData(newData);
          setActiveSteps(steps);
          return steps;
        }
      }
    } else if (actionType === "run") {
      // 因為在資料改變時 (random/load/reset) 已經生成好步驟了
      // 這裡只需要回傳當前的 activeSteps 讓 UI 知道要開始播放即可
      const steps = config.createAnimationSteps(newData, payload);

      if (steps.length > 0 && !Array.isArray(newData)) {
        syncCoordinates(newData, steps[0].elements);
      }

      // 這裡不需要 setData，因為 newData 只是多填了 x,y，結構沒變
      // 但為了讓 React 狀態一致，還是 set 一下
      setData(newData);
      setActiveSteps(steps);
      return steps;
    } else if (actionType === "switchMode") {
      if (payload.mode === "graph") {
        newData = cloneData(config.defaultData.graph);
      } else {
        newData = cloneData(config.defaultData.grid);
      }

      const steps = config.createAnimationSteps(newData, {
        ...payload, // 包含 mode: 'graph' | 'grid'
        action: actionType,
      });

      // 同步座標：計算完第一次 Layout 後，存回 newData
      if (payload.mode === "graph" && steps.length > 0) {
        syncCoordinates(newData, steps[0].elements);
      }

      setData(newData);
      setActiveSteps(steps);

      return steps;
    }
    return [];
  };

  return { data, activeSteps, executeAction };
};
