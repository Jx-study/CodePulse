import {
  useState,
  useRef,
  type RefObject,
} from 'react';
import type { BaseElement } from '../DataLogic/BaseElement';
import type { Pointer } from '../DataLogic/Pointer';

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * 從 data model 直接計算所有動畫步驟的 union bounding box。
 * 不依賴 DOM getBBox()，因此不受 D3 transition 時序影響。
 *
 * 視覺尺寸依據 D3Renderer 的實際渲染邏輯：
 *  - node:    center = position, radius = node.radius (default 20) + 20px for desc text
 *  - box:     center = position, ±width/2, ±height/2  + 20px for label below
 *  - pointer: tip at position
 *    - direction="down" → 向下指，label + arrow 在 position 上方 (minY = y-35)
 *    - direction="up"   → 向上指，label + arrow 在 position 下方 (maxY = y+35)
 */
export function computeUnionBBox(allStepsElements: BaseElement[][]): BBox | null {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const stepElements of allStepsElements) {
    for (const el of stepElements) {
      const { x, y } = el.position;
      let elMinX: number, elMinY: number, elMaxX: number, elMaxY: number;

      if (el.kind === "node") {
        const r: number = (el as { radius?: number }).radius ?? 20;
        elMinX = x - r;      elMaxX = x + r;
        elMinY = y - r;      elMaxY = y + r + 20;
      } else if (el.kind === "box") {
        const hw = ((el as { width?: number }).width ?? 60) / 2;
        const hh = ((el as { height?: number }).height ?? 80) / 2;
        elMinX = x - hw;     elMaxX = x + hw;
        elMinY = y - hh;     elMaxY = y + hh + 20;
      } else if (el.kind === "pointer") {
        const halfLabel = 30;
        const ptr = el as unknown as Pointer;
        if (ptr.direction === "down") {
          elMinX = x - halfLabel; elMaxX = x + halfLabel;
          elMinY = y - 35;        elMaxY = y;
        } else {
          elMinX = x - halfLabel; elMaxX = x + halfLabel;
          elMinY = y;             elMaxY = y + 35;
        }
      } else {
        elMinX = x - 30; elMaxX = x + 30;
        elMinY = y - 30; elMaxY = y + 30;
      }

      if (elMinX < minX) minX = elMinX;
      if (elMinY < minY) minY = elMinY;
      if (elMaxX > maxX) maxX = elMaxX;
      if (elMaxY > maxY) maxY = elMaxY;
    }
  }

  if (!isFinite(minX)) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * GraphCanvas：封裝 svg viewBox 與 max 外緣追蹤的初始狀態。
 * Effect 1b / Effect 3 需自行以 setViewBox、maxExtentRef 更新（不內建 useEffect）。
 */
export function useBoxViewBox(
  _allStepsElements: BaseElement[][] | undefined,
  initialWidth: number,
  initialHeight: number,
): {
  viewBox: string;
  setViewBox: (value: string | ((prevState: string) => string)) => void;
  maxExtentRef: RefObject<{ maxX: number; maxY: number }>;
} {
  void _allStepsElements;
  const [viewBox, setViewBox] = useState(`0 0 ${initialWidth} ${initialHeight}`);
  const maxExtentRef = useRef({ maxX: initialWidth, maxY: initialHeight });

  return { viewBox, setViewBox, maxExtentRef };
}
