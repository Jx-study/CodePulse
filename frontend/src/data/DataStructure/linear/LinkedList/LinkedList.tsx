import { LevelImplementationConfig } from "@/types/implementation";
import type { ActionContext, ActionResult } from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import { LinkedListActionBar } from "./LinkedListActionBar";
import {
  LinearData as ListNodeData,
  LinearAction as ActionType,
} from "../utils";
import type { AnimationStep } from "@/types";
import { selectVariant } from "./variants/selectVariant";
import { singlyVariant } from "./variants/singly";
export function createLinkedListAnimationSteps(
  dataList: ListNodeData[],
  action?: ActionType,
  config?: { hasTailMode?: boolean; isDoubly?: boolean },
): AnimationStep[] {
  const variant = selectVariant(
    config?.isDoubly ?? false,
    config?.hasTailMode ?? false,
  );
  return variant.createAnimationSteps(dataList, action);
}
export { makeNodeAndPointers } from "./variants/shared";
function modeFlags(payload: Record<string, unknown>) {
  return {
    isDoubly: Boolean(payload.isDoubly),
    hasTailMode: Boolean(payload.hasTailMode),
  };
}
function linkedListActionHandler(
  actionType: string,
  payload: Record<string, unknown>,
  data: ListNodeData[],
  context: ActionContext,
): ActionResult<ListNodeData[]> | null {
  const { value, mode, index } = payload as {
    value?: number;
    mode?: string;
    index?: number;
  };
  const newData = [...data];
  const defaultParams = { isDirected: true };
  if (actionType === "switch_mode") {
    return {
      animationData: data,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }
  if (actionType === "add") {
    const newId = context.nextId();
    const newNode = { id: newId, value: value! };
    const idx = index ?? -1;
    if (mode === "Head") {
      newData.unshift(newNode);
    } else if (mode === "Tail") {
      newData.push(newNode);
    } else if (mode === "Node N") {
      if (idx < 0) {
        context.toast.warning("索引無效：索引不能為負數");
        return null;
      }
      if (idx > data.length) {
        context.toast.warning(
          `索引 ${idx} 超出範圍，插入的最大索引為 ${data.length}`,
        );
        return null;
      }
      if (idx === 0) newData.unshift(newNode);
      else if (idx === data.length) newData.push(newNode);
      else newData.splice(idx, 0, newNode);
    }
    return {
      animationData: newData,
      animationParams: {
        targetId: newId,
        value,
        mode,
        index,
        ...defaultParams,
        ...modeFlags(payload),
      },
    };
  }
  if (actionType === "delete") {
    if (newData.length === 0) {
      context.toast.warning("鏈結串列為空");
      return null;
    }
    let deletedNode: ListNodeData | null = null;
    if (mode === "Head") {
      deletedNode = newData[0];
      if (deletedNode) newData.shift();
    } else if (mode === "Tail") {
      deletedNode = newData[newData.length - 1];
      if (deletedNode) newData.pop();
    } else if (mode === "Node N") {
      const idx = index ?? -1;
      if (idx < 0) {
        context.toast.warning("索引無效：索引不能為負數");
        return null;
      }
      if (idx >= newData.length) {
        context.toast.warning(
          `索引 ${idx} 超出範圍，刪除的最大索引為 ${newData.length - 1}`,
        );
        return null;
      }
      deletedNode = newData[idx];
      newData.splice(idx, 1);
    }
    if (!deletedNode) return null;
    return {
      animationData: newData,
      animationParams: {
        targetId: deletedNode.id,
        value: deletedNode.value,
        mode,
        index,
        ...defaultParams,
        ...modeFlags(payload),
      },
    };
  }
  if (actionType === "search") {
    return {
      animationData: data,
      animationParams: { ...defaultParams, ...modeFlags(payload) },
    };
  }
  if (actionType === "load") {
    const loadArr = (payload.data as number[]) ?? [];
    const useExistingIds = loadArr.length === data.length;
    const newDataLoad = loadArr.map((v, i) => ({
      id: useExistingIds ? data[i].id : context.nextId(),
      value: v,
    }));
    return {
      animationData: newDataLoad,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }
  if (actionType === "random") {
    const count =
      (payload.randomCount as number) ?? DATA_LIMITS.DEFAULT_RANDOM_COUNT;
    const useExistingIds = count === data.length;
    const newDataRand = Array.from({ length: count }, (_, i) => ({
      id: useExistingIds ? data[i].id : context.nextId(),
      value: Math.floor(Math.random() * 100),
    }));
    return {
      animationData: newDataRand,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }
  if (actionType === "reset") {
    const defaultData = (context.defaultData as ListNodeData[]) ?? data;
    const newDataReset = defaultData.map((d) => ({
      ...d,
      id: d.id || context.nextId(),
    }));
    return {
      animationData: newDataReset,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }
  if (actionType === "refresh") {
    return {
      animationData: data,
      isResetAction: true,
      animationParams: { ...defaultParams },
    };
  }
  return null;
}

export const linkedListConfig: LevelImplementationConfig = {
  id: "linkedlist",
  type: "dataStructure",
  name: "鏈結串列 (Linked List)",
  categoryName: "資料結構",
  description: "動態的線性數據結構",
  codeConfig: singlyVariant.codeConfig,
  getCodeConfig: (payload?: { isDoubly?: boolean; hasTailMode?: boolean }) =>
    selectVariant(
      payload?.isDoubly ?? false,
      payload?.hasTailMode ?? false,
    ).codeConfig,
  complexity: { timeBest: "O(1)", timeAverage: "O(n)", timeWorst: "O(n)", space: "O(1)" },
  introduction:
    "鏈表是一種基本的線性數據結構，由一系列節點組成，每個節點包含數據和指向下一個節點的指針。與陣列不同，鏈表的元素在記憶體中不是連續存儲的，這使得插入和刪除操作更加高效。鏈表分為單向鏈表、雙向鏈表和循環鏈表等類型。單向鏈表的每個節點只有一個指向下一個節點的指針，適合需要頻繁插入和刪除的場景，但訪問特定位置的元素需要從頭開始遍歷。",
  defaultData: [
    { id: "node-1", value: 10 }, { id: "node-2", value: 40 }, { id: "node-3", value: 30 }, { id: "node-4", value: 20 },
  ],
  createAnimationSteps: createLinkedListAnimationSteps,
  actionHandler: linkedListActionHandler,
  renderActionBar: (props) => <LinkedListActionBar {...(props as any)} />,
  relatedProblems: [
    { id: 206, title: "Reverse Linked List", concept: "鏈結串列基礎操作：反轉單向鏈結串列", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/" },
    { id: 141, title: "Linked List Cycle", concept: "快慢指標應用：檢測鏈結串列是否有環", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/" },
    { id: 21, title: "Merge Two Sorted Lists", concept: "鏈結串列合併：合併兩個已排序的鏈結串列", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
  ],
  maxNodes: 20,
};
