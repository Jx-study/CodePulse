import { useState, useEffect, useRef } from "react";

export const useAlgorithmLogic = (config: any) => {
  const [data, setData] = useState<any[]>([]);
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
  const cloneData = (source: any) => {
    return JSON.parse(JSON.stringify(source));
  };

  const generateSteps = (inputData: any[], actionParams?: any) => {
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

  const syncCoordinates = (rawData: any, calculatedElements: any[]) => {
    if (!rawData || !calculatedElements) return;

    // 只有 Graph 模式 (rawData 是物件且有 nodes) 需要同步座標
    if (!Array.isArray(rawData) && rawData.nodes) {
      const nodeMap = new Map(calculatedElements.map((el) => [el.id, el]));

      rawData.nodes.forEach((rawNode: any) => {
        const calculatedNode = nodeMap.get(rawNode.id);
        // 如果找到對應的已計算節點，且它有座標
        if (calculatedNode && calculatedNode.position) {
          rawNode.x = calculatedNode.position.x;
          rawNode.y = calculatedNode.position.y;
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
        }
        // (graph random logic)

        // newData = cloneData(config.defaultData[mode]);
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

      // 檢查是否為 Grid 特殊格式 (如果是字串)
      if (
        typeof payload.data === "string" &&
        payload.data.startsWith("GRID:")
      ) {
        const parts = payload.data.split(":");
        if (parts.length === 3) {
          gridCols = parseInt(parts[1]);
          loadValues = parts[2].split(",").map(Number);
          isGridLoad = true;
        }
      } else if (Array.isArray(payload.data)) {
        loadValues = payload.data;
        if (config.id === "binarysearch") {
          // 做個排序
          loadValues = [...payload.data].sort((a: number, b: number) => a - b);
        }
      }

      if (loadValues.length > 0) {
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
      if (Array.isArray(config.defaultData)) {
        // Linear
        const isObjectArray = typeof config.defaultData[0] === "object";
        if (isObjectArray) {
          newData = cloneData(config.defaultData);
        } else {
          newData = config.defaultData.map((d: any) => ({
            ...d,
            id: d.id || `box-${nextIdRef.current++}`,
          }));
        }
      } else {
        const mode = payload?.mode || "graph";

        if (mode === "grid") {
          // 從 config 載入預設的 Grid 資料
          newData = cloneData(config.defaultData.grid);

          // 如果 defaultData 有變更，這裡的 5 也要跟著改，或是寫在 config 裡
          const defaultCols = 5;

          // 生成初始步驟 (必須傳入 cols，否則 utils 會算錯座標)
          const steps = generateSteps(newData, {
            mode: "grid",
            cols: defaultCols,
            ...payload,
          });

          setData(newData);
          setActiveSteps(steps);
          return steps;
        } else {
          let tmpData = cloneData(config.defaultData.graph);

          newData.nodes.forEach((n: any) => {
            const coords = tmpData.nodes.find(
              (tmp: any) => tmp.id === n.id,
            )?.coords;
            if (coords) {
              n.x = coords.x;
              n.y = coords.y;
            }
          });

          const steps = generateSteps(newData, {
            mode: "graph",
            ...payload,
          });

          setData(newData);
          setActiveSteps(steps);
          return steps;
        }
      }

      const steps = generateSteps(newData, payload);

      setData(newData);
      setActiveSteps(steps);
      return steps;
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
