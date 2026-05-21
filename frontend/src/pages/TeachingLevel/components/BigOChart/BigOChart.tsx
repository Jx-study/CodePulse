import styles from "./BigOChart.module.scss";

const CHART_W = 320;
const CHART_H = 160;
const N_MIN = 1;
const N_MAX = 10;
const STEPS = 80;
const SCALE = 10; // O(n) at n=10 → 100px ≈ 63% of chart

interface Complexity {
  label: string;
  color: string;
  fn: (n: number) => number;
}

const complexities: Complexity[] = [
  { label: "O(1)", color: "#10b981", fn: () => 1 },
  { label: "O(log n)", color: "#3b82f6", fn: (n) => Math.log2(n) },
  { label: "O(n)", color: "#f59e0b", fn: (n) => n },
  { label: "O(n log n)", color: "#f97316", fn: (n) => n * Math.log2(n) },
  { label: "O(n²)", color: "#ef4444", fn: (n) => n * n },
];

function buildPath(fn: (n: number) => number): string {
  const points: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const n = N_MIN + (i / STEPS) * (N_MAX - N_MIN);
    const rawY = fn(n) * SCALE;
    const x = (i / STEPS) * CHART_W;
    const y = CHART_H - rawY;
    if (y < 0) break; // stop drawing when curve exits chart
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  if (points.length === 0) return "";
  return `M ${points[0]} L ${points.slice(1).join(" L ")}`;
}

function lastPoint(fn: (n: number) => number): { x: number; y: number } {
  let lx = 0;
  let ly = CHART_H;
  for (let i = 0; i <= STEPS; i++) {
    const n = N_MIN + (i / STEPS) * (N_MAX - N_MIN);
    const y = CHART_H - fn(n) * SCALE;
    if (y < 0) break;
    lx = (i / STEPS) * CHART_W;
    ly = y;
  }
  return { x: lx, y: Math.max(6, ly) };
}

export default function BigOChart() {
  const PAD = { top: 10, right: 60, bottom: 28, left: 32 };
  const totalW = CHART_W + PAD.left + PAD.right;
  const totalH = CHART_H + PAD.top + PAD.bottom;

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className={styles.svg}
        role="img"
        aria-label="Big O 複雜度比較圖"
      >
        <g transform={`translate(${PAD.left},${PAD.top})`}>
          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={CHART_H} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
          <line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />

          {/* Arrow tips */}
          <polygon points={`0,0 -3,7 3,7`} fill="currentColor" opacity={0.35} />
          <polygon points={`${CHART_W},${CHART_H} ${CHART_W - 7},${CHART_H - 3} ${CHART_W - 7},${CHART_H + 3}`} fill="currentColor" opacity={0.35} />

          {/* Axis labels */}
          <text x={CHART_W / 2} y={CHART_H + 18} textAnchor="middle" className={styles.axisLabel}>
            n（輸入規模）
          </text>
          <text x={-CHART_H / 2} y={-20} textAnchor="middle" transform="rotate(-90)" className={styles.axisLabel}>
            操作次數
          </text>

          {/* Complexity curves */}
          {complexities.map(({ label, color, fn }) => {
            const d = buildPath(fn);
            if (!d) return null;
            return (
              <path
                key={label}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* End-of-curve labels (placed at last valid point) */}
          {complexities.map(({ label, color, fn }) => {
            const { x, y } = lastPoint(fn);
            return (
              <text key={label} x={x + 5} y={y + 4} fill={color} className={styles.curveLabel}>
                {label}
              </text>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className={styles.legend}>
        {complexities.map(({ label, color }) => (
          <span key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span className={styles.legendText}>{label}</span>
          </span>
        ))}
      </div>

      <p className={styles.note}>
        ＊ 成長過快的曲線（O(n²)、O(n log n)）在超出範圍後即停止繪製，這正是它們效率差的體現。
      </p>
    </div>
  );
}
