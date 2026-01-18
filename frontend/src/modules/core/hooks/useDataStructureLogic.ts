import { useState, useEffect, useRef } from "react";

export const useDataStructureLogic = (config: any) => {
  const [data, setData] = useState<any>(config?.defaultData || []);
  const [activeSteps, setActiveSteps] = useState<any[]>([]);
  const nextIdRef = useRef(100); // 通用 ID 計數器

  // 初始化
  useEffect(() => {
    if (config) {
      const initData = config.defaultData || [];
      setData(initData);

      if (config.createAnimationSteps) {
        const initSteps = config.createAnimationSteps(
          initData,
          undefined,
          false
        );
        setActiveSteps(initSteps);
      }
    }
  }, [config]);

  // 通用操作介面
  const executeAction = (actionType: string, payload: any) => {
    let newData = [...data]; // 這裡假設 data 是 array，如果是 Tree/Graph 需深拷貝
    let {
      value,
      mode,
      index,
      targetId,
      hasTailMode,
      maxNodes,
      data: loadData,
    } = payload; // 解構常用參數

    let isResetAction = false;

    if (config.id === "linkedlist") {
      if (actionType === "add") {
        const newId = `node-${nextIdRef.current++}`;
        const newNode = { id: newId, value: value };

        targetId = newId;

        if (mode === "Head") {
          newData.unshift(newNode);
        } else if (mode === "Tail") {
          newData.push(newNode);
        } else if (mode === "Node N") {
          const idx = index !== undefined ? index : -1;
          if (idx < 0) newData.unshift(newNode);
          else if (idx >= data.length) newData.push(newNode);
          else newData.splice(idx + 1, 0, newNode);
        }
      } else if (actionType === "delete") {
        let deletedNode = null;
        if (mode === "Head") {
          deletedNode = newData[0];
          if (deletedNode) newData.shift();
        } else if (mode === "Tail") {
          deletedNode = newData[newData.length - 1];
          if (deletedNode) newData.pop();
        } else if (mode === "Node N") {
          const idx = index !== undefined ? index : -1;
          if (idx >= 0 && idx < newData.length) {
            deletedNode = newData[idx];
            newData.splice(idx, 1);
          }
        }

        if (deletedNode) {
          targetId = deletedNode.id;
          value = deletedNode.value; // 確保動畫能顯示被刪除的數值
        } else {
          // 如果沒刪到東西（例如空陣列），直接 return 避免錯誤
          console.warn("No node deleted");
          return [];
        }
      } else if (actionType === "load") {
        newData = payload.data.map((v: number) => ({
          id: `node-${nextIdRef.current++}`,
          value: v,
        }));
        isResetAction = true;
      } else if (actionType === "random") {
        const count = Math.floor(Math.random() * (payload.maxNodes - 2)) + 3;
        newData = [];
        for (let i = 0; i < count; i++) {
          newData.push({
            id: `node-${nextIdRef.current++}`,
            value: Math.floor(Math.random() * 100),
          });
        }
        isResetAction = true;
      } else if (actionType === "reset") {
        newData = config.defaultData.map((d: any) => ({
          ...d,
          id: `node-${nextIdRef.current++}`,
        }));
        isResetAction = true;
      } else if (actionType === "refresh") {
        // 純粹刷新畫面 (例如切換 Tail Mode)
        isResetAction = true;
      }
      // search 不需要改變 newData
    } else if (config.id === "stack") {
      if (actionType === "add") {
        const newId = `box-${nextIdRef.current++}`;
        const newBox = { id: newId, value: value };
        newData.push(newBox);

        targetId = newId;
        payload.mode = "Push";
      } else if (actionType === "delete") {
        const delBox = newData.pop();
        if (delBox) {
          targetId = delBox.id;
          value = delBox.value;
          payload.mode = "Pop";
        }
      } else if (["random", "reset", "load", "refresh"].includes(actionType)) {
        isResetAction = true;
        if (actionType === "random") {
          const count = Math.floor(Math.random() * (payload.maxNodes - 2)) + 3;
          newData = [];
          for (let i = 0; i < count; i++)
            newData.push({
              id: `box-${nextIdRef.current++}`,
              value: Math.floor(Math.random() * 100),
            });
        } else if (actionType === "reset") {
          newData = config.defaultData.map((d: any) => ({
            ...d,
            id: `box-${nextIdRef.current++}`,
          }));
        } else if (actionType === "load") {
          if (loadData && Array.isArray(loadData)) {
            newData = loadData.map((v: number) => ({
              id: `box-${nextIdRef.current++}`,
              value: v,
            }));
          }
        }
      }
    } else if (config.id === "queue") {
      if (actionType === "add") {
        const newId = `box-${nextIdRef.current++}`;
        const newBox = { id: newId, value: value };
        newData.push(newBox);

        targetId = newId;
        payload.mode = "Enqueue";
      } else if (actionType === "delete") {
        // 刪除第一個
        const delBox = newData.shift();
        if (delBox) {
          targetId = delBox.id;
          value = delBox.value;
          payload.mode = "Dequeue";
        }
      } else if (["random", "reset", "load", "refresh"].includes(actionType)) {
        isResetAction = true;
        if (actionType === "random") {
          const count = Math.floor(Math.random() * (payload.maxNodes - 2)) + 3;
          newData = [];
          for (let i = 0; i < count; i++)
            newData.push({
              id: `box-${nextIdRef.current++}`,
              value: Math.floor(Math.random() * 100),
            });
        } else if (actionType === "reset") {
          newData = config.defaultData.map((d: any) => ({
            ...d,
            id: `box-${nextIdRef.current++}`,
          }));
        } else if (actionType === "load") {
          if (loadData && Array.isArray(loadData)) {
            newData = loadData.map((v: number) => ({
              id: `box-${nextIdRef.current++}`,
              value: v,
            }));
          }
        }
      }
    }

    const finalPayload = {
      type: actionType,
      ...payload,
      targetId,
      value,
    };

    const actionParam = isResetAction ? undefined : finalPayload;

    // 生成動畫
    const steps = config.createAnimationSteps(
      newData,
      actionParam,
      hasTailMode
    );

    setData(newData);
    setActiveSteps(steps);
    return steps;
  };

  return {
    data,
    setData,
    activeSteps,
    executeAction,
  };
};
