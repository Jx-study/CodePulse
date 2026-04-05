import { describe, it, expect } from 'vitest';
import { createSortingFrame } from '../linearFrame';
import { Status } from '@/modules/core/DataLogic/BaseElement';
import { Box } from '@/modules/core/DataLogic/Box';

const sampleList = [
  { id: 'b0', value: 30 },
  { id: 'b1', value: 10 },
  { id: 'b2', value: 50 },
];

describe('createSortingFrame', () => {
  it('回傳與輸入等長的 Box 陣列', () => {
    const boxes = createSortingFrame(sampleList);
    expect(boxes).toHaveLength(3);
  });

  it('每個 Box 都開啟 autoScale', () => {
    const boxes = createSortingFrame(sampleList);
    boxes.forEach((box) => {
      expect((box as Box).autoScale).toBe(true);
    });
  });

  it('description 為 index 字串', () => {
    const boxes = createSortingFrame(sampleList);
    expect((boxes[0] as Box).description).toBe('0');
    expect((boxes[2] as Box).description).toBe('2');
  });

  it('sortedIndices 中的 box 狀態為 Complete', () => {
    const sorted = new Set([1, 2]);
    const boxes = createSortingFrame(sampleList, {}, sorted);
    expect((boxes[0] as Box).status).toBe(Status.Unfinished);
    expect((boxes[1] as Box).status).toBe(Status.Complete);
    expect((boxes[2] as Box).status).toBe(Status.Complete);
  });

  it('overrideStatusMap 覆蓋指定 box 狀態', () => {
    const overrides = { 0: Status.Prepare };
    const boxes = createSortingFrame(sampleList, overrides);
    expect((boxes[0] as Box).status).toBe(Status.Prepare);
    expect((boxes[1] as Box).status).toBe(Status.Unfinished);
  });

  it('預設座標：startX=50, startY=250, gap=70', () => {
    const boxes = createSortingFrame(sampleList);
    // box[0] x=50, box[1] x=120, box[2] x=190
    expect((boxes[0] as Box).position.x).toBe(50);
    expect((boxes[1] as Box).position.x).toBe(120);
    expect((boxes[2] as Box).position.x).toBe(190);
  });
});
