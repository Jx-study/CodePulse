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

  const executeAction = (actionType: string, payload: any) => {
    let newData = cloneData(data);

    if (actionType === "random") {
      if (config.id === "binarysearch") {
        // 做個排序
        const sortedValues = Array.from({ length: 10 }, () =>
          Math.floor(Math.random() * 100)
        ).sort((a, b) => a - b);
        newData = initLinearData(sortedValues);
      } else if (config.id === "bfs" || config.id === "dfs") {
        // 針對 BFS/DFS 的隨機 (這裡先保留原樣或實作隨機圖形)
        // 暫時重置回預設，避免報錯
        const mode = payload?.mode || "graph";
        if (mode === "grid") {
          const rows = payload?.rows || 3;
          const cols = payload?.cols || 5;
          console.log("generate random grid:", rows, cols);

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
          () => Math.floor(Math.random() * 100) - 20
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
      if (payload.data && Array.isArray(payload.data)) {
        let loadValues = payload.data;
        if (config.id === "binarysearch") {
          // 做個排序
          loadValues = [...payload.data].sort((a: number, b: number) => a - b);
        }
        newData = initLinearData(loadValues);
        const steps = generateSteps(newData, payload);
        setData(newData);
        setActiveSteps(steps);
        return steps;
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
        // Graph/BFS (預設回 graph，或根據當前 mode?)
        // 通常 reset 會想回到當前 mode 的預設值
        // 但這裡沒存 mode，只好先回 graph，或者透過 payload 傳入 mode
        const mode = payload?.mode || "graph";
        newData = cloneData(
          config.defaultData[mode] || config.defaultData.graph
        );
      }

      const steps = generateSteps(newData, payload);

      setData(newData);
      setActiveSteps(steps);
      return steps;
    } else if (actionType === "run") {
      // 因為在資料改變時 (random/load/reset) 已經生成好步驟了
      // 這裡只需要回傳當前的 activeSteps 讓 UI 知道要開始播放即可
      // 或者也可以選擇在這裡才生成步驟，這邊假設步驟已就緒
      if (config.createAnimationSteps) {
        const steps = config.createAnimationSteps(newData, payload);
        setActiveSteps(steps);
        return steps;
      }
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

      setData(newData);
      setActiveSteps(steps);

      return steps;
    }
    return [];
  };

  return { data, activeSteps, executeAction };
};
