import { LevelImplementationConfig } from "@/types/implementation";
import type { ActionContext, ActionResult } from "@/modules/core/visualization/types";
import { DATA_LIMITS } from "@/constants/dataLimits";
import i18n from "@/i18n";
import { LinkedListActionBar } from "./LinkedListActionBar";
import {
  LinearData as ListNodeData,
  LinearAction as ActionType,
} from "../utils";
import type { AnimationStep } from "@/types";
import { selectVariant } from "./linkedlist/selectVariant";
import { singlyVariant } from "./linkedlist/singly";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import type { StatusConfig } from "@/types/statusConfig";

const linkedListStatusConfig: StatusConfig = {
  i18nNs: "tutorials/linked-list",
  statuses: [
    { key: Status.Unfinished, label: "statusLegend.normalNode",    color: "#1d79cfff" },
    { key: Status.Prepare,    label: "statusLegend.currentNode",   color: "#f59e0b" },
    { key: Status.Target,     label: "statusLegend.operationNode", color: "#ff6b35" },
    { key: Status.Complete,   label: "statusLegend.complete",      color: "#46f336ff" },
    { key: Status.Inactive,   label: "statusLegend.deleted",       color: "#555555" },
  ],
};
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
export { makeNodeAndPointers } from "./linkedlist/shared";
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
        context.toast.warning(i18n.t("actionHandler.indexNegative", { ns: "tutorials/linked-list" }));
        return null;
      }
      if (idx > data.length) {
        context.toast.warning(
          i18n.t("actionHandler.insertIndexOutOfRange", { ns: "tutorials/linked-list", idx, max: data.length }),
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
      context.toast.warning(i18n.t("actionHandler.listEmpty", { ns: "tutorials/linked-list" }));
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
        context.toast.warning(i18n.t("actionHandler.indexNegative", { ns: "tutorials/linked-list" }));
        return null;
      }
      if (idx >= newData.length) {
        context.toast.warning(
          i18n.t("actionHandler.deleteIndexOutOfRange", { ns: "tutorials/linked-list", idx, max: newData.length - 1 }),
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
  statusConfig: linkedListStatusConfig,
  i18nNamespace: "tutorials/linked-list",
  introduction: { key: "introduction" },
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
