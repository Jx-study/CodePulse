import { Box } from '@/modules/core/DataLogic/Box';
import { Status } from '@/modules/core/DataLogic/BaseElement';
import { createBoxes, LinearData } from '@/data/DataStructure/linear/utils';

export interface SortingFrameConfig {
  startX?: number;
  startY?: number;
  gap?: number;
}

export function createSortingFrame(
  list: LinearData[],
  overrideStatusMap: Record<number, Status> = {},
  sortedIndices: Set<number> = new Set(),
  config: SortingFrameConfig = {}
) {
  const { startX = 50, startY = 250, gap = 70 } = config;

  const boxes = createBoxes(list, {
    startX,
    startY,
    gap,
    overrideStatusMap,
    getDescription: (_item, index) => `${index}`,
  });

  boxes.forEach((element, i) => {
    const box = element as Box;
    box.autoScale = true;
    if (sortedIndices.has(i) && !overrideStatusMap[i]) box.setStatus(Status.Complete);
  });

  return boxes;
}
