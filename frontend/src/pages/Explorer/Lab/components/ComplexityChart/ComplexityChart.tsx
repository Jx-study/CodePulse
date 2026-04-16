import { useMemo, useState } from "react";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import type { ComplexityChartMode, LabAlgorithmState } from "../../types/lab";
import { BENCHMARK_NS } from "../../hooks/useAlgorithmSteps";
import styles from "./ComplexityChart.module.scss";

const VB_W = 800;
const VB_H = 400;
const PAD = 48;
const PLOT_W = VB_W - PAD * 2;
const PLOT_H = VB_H - PAD * 2;

export interface ComplexityChartProps {
  algorithms: LabAlgorithmState[];
  currentStep: number;
  maxSteps: number;
  mode: ComplexityChartMode;
}

function formatMsTooltip(ms: number): string {
  if (ms < 0.001) return "< 0.001 ms";
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  return `${ms.toFixed(2)} ms`;
}

export function ComplexityChart({
  algorithms,
  currentStep,
  maxSteps,
  mode,
}: ComplexityChartProps) {
  const [hover, setHover] = useState<{
    id: string;
    n: number;
    ms: number;
    cx: number;
    cy: number;
  } | null>(null);

  const maxY = useMemo(() => {
    if (!algorithms.length) return 1;
    return Math.max(
      1,
      ...algorithms.map((a) => {
        const arr = a.opCountPerStep;
        return arr.length ? arr[arr.length - 1] : 0;
      }),
    );
  }, [algorithms]);

  const lines = useMemo(() => {
    const xAt = (stepIndex: number) => {
      const denom = Math.max(1, maxSteps - 1);
      return PAD + (Math.min(stepIndex, maxSteps - 1) / denom) * PLOT_W;
    };
    const yAt = (op: number) => {
      const t = op / maxY;
      return PAD + PLOT_H - t * PLOT_H;
    };

    return algorithms.map((a) => {
      const meta = ALGORITHM_META[a.id];
      const arr = a.opCountPerStep;
      if (!arr.length) {
        return { id: a.id, color: meta.color, points: "" };
      }
      const end = Math.min(currentStep, arr.length - 1);
      const pts: string[] = [];
      for (let i = 0; i <= end; i++) {
        pts.push(`${xAt(i)},${yAt(arr[i])}`);
      }
      if (pts.length === 1) {
        pts.push(pts[0]);
      }
      return { id: a.id, color: meta.color, points: pts.join(" ") };
    });
  }, [algorithms, currentStep, maxSteps, maxY]);

  const denom = Math.max(1, maxSteps - 1);
  const vLineX =
    PAD +
    (Math.min(currentStep, Math.max(0, maxSteps - 1)) / denom) * PLOT_W;

  const curveModel = useMemo(() => {
    if (!algorithms.length) return null;
    const hasAny = algorithms.some((a) => a.benchmarkPoints.length > 0);
    if (!hasAny) return null;
    let maxMs = 1e-9;
    for (const a of algorithms) {
      for (const p of a.benchmarkPoints) {
        if (p.ms > maxMs) maxMs = p.ms;
      }
    }
    maxMs = Math.max(maxMs, 1e-6);
    const nMax = 100;
    const log2 = (x: number) => Math.log(x) / Math.LN2;
    const scaleN2 = maxMs / (nMax * nMax);
    const scaleNLogN = maxMs / (nMax * log2(nMax));
    const scaleN = maxMs / nMax;

    const xN = (n: number) =>
      PAD + ((n - 10) / (100 - 10)) * PLOT_W;
    const yMs = (ms: number) => PAD + PLOT_H - (ms / maxMs) * PLOT_H;

    const theoryPoints = (fn: (n: number) => number) =>
      BENCHMARK_NS.map((n) => `${xN(n)},${yMs(fn(n))}`).join(" ");

    return {
      maxMs,
      n2Polyline: theoryPoints((n) => n * n * scaleN2),
      nLogNPolyline: theoryPoints((n) => n * log2(n) * scaleNLogN),
      nPolyline: theoryPoints((n) => n * scaleN),
      xN,
      yMs,
    };
  }, [algorithms]);

  const curveScatter = useMemo(() => {
    if (!curveModel) return [];
    const { xN, yMs } = curveModel;
    return algorithms.flatMap((a) => {
      const meta = ALGORITHM_META[a.id];
      return a.benchmarkPoints.map((p) => ({
        id: a.id,
        color: meta.color,
        label: meta.label,
        n: p.n,
        ms: p.ms,
        cx: xN(p.n),
        cy: yMs(p.ms),
      }));
    });
  }, [algorithms, curveModel]);

  if (!algorithms.length || maxSteps === 0) {
    return (
      <div className={styles.empty}>
        <p>請先選擇至少一個演算法</p>
      </div>
    );
  }

  if (mode === "curve") {
    const loading = algorithms.some((a) => a.benchmarkPoints.length === 0);
    return (
      <div className={styles.wrap}>
        {loading && (
          <p className={styles.loading}>正在計算各 n 的執行時間…</p>
        )}
        <svg
          className={styles.svg}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label="資料筆數與執行時間散佈圖"
        >
          <rect
            x={PAD}
            y={PAD}
            width={PLOT_W}
            height={PLOT_H}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
            rx={4}
          />
          {curveModel && (
            <>
              <polyline
                fill="none"
                stroke="var(--text-tertiary, #888)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                points={curveModel.n2Polyline}
              />
              <polyline
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                points={curveModel.nLogNPolyline}
              />
              <polyline
                fill="none"
                stroke="var(--border)"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                points={curveModel.nPolyline}
              />
              <text
                x={VB_W - PAD - 4}
                y={PAD + 16}
                textAnchor="end"
                fill="var(--text-tertiary)"
                fontSize={11}
              >
                O(n²)
              </text>
              <text
                x={VB_W - PAD - 4}
                y={PAD + 32}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize={11}
              >
                O(n log n)
              </text>
              <text
                x={VB_W - PAD - 4}
                y={PAD + 48}
                textAnchor="end"
                fill="var(--text-tertiary)"
                fontSize={11}
              >
                O(n)
              </text>
            </>
          )}
          {curveScatter.map((pt, i) => (
            <circle
              key={`${pt.id}-${pt.n}-${i}`}
              cx={pt.cx}
              cy={pt.cy}
              r={4}
              fill={pt.color}
              className={styles.scatterDot}
              onMouseEnter={() =>
                setHover({
                  id: pt.id,
                  n: pt.n,
                  ms: pt.ms,
                  cx: pt.cx,
                  cy: pt.cy,
                })}
              onMouseLeave={() => setHover(null)}
            />
          ))}
          {hover && (
            <g>
              <rect
                x={Math.min(hover.cx + 8, VB_W - PAD - 120)}
                y={hover.cy - 36}
                width={118}
                height={28}
                rx={4}
                fill="var(--card-bg)"
                stroke="var(--border)"
              />
              <text
                x={Math.min(hover.cx + 14, VB_W - PAD - 114)}
                y={hover.cy - 16}
                fill="var(--text-primary)"
                fontSize={11}
              >
                {`n=${hover.n}, ${formatMsTooltip(hover.ms)}`}
              </text>
            </g>
          )}
        </svg>
        <ul className={styles.legend}>
          {algorithms.map((a) => (
            <li key={a.id}>
              <span
                className={styles.dot}
                style={{ background: ALGORITHM_META[a.id].color }}
              />
              {ALGORITHM_META[a.id].label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="操作數累計步數折線圖"
      >
        <rect
          x={PAD}
          y={PAD}
          width={PLOT_W}
          height={PLOT_H}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          rx={4}
        />
        {lines.map((ln) => (
          <polyline
            key={ln.id}
            fill="none"
            stroke={ln.color}
            strokeWidth={2}
            points={ln.points}
          />
        ))}
        <line
          x1={vLineX}
          x2={vLineX}
          y1={PAD}
          y2={PAD + PLOT_H}
          stroke="var(--text-secondary)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      </svg>
      <ul className={styles.legend}>
        {algorithms.map((a) => (
          <li key={a.id}>
            <span
              className={styles.dot}
              style={{ background: ALGORITHM_META[a.id].color }}
            />
            {ALGORITHM_META[a.id].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
