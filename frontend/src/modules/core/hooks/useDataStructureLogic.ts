import { useState, useEffect, useRef } from "react";
import { getBSTArrayAfterDelete } from "@/data/DataStructure/nonlinear/BinarySearchTree";

interface GraphNode {
  id: string;
  value?: number | string;
  x?: number;
  y?: number;
  position?: { x: number; y: number };
  [key: string]: any;
}

interface GraphData {
  nodes: GraphNode[];
  edges: string[][];
}

export const useDataStructureLogic = (config: any) => {
  const [data, setData] = useState<any>(config?.defaultData || []);
  const [activeSteps, setActiveSteps] = useState<any[]>([]);
  const nextIdRef = useRef(100); // 通用 ID 計數器

  const cloneData = (source: any) => {
    return JSON.parse(JSON.stringify(source));
  };

  const generateRandomGraph = (nodeCount: number): GraphData => {
    const nodes: GraphNode[] = [];
    const edges: string[][] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({ id: `node-${i}`, value: String(i) });
    }

    // 確保連通
    for (let i = 1; i < nodeCount; i++) {
      const targetIndex = Math.floor(Math.random() * i);
      edges.push([`node-${i}`, `node-${targetIndex}`]);
    }

    // 增加隨機邊
    const extraEdges = Math.floor(nodeCount * 0.5);
    for (let k = 0; k < extraEdges; k++) {
      const u = Math.floor(Math.random() * nodeCount);
      const v = Math.floor(Math.random() * nodeCount);
      if (u !== v) {
        const exists = edges.some(
          (e) =>
            (e[0] === `node-${u}` && e[1] === `node-${v}`) ||
            (e[0] === `node-${v}` && e[1] === `node-${u}`),
        );
        if (!exists) edges.push([`node-${u}`, `node-${v}`]);
      }
    }
    return { nodes, edges };
  };

  const syncCoordinates = (rawData: any, calculatedElements: any[]) => {
    if (!rawData || !calculatedElements || !rawData.nodes) return;
    const nodeMap = new Map(calculatedElements.map((el) => [el.id, el]));

    rawData.nodes.forEach((rawNode: any) => {
      const calculatedNode = nodeMap.get(rawNode.id);
      if (calculatedNode) {
        const x = calculatedNode.position?.x ?? calculatedNode.x;
        const y = calculatedNode.position?.y ?? calculatedNode.y;
        if (typeof x === "number" && typeof y === "number") {
          rawNode.x = x;
          rawNode.y = y;
        }
      }
    });
  };

  // 初始化
  useEffect(() => {
    if (config) {
      const initData = cloneData(config.defaultData || []);
      setData(initData);

      if (config.createAnimationSteps) {
        const initParams =
          config.id === "graph" ? { mode: "graph" } : undefined;
        const initSteps = config.createAnimationSteps(
          initData,
          initParams,
          false,
        );
        // const initSteps = config.createAnimationSteps(
        //   initData,
        //   undefined,
        //   false,
        // );
        if (config.id === "graph" && initSteps.length > 0) {
          syncCoordinates(initData, initSteps[0].elements);
          setData(cloneData(initData)); // 同步座標後更新 state
        }

        setActiveSteps(initSteps);
      }
    }
  }, [config]);

  // 通用操作介面
  const executeAction = (actionType: string, payload: any) => {
    let newData = cloneData(data);
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
          (node: any) => node.value === delValue,
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
    } else if (config.id === "graph") {
      if (Array.isArray(newData) || !newData.nodes) {
        console.error("Graph data structure mismatch:", newData);
        return [];
      }

      const { nodes, edges } = newData; // 解構 graph data
      const isDirected = payload.isDirected;

      if (actionType === "addVertex") {
        if (!payload.value || String(payload.value).trim() === "") {
          alert("請輸入節點 ID");
          return [];
        }

        // payload.value 是輸入框的值 (例如 "A")
        const val = payload.value
          ? String(payload.value)
          : `node-${nodes.length}`;
        // 使用 value 當 id
        const id = `node-${val}`;

        if (!nodes.find((n: any) => n.id === id)) {
          nodes.push({ id: id, value: val }); // 新增節點
        } else {
          alert(`節點 ${val} 已存在`);
          return [];
        }
      } else if (actionType === "removeVertex") {
        if (!payload.id || String(payload.id).trim() === "") {
          alert("請輸入節點 ID");
          return [];
        }

        // payload.id 是輸入框的值 (例如 "A")，要轉成內部 id "node-A"
        const targetVal = String(payload.id);
        const targetId = `node-${targetVal}`;
        const idx = nodes.findIndex((n: any) => n.id === targetId);

        let deletedNodeCoords = { x: 0, y: 0 };

        if (idx !== -1) {
          deletedNodeCoords = { x: nodes[idx].x, y: nodes[idx].y };
          payload.deletedNodeCoords = deletedNodeCoords;
          nodes.splice(idx, 1);
          newData.edges = edges.filter(
            (e: any[]) => e[0] !== targetId && e[1] !== targetId,
          );
        } else {
          alert(`節點 ${targetVal} 不存在`);
          return [];
        }
      } else if (actionType === "addEdge") {
        const sourceVal = String(payload.source);
        const targetVal = String(payload.target);
        const sourceId = `node-${sourceVal}`;
        const targetId = `node-${targetVal}`;

        const sExists = nodes.find((n: any) => n.id === sourceId);
        const tExists = nodes.find((n: any) => n.id === targetId);

        if (sExists && tExists) {
          const exists = edges.some(
            (e: any[]) =>
              (e[0] === sourceId && e[1] === targetId) ||
              (!payload.isDirected && e[0] === targetId && e[1] === sourceId),
          );

          if (exists) {
            alert("該連線已存在");
            return [];
          }

          edges.push([sourceId, targetId]);
        } else {
          alert("來源或目標節點不存在");
          return [];
        }
      } else if (actionType === "removeEdge") {
        const sourceId = `node-${payload.source}`;
        const targetId = `node-${payload.target}`;
        const initialLength = edges.length;

        newData.edges = edges.filter((e: any[]) => {
          // 檢查是否為正向邊 (Source -> Target)
          const isForward = e[0] === sourceId && e[1] === targetId;

          // 檢查是否為反向邊 (Target -> Source)
          const isBackward = e[0] === targetId && e[1] === sourceId;

          if (isDirected)
            return !isForward; // 有向：只刪正向
          else return !(isForward || isBackward); // 無向：雙向都刪
        });

        if (newData.edges.length === initialLength) {
          alert("找不到該連線，無法刪除");
          return [];
        }
      } else if (actionType === "getNeighbors") {
        if (!payload.id || String(payload.id).trim() === "") {
          alert("請輸入節點 ID");
          return [];
        }

        const targetId = `node-${payload.id}`;
        if (!nodes.find((n: any) => n.id === targetId)) {
          alert(`節點 ${payload.id} 不存在`);
          return [];
        }
      } else if (actionType === "checkAdjacent") {
        if (
          !payload.source ||
          String(payload.source).trim() === "" ||
          !payload.target ||
          String(payload.target).trim() === ""
        ) {
          alert("請輸入來源與目標節點 ID");
          return [];
        }

        const sId = `node-${payload.source}`;
        const tId = `node-${payload.target}`;
        if (
          !nodes.find((n: any) => n.id === sId) ||
          !nodes.find((n: any) => n.id === tId)
        ) {
          alert("來源或目標節點不存在");
          return [];
        }
      } else if (["random", "reset", "load", "refresh"].includes(actionType)) {
        isResetAction = true;

        if (actionType === "random") {
          const randomCount = Math.floor(Math.random() * 6) + 5; // 5~10 個節點
          newData = generateRandomGraph(randomCount);
        } else if (actionType === "reset") {
          newData = cloneData(config.defaultData) as GraphData;

          const oldData = data;

          const isGraphData = (d: any): d is GraphData => {
            return d && !Array.isArray(d) && Array.isArray(d.nodes);
          };

          if (isGraphData(oldData)) {
            const coordMap = new Map(
              oldData.nodes.map((n: GraphNode) => [n.id, { x: n.x, y: n.y }]),
            );

            // 遍歷新產生的(重置的)節點，填回舊座標
            newData.nodes.forEach((n: GraphNode) => {
              const saved = coordMap.get(n.id);
              if (saved && saved.x !== undefined && saved.y !== undefined) {
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
        } else if (actionType === "load") {
          if (typeof loadData === "string" && loadData.startsWith("GRAPH:")) {
            const parts = loadData.split(":");
            if (parts.length >= 3) {
              const nodeCount = parseInt(parts[1]);
              const edgeStr = parts.slice(2).join(":");

              const nodes = [];
              for (let i = 0; i < nodeCount; i++)
                nodes.push({ id: `node-${i}`, value: String(i) });

              const edges: string[][] = [];
              if (edgeStr.trim() !== "") {
                edgeStr.split(",").forEach((pair) => {
                  const [u, v] = pair.trim().split(/\s+/);
                  if (u && v) edges.push([`node-${u}`, `node-${v}`]);
                });
              }
              newData = { nodes, edges };
            }
          }
        }
      }

      // Get Neighbors / Adjacent 不會改變結構
      const steps = config.createAnimationSteps(newData, {
        type: actionType,
        ...payload,
      });

      // Graph 必須同步座標，否則 Random/Load 後會擠在一起
      if (steps.length > 0) {
        syncCoordinates(newData, steps[0].elements);
      }

      setData(newData);
      setActiveSteps(steps);
      return steps;
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
      hasTailMode,
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
