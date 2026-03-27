export interface NodePoint {
  x: number;
  y: number;
  r: number;
}

export interface Point {
  x: number;
  y: number;
}

export function circleBoundaryPoint(from: NodePoint, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: from.x, y: from.y };
  return { x: from.x + (dx / len) * from.r, y: from.y + (dy / len) * from.r };
}

export function normalVector(
  p1: Point,
  p2: Point,
): { nx: number; ny: number; dist: number } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return { nx: 0, ny: 0, dist: 0 };
  return { nx: -dy / dist, ny: dx / dist, dist };
}

export function straightLinkPath(
  src: NodePoint,
  tgt: NodePoint,
  offset: number,
): string {
  const p1 = circleBoundaryPoint(src, tgt);
  const p2 = circleBoundaryPoint(tgt, src);
  const { nx, ny, dist } = normalVector(p1, p2);
  if (dist === 0) return "";
  return `M ${p1.x + nx * offset},${p1.y + ny * offset} L ${p2.x + nx * offset},${p2.y + ny * offset}`;
}

export function zeroLengthPath(
  src: NodePoint,
  tgt: NodePoint,
  offset: number,
): string {
  const p1 = circleBoundaryPoint(src, tgt);
  const p2 = circleBoundaryPoint(tgt, src);
  const { nx, ny, dist } = normalVector(p1, p2);
  if (dist === 0) return "";
  const sx = p1.x + nx * offset;
  const sy = p1.y + ny * offset;
  return `M ${sx},${sy} L ${sx},${sy}`;
}

export function weightLabelCenter(p1: Point, p2: Point, offset: number): Point {
  const { nx, ny } = normalVector(p1, p2);
  return {
    x: (p1.x + p2.x) / 2 + nx * offset,
    y: (p1.y + p2.y) / 2 + ny * offset,
  };
}

export function selfLoopBezierPath(cx: number, cy: number, r: number): string {
  const startX = cx - r * 0.7;
  const startY = cy - r * 0.7;
  const endX = cx + r * 0.7;
  const endY = cy - r * 0.7;
  const cp1X = cx - r * 2.5;
  const cp1Y = cy - r * 2.5;
  const cp2X = cx + r * 2.5;
  const cp2Y = cy - r * 2.5;
  return `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;
}

export function selfLoopBezierZeroPath(cx: number, cy: number, r: number): string {
  const sx = cx - r * 0.7;
  const sy = cy - r * 0.7;
  return `M ${sx},${sy} C ${sx},${sy} ${sx},${sy} ${sx},${sy}`;
}
