import { Box } from "../../../modules/core/DataLogic/Box";
import { Status } from "../../../modules/core/DataLogic/BaseElement";
import { Node } from "../../../modules/core/DataLogic/Node";

export interface LinearData {
  id: string;
  value: number | undefined;
}

export interface LinearAction {
  type: string;
  value: number;
  mode: string;
  index?: number;
  targetId?: string;
  oldValue?: number;
}

export interface CreateBoxesOptions {
  startX?: number;
  startY?: number;
  gap?: number;
  highlightIndex?: number;
  status?: Status;
  forceXShiftIndex?: number; // 從哪個 index 開始強迫位移 (用於 Array Insert/Delete 動畫)
  shiftDirection?: number; // 0: 不移, 1: 右移, -1: 左移
  overrideStatusMap?: Record<number, Status>;
  getDescription?: (item: LinearData, index: number, total: number) => string;
}

export const createBoxes = (
  list: LinearData[],
  options: CreateBoxesOptions = {}
) => {
  const {
    startX = 100,
    startY = 200,
    gap = 70,
    highlightIndex = -1,
    status = "unfinished",
    forceXShiftIndex = -1,
    shiftDirection = 0,
    overrideStatusMap = {},
    getDescription,
  } = options;

  return list.map((item, i) => {
    const box = new Box();
    box.id = item.id;

    let x = startX + i * gap;

    // 處理位移動畫邏輯 (主要用於 Array)
    if (forceXShiftIndex !== -1) {
      if (shiftDirection === 1 && i >= forceXShiftIndex) {
        x += gap;
      } else if (shiftDirection === -1 && i >= forceXShiftIndex) {
        x -= gap;
      }
    }

    box.moveTo(x, startY);
    box.width = 60;
    box.height = 60;
    box.value = item.value;

    if (getDescription) {
      box.description = getDescription(item, i, list.length);
    }

    if (overrideStatusMap[i]) {
      box.setStatus(overrideStatusMap[i]);
    } else if (highlightIndex === -1) {
      box.setStatus(status);
    } else if (i === highlightIndex) {
      box.setStatus(status === "unfinished" ? "target" : status);
    } else {
      box.setStatus("unfinished");
    }

    // 處理 Array 位移時的特殊狀態
    if (forceXShiftIndex !== -1 && i >= forceXShiftIndex) {
      if (i !== highlightIndex) box.setStatus("prepare");
    }

    return box;
  });
};

export function createNodeInstance(
  id: string,
  val: number | undefined,
  x: number,
  y: number,
  status: Status = "unfinished",
  desc: string = ""
) {
  const n = new Node();
  n.id = id;
  n.value = val;
  n.moveTo(x, y);
  n.setStatus(status);
  n.description = desc;
  return n;
}

export function linkNodes(nodes: Node[]) {
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].pointers = [nodes[i + 1]];
  }
  return nodes;
}
