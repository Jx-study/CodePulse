import { Box } from "@/modules/core/DataLogic/Box";
import { Status } from "@/modules/core/DataLogic/BaseElement";
import type { BaseElement } from "@/modules/core/DataLogic/BaseElement";

/**
 * "queue" — 由下往上疊 (BFS 風格)：index 0 在底部，新元素從頂端落下
 * "stack" — 由上往下疊 (DFS 風格)：index 0 在頂部，新元素從底部升起
 */
export type SideContainerMode = "queue" | "stack";

export interface SideContainerOptions {
  /** 容器項目的 id 前綴，預設 "ui-box" */
  idPrefix?: string;
  /** 靜態項目的 status，預設 Status.Target */
  idleStatus?: string;
  /** 容器的 x 座標，預設 850 */
  baseX?: number;
}

const ITEM_W = 120;
const ITEM_H = 30;
const ITEM_GAP = 35;
const RESULT_Y = 420;
const RESULT_START_X = 50;
const RESULT_GAP = 45;
const RESULT_SIZE = 40;
const DEFAULT_BASE_X = 850;

// queue：底部 y=355，由下往上
const QUEUE_BOTTOM_Y = 355;
const QUEUE_ENTER_Y = 50;

// stack：頂部 y=60，由上往下，新元素從底部升起
const STACK_TOP_Y = 60;
const STACK_ENTER_Y = 420;

// BinaryTree stack pop：飛出畫面上方
const TREE_STACK_POP_Y = -50;

export type TreeContainerAnimationState = "idle" | "pushing" | "popping";

/**
 * BinaryTree 專用：在 elements 陣列中追加右側 stack/queue 容器。
 * item 型別為 { id, value }（LogicTreeNode 的子集），active item 仍在 linearList 中，
 * 透過 animationState 與 index 判斷位置與狀態。
 * 無 result row。
 */
export function appendTreeContainerBoxes(
  elements: BaseElement[],
  mode: "stack" | "queue",
  linearList: { id: string; value: string | number }[],
  animationState: TreeContainerAnimationState = "idle",
): void {
  linearList.forEach((node, index) => {
    const box = new Box();
    box.id = `${mode}-${node.id}`;
    box.value = String(node.value);
    box.width = ITEM_W;
    box.height = ITEM_H;

    const baseY = QUEUE_BOTTOM_Y - index * ITEM_GAP;

    let isActiveItem = false;
    if (mode === "stack") {
      isActiveItem = index === linearList.length - 1;
    } else {
      if (animationState === "pushing") isActiveItem = index === linearList.length - 1;
      else if (animationState === "popping") isActiveItem = index === 0;
    }

    if (isActiveItem && animationState === "pushing") {
      box.moveTo(DEFAULT_BASE_X, QUEUE_ENTER_Y);
      box.setStatus(Status.Prepare);
    } else if (isActiveItem && animationState === "popping") {
      box.moveTo(DEFAULT_BASE_X, mode === "stack" ? TREE_STACK_POP_Y : RESULT_Y);
      box.setStatus(Status.Complete);
    } else if (isActiveItem) {
      box.moveTo(DEFAULT_BASE_X, baseY);
      box.setStatus(Status.Target);
    } else {
      box.moveTo(DEFAULT_BASE_X, baseY);
      box.setStatus(Status.Unfinished);
    }

    elements.push(box);
  });
}

/**
 * 在 elements 陣列中追加右側容器 (queue/stack)、正在 pop 的掉落方塊，以及底部結果列。
 *
 * @param elements   目標 elements 陣列（直接 mutate）
 * @param mode       "queue" | "stack"
 * @param items      目前容器內的 id 列表（string[]）
 * @param result     已完成順序的 id 列表（string[]）
 * @param poppingId  正在被 dequeue/pop 的節點 id（可選）
 * @param pushingIds 正在被 enqueue/push 的節點 id 列表（可選），會顯示進場動畫
 * @param options    客製化選項
 */
export function appendSideContainerBoxes(
  elements: BaseElement[],
  mode: SideContainerMode,
  items: string[],
  result: string[],
  poppingId?: string,
  pushingIds?: string[],
  options: SideContainerOptions = {},
): void {
  const {
    idPrefix = "ui-box",
    idleStatus = Status.Target,
    baseX = DEFAULT_BASE_X,
  } = options;

  const enterY = mode === "queue" ? QUEUE_ENTER_Y : STACK_ENTER_Y;

  items.forEach((id, index) => {
    const box = new Box();
    box.id = `${idPrefix}-${id}`;
    box.value = id.replace("node-", "");
    box.width = ITEM_W;
    box.height = ITEM_H;

    const baseY =
      mode === "queue"
        ? QUEUE_BOTTOM_Y - index * ITEM_GAP
        : STACK_TOP_Y + index * ITEM_GAP;

    if (pushingIds?.includes(id)) {
      box.moveTo(baseX, enterY);
      box.setStatus(Status.Prepare);
    } else {
      box.moveTo(baseX, baseY);
      box.setStatus(idleStatus as Status);
    }

    elements.push(box);
  });

  if (poppingId) {
    const dropBox = new Box();
    dropBox.id = `${idPrefix}-${poppingId}`;
    dropBox.value = poppingId.replace("node-", "");
    dropBox.width = ITEM_W;
    dropBox.height = ITEM_H;
    dropBox.moveTo(baseX, RESULT_Y);
    dropBox.setStatus(Status.Complete);
    elements.push(dropBox);
  }

  result.forEach((id, i) => {
    const box = new Box();
    box.id = `${idPrefix}-${id}`;
    box.value = id.replace("node-", "");
    box.moveTo(RESULT_START_X + i * RESULT_GAP, RESULT_Y);
    box.width = RESULT_SIZE;
    box.height = RESULT_SIZE;
    box.setStatus(Status.Complete);
    elements.push(box);
  });
}
