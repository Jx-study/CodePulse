import { useState, useEffect, useRef } from "react";
import { getBSTArrayAfterDelete } from "@/data/DataStructure/nonlinear/BinarySearchTree";

export const useDataStructureLogic = (config: any) => {
  const [data, setData] = useState<any>(config?.defaultData || []);
  const [activeSteps, setActiveSteps] = useState<any[]>([]);
  const nextIdRef = useRef(100); // 通用 ID 計數器

  // 初始化
  useEffect(() => {
    if (config) {
      const initData = (config.defaultData || []).map((item: any) => ({
        ...item,
      }));
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
    let newData = data.map((item: any) => ({ ...item }));
    let finalData = null;
    let { value, mode, index, targetId, hasTailMode, data: loadData } = payload; // 解構常用參數

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
        if (newData.length === 0) {
          alert("Singly Linked List is empty");
          return [];
        }
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
          // 如果沒刪到東西，直接 return 避免錯誤
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
        if (newData.length === 0) {
          alert("Stack is empty");
          return [];
        }
        const delBox = newData.pop();
        if (delBox) {
          targetId = delBox.id;
          value = delBox.value;
          payload.mode = "Pop";
        }
      } else if (actionType === "peek") {
        if (newData.length > 0) {
          const topNode = newData[newData.length - 1];
          targetId = topNode.id;
          value = topNode.value;
          payload.mode = "Peek";
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
        if (newData.length === 0) {
          alert("Queue is empty");
          return [];
        }
        // 刪除第一個
        const delBox = newData.shift();
        if (delBox) {
          targetId = delBox.id;
          value = delBox.value;
          payload.mode = "Dequeue";
        }
      } else if (actionType === "peek") {
        // Queue Peek: 看第一個 (Front)
        if (newData.length > 0) {
          const frontNode = newData[0];
          targetId = frontNode.id;
          value = frontNode.value;
          payload.mode = "Peek";
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
    } else if (config.id === "array") {
      if (actionType === "add" && mode === "Insert") {
        const idx = index !== undefined ? index : newData.length;
        // 防呆：如果 index 超出範圍，修正或報錯
        const safeIdx = Math.max(0, Math.min(idx, newData.length));

        const newId = `box-${nextIdRef.current++}`;
        const tailBox = { id: newId, value: 0 };

        newData.push(tailBox); // 插入到指定位置

        // [A, B, C, New] -> 搬移 -> [A, B, B, C] -> 賦值 -> [A, New, B, C]
        for (let i = newData.length - 1; i > safeIdx; i--) {
          newData[i].value = newData[i - 1].value;
        }

        newData[safeIdx].value = value;

        targetId = newId;
        payload.index = safeIdx;
      }
      // Update(Add 動作的一種，只是不改變長度)
      else if (actionType === "add" && mode === "Update") {
        const idx = index !== undefined ? index : -1;
        if (idx >= 0 && idx < newData.length) {
          const oldValue = newData[idx].value;

          const newBox = { ...newData[idx], value: value };
          newData[idx] = newBox;

          targetId = newBox.id;
          payload.index = idx;
          payload.oldValue = oldValue;
        }
      } else if (actionType === "delete") {
        let idx = index;

        if (newData.length === 0) {
          alert("Array is empty");
          return [];
        }

        if (idx === undefined || idx >= newData.length)
          idx = newData.length - 1;
        else if (idx < 0) idx = 0;

        if (idx >= 0 && idx < newData.length) {
          value = newData[idx].value;

          const lastBox = newData[newData.length - 1];
          targetId = lastBox.id;

          // [A, Del, B, C] -> 搬移 -> [A, B, C, C] -> Pop -> [A, B, C]
          for (let i = idx; i < newData.length - 1; i++) {
            newData[i].value = newData[i + 1].value;
          }

          // 移除最後一個元素
          newData.pop();

          payload.index = idx;
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
    } else if (config.id === "binarytree" || config.id === "bst") {
      if (actionType === "add") {
        const newId = `node-${nextIdRef.current++}`;
        newData.push({
          id: newId,
          value: value,
        });
        targetId = newId;
      } else if (actionType === "delete") {
        const delValue = index;
        const delIndex = newData.findIndex(
          (node: any) => node.value === delValue
        );

        if (delIndex !== -1) {
          if (config.id === "bst") {
            finalData = getBSTArrayAfterDelete(newData, delValue);
          } else {
            const temp = [...newData];
            temp.splice(delIndex, 1);
            finalData = temp;
          }
        } else {
          alert(`數值 ${delValue} 不存在`);
          return [];
        }
      } else if (["random", "reset", "load", "refresh"].includes(actionType)) {
        isResetAction = true;

        if (actionType === "random") {
          const count = Math.floor(Math.random() * (payload.maxNodes - 2)) + 3;
          newData = [];
          for (let i = 0; i < count; i++) {
            newData.push({
              id: `node-${nextIdRef.current++}`,
              value: Math.floor(Math.random() * 100),
            });
          }
        } else if (actionType === "reset") {
          newData = config.defaultData.map((d: any) => ({
            ...d,
            id: `node-${nextIdRef.current++}`,
          }));
        } else if (actionType === "load") {
          if (loadData && Array.isArray(loadData)) {
            newData = loadData.map((v: number) => ({
              id: `node-${nextIdRef.current++}`,
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

    setData(finalData || newData);
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
