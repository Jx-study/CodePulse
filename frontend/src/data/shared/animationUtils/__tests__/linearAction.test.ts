import { describe, it, expect, beforeEach } from 'vitest';
import { createLinearActionHandler } from '../linearAction';

const existingData = [
  { id: 'b0', value: 10 },
  { id: 'b1', value: 20 },
];

let idCounter = 0;
const mockContext = {
  nextId: () => `id-${idCounter++}`,
  toast: { warning: () => {} },
  defaultData: existingData,
};

describe('createLinearActionHandler', () => {
  beforeEach(() => { idCounter = 0; });

  it('random: 回傳正確筆數並標記 isResetAction', () => {
    const handler = createLinearActionHandler();
    const result = handler('random', { randomCount: 5 }, existingData, mockContext);
    expect(result?.animationData).toHaveLength(5);
    expect(result?.isResetAction).toBe(true);
  });

  it('random: 預設值域為 -20~80（值在範圍內）', () => {
    const handler = createLinearActionHandler();
    const result = handler('random', { randomCount: 100 }, existingData, mockContext);
    (result!.animationData as any[]).forEach(({ value }) => {
      expect(value).toBeGreaterThanOrEqual(-20);
      expect(value).toBeLessThan(80);
    });
  });

  it('random: 自訂值域 [1, 15]', () => {
    const handler = createLinearActionHandler({ randomValueRange: [1, 15] });
    const result = handler('random', { randomCount: 100 }, existingData, mockContext);
    (result!.animationData as any[]).forEach(({ value }) => {
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThan(15);
    });
  });

  it('random: sortOnLoad=true 時資料已排序', () => {
    const handler = createLinearActionHandler({ sortOnLoad: true });
    const result = handler('random', { randomCount: 10 }, existingData, mockContext);
    const values = (result!.animationData as any[]).map((d) => d.value);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it('load: 轉換數字陣列為 LinearData', () => {
    const handler = createLinearActionHandler();
    const result = handler('load', { data: [5, 3, 7] }, existingData, mockContext);
    expect(result?.animationData).toHaveLength(3);
    expect((result!.animationData as any[])[0].value).toBe(5);
    expect(result?.isResetAction).toBe(true);
  });

  it('load: 空陣列回傳 null', () => {
    const handler = createLinearActionHandler();
    const result = handler('load', { data: [] }, existingData, mockContext);
    expect(result).toBeNull();
  });

  it('load: sortOnLoad=true 時資料已排序', () => {
    const handler = createLinearActionHandler({ sortOnLoad: true });
    const result = handler('load', { data: [7, 2, 5] }, existingData, mockContext);
    const values = (result!.animationData as any[]).map((d) => d.value);
    expect(values).toEqual([2, 5, 7]);
  });

  it('reset: 回傳 defaultData 的 clone', () => {
    const handler = createLinearActionHandler();
    const result = handler('reset', {}, existingData, mockContext);
    expect(result?.animationData).toEqual(existingData);
    expect(result?.animationData).not.toBe(existingData);
    expect(result?.isResetAction).toBe(true);
  });

  it('run: 回傳現有資料的 clone（無 isResetAction）', () => {
    const handler = createLinearActionHandler();
    const result = handler('run', {}, existingData, mockContext);
    expect(result?.animationData).toEqual(existingData);
    expect(result?.isResetAction).toBeUndefined();
  });

  it('未知 actionType 回傳 null', () => {
    const handler = createLinearActionHandler();
    const result = handler('unknown', {}, existingData, mockContext);
    expect(result).toBeNull();
  });
});
