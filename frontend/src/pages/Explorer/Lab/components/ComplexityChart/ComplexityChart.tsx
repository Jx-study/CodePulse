import { useEffect, useMemo, useState } from "react";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import type {
  AlgorithmId,
  CaseType,
  ComplexityChartMode,
  LabAlgorithmState,
} from "../../types/lab";
import { BENCHMARK_NS, CASE_TYPES } from "../../hooks/useAlgorithmSteps";
import styles from "./ComplexityChart.module.scss";

const VB_W = 800;
const VB_H = 400;
const PAD = 48;
const PLOT_W = VB_W - PAD * 2;
const PLOT_H = VB_H - PAD * 2;

const N_MIN = BENCHMARK_NS[0];
const N_MAX = BENCHMARK_NS[BENCHMARK_NS.length - 1];

const MINI_VB_W = 700;
const MINI_VB_H = 520;
const MINI_PLOT_W = 530;
const MINI_PLOT_H = 440;
const MINI_PAD_X = Math.round((MINI_VB_W - MINI_PLOT_W + 35 - 80) / 2);
const MINI_PAD_Y = (MINI_VB_H - MINI_PLOT_H) / 2;

const X_TICKS = Array.from({ length: Math.ceil(N_MAX / 500) }, (_, i) => (i + 1) * 500);

const CASE_LABEL: Record<(typeof CASE_TYPES)[number], string> = {
  random: "亂序",
  sorted: "已排序",
  reversed: "反序",
};

export interface ComplexityChartProps {
  algorithms: LabAlgorithmState[];
  currentStep: number;
  maxSteps: number;
  mode: ComplexityChartMode;
  visibleCaseTypes: CaseType[];
  unifiedYAxis: boolean;
}

export function ComplexityChart({
  algorithms,
  maxSteps,
  mode,
  visibleCaseTypes,
  unifiedYAxis,
}: ComplexityChartProps) {
  const [focusedIds, setFocusedIds] = useState<Set<AlgorithmId> | null>(null);

  const algorithmKey = useMemo(
    () => algorithms.map((a) => a.id).sort().join(","),
    [algorithms],
  );
  useEffect(() => {
    setFocusedIds(null);
  }, [algorithmKey]);

  const isAllFocused = focusedIds === null;
  const isActive = (id: AlgorithmId) => isAllFocused || focusedIds!.has(id);

  const handleLegendClick = (id: AlgorithmId) => {
    if (isAllFocused) {
      setFocusedIds(new Set([id]));
      return;
    }
    const next = new Set(focusedIds!);
    if (next.has(id)) {
      next.delete(id);
      setFocusedIds(next.size === 0 ? null : next);
    } else {
      next.add(id);
      setFocusedIds(next.size === algorithms.length ? null : next);
    }
  };
  const spaceLines = useMemo(() => {
    if (mode !== "space") return [];
    const xAt = (i: number) =>
      PAD +
      (Math.min(i, maxSteps - 1) / Math.max(1, maxSteps - 1)) * PLOT_W;

    const maxSpace = Math.max(
      1,
      ...algorithms.flatMap((a) => [
        ...a.stackDepthPerStep,
        ...a.auxSizePerStep,
      ]),
    );

    const yAt = (v: number) => PAD + PLOT_H - (v / maxSpace) * PLOT_H;

    return algorithms.map((a) => {
      const meta = ALGORITHM_META[a.id];
      const arr =
        a.id === "quickSort" ? a.stackDepthPerStep : a.auxSizePerStep;
      const end = arr.length - 1;
      const pts: string[] = [];
      for (let i = 0; i <= end; i++) {
        pts.push(`${xAt(i)},${yAt(arr[i] ?? 0)}`);
      }
      if (pts.length === 1) pts.push(pts[0]);
      return {
        id: a.id,
        color: meta.color,
        label: meta.label,
        points: pts.join(" "),
      };
    });
  }, [algorithms, maxSteps, mode]);

  const curveModels = useMemo(() => {
    return CASE_TYPES.map((ct) => {
      let maxMs = 1e-9;
      let hasAny = false;
      for (const a of algorithms) {
        const pts = a.benchmarkByCase[ct];
        if (!pts?.length) continue;
        hasAny = true;
        for (const p of pts) {
          if (p.ms > maxMs) maxMs = p.ms;
        }
      }
      if (!hasAny) return { ct, ready: false as const };
      maxMs = Math.max(maxMs, 1e-6);
      const xN = (n: number) =>
        MINI_PAD_X + ((n - N_MIN) / (N_MAX - N_MIN)) * MINI_PLOT_W;
      return {
        ct,
        ready: true as const,
        maxMs,
        xN,
      };
    });
  }, [algorithms]);

  const displayMaxMs = useMemo(() => {
    if (!unifiedYAxis) return null;
    let max = 1e-9;
    for (const m of curveModels) {
      if (m.ready && m.maxMs > max) max = m.maxMs;
    }
    return max > 1e-9 ? max : null;
  }, [curveModels, unifiedYAxis]);

  const totalExpected = BENCHMARK_NS.length;
  const isPartialLoading = algorithms.some((a) =>
    CASE_TYPES.some((ct) => (a.benchmarkByCase[ct]?.length ?? 0) < totalExpected),
  );

  if (!algorithms.length || maxSteps === 0) {
    return (
      <div className={styles.empty}>
        <p>請先選擇至少一個演算法</p>
      </div>
    );
  }

  if (mode === "space") {
    return (
      <div className={styles.wrap}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label="空間複雜度步驟折線圖"
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
          {spaceLines.map((ln) => (
            <polyline
              key={ln.id}
              fill="none"
              stroke={isActive(ln.id) ? ln.color : "var(--text-disabled)"}
              strokeWidth={isActive(ln.id) ? 2 : 1}
              opacity={isActive(ln.id) ? 1 : 0.3}
              points={ln.points}
            />
          ))}
          <text
            x={PAD + PLOT_W / 2}
            y={VB_H - 6}
            textAnchor="middle"
            fill="var(--text-tertiary)"
            fontSize={11}
          >
            動畫步驟
          </text>
          <text
            transform={`rotate(-90, 14, ${PAD + PLOT_H / 2})`}
            x={14}
            y={PAD + PLOT_H / 2}
            textAnchor="middle"
            fill="var(--text-tertiary)"
            fontSize={11}
          >
            輔助空間
          </text>
        </svg>
        <ul className={styles.legend}>
          {algorithms.map((a) => (
            <li
              key={a.id}
              className={`${styles.legendItem} ${!isActive(a.id) ? styles.legendItemDimmed : ""}`}
              onClick={() => handleLegendClick(a.id)}
            >
              <span
                className={styles.dot}
                style={{
                  background: isActive(a.id)
                    ? ALGORITHM_META[a.id].color
                    : "var(--text-disabled)",
                }}
              />
              {ALGORITHM_META[a.id].label}
              <span style={{ opacity: 0.5 }}>
                {a.id === "quickSort"
                  ? " (O(log n))"
                  : a.id === "mergeSort"
                    ? " (O(n))"
                    : " (O(1))"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {isPartialLoading && (
        <p className={styles.loading}>正在計算各 n 與輸入案例的執行時間…</p>
      )}
      <div className={styles.curveRow}>
        {curveModels
          .filter((model) => visibleCaseTypes.includes(model.ct))
          .map((model) => {
            if (!model.ready) return null;
            const effectiveMaxMs = displayMaxMs ?? model.maxMs;
            const yMs = (ms: number) =>
              MINI_PAD_Y + MINI_PLOT_H - (ms / effectiveMaxMs) * MINI_PLOT_H;

            return (
              <div key={model.ct} className={styles.caseBlock}>
                <p className={styles.caseTitle}>{CASE_LABEL[model.ct]}</p>
                <svg
                  className={styles.svg}
                  viewBox={`0 0 ${MINI_VB_W} ${MINI_VB_H}`}
                  preserveAspectRatio="xMidYMid meet"
                  aria-label={`${CASE_LABEL[model.ct]} 複雜度圖`}
                >
                  <rect
                    x={MINI_PAD_X}
                    y={MINI_PAD_Y}
                    width={MINI_PLOT_W}
                    height={MINI_PLOT_H}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={1}
                    rx={4}
                  />
                  {algorithms.map((a) => {
                    const meta = ALGORITHM_META[a.id];
                    const pts = (a.benchmarkByCase[model.ct] ?? [])
                      .map((p) => `${model.xN(p.n)},${yMs(p.ms)}`)
                      .join(" ");
                    if (!pts) return null;
                    const active = isActive(a.id);
                    return (
                      <polyline
                        key={a.id}
                        fill="none"
                        stroke={active ? meta.color : "var(--text-disabled)"}
                        strokeWidth={active ? 2 : 1}
                        opacity={active ? 1 : 0.3}
                        points={pts}
                      />
                    );
                  })}
                  {algorithms.map((a) => {
                    const pts = a.benchmarkByCase[model.ct];
                    const last = pts?.[pts.length - 1];
                    if (!last) return null;
                    const meta = ALGORITHM_META[a.id];
                    const active = isActive(a.id);
                    return (
                      <text
                        key={a.id}
                        x={MINI_PAD_X + MINI_PLOT_W + 5}
                        y={yMs(last.ms)}
                        fill={active ? meta.color : "var(--text-disabled)"}
                        fontSize={14}
                        dominantBaseline="middle"
                        opacity={active ? 1 : 0.3}
                      >
                        {meta.theoreticalComplexity[model.ct]}
                      </text>
                    );
                  })}
                  {X_TICKS.map((n) => (
                    <text
                      key={n}
                      x={model.xN(n)}
                      y={MINI_PAD_Y + MINI_PLOT_H + 14}
                      textAnchor="middle"
                      fill="var(--text-secondary)"
                      fontSize={16}
                    >
                      {n >= 1000 ? `${n / 1000}k` : n}
                    </text>
                  ))}
                  {[0, 0.5, 1.0].map((t) => {
                    const ms = effectiveMaxMs * t;
                    const label =
                      ms < 0.01
                        ? "0"
                        : ms < 1
                          ? `${ms.toFixed(2)}`
                          : `${ms.toFixed(0)}`;
                    return (
                      <text
                        key={t}
                        x={MINI_PAD_X - 4}
                        y={yMs(ms)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill="var(--text-secondary)"
                        fontSize={16}
                      >
                        {label}
                      </text>
                    );
                  })}
                  <text
                    transform={`rotate(90, ${MINI_PAD_X + MINI_PLOT_W + 80}, ${MINI_PAD_Y + MINI_PLOT_H / 2})`}
                    x={MINI_PAD_X + MINI_PLOT_W + 80}
                    y={MINI_PAD_Y + MINI_PLOT_H / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--text-tertiary)"
                    fontSize={16}
                  >
                    理論時間複雜度
                  </text>
                  <text
                    transform={`rotate(-90, ${MINI_PAD_X - 35}, ${MINI_PAD_Y + MINI_PLOT_H / 2})`}
                    x={MINI_PAD_X - 35}
                    y={MINI_PAD_Y + MINI_PLOT_H / 2}
                    textAnchor="middle"
                    fill="var(--text-tertiary)"
                    fontSize={16}
                  >
                    執行時間 (ms)
                  </text>
                  <text
                    x={MINI_PAD_X + MINI_PLOT_W / 2}
                    y={MINI_VB_H - 5}
                    textAnchor="middle"
                    fill="var(--text-tertiary)"
                    fontSize={16}
                  >
                    資料筆數 n
                  </text>
                </svg>
              </div>
            );
          })}
      </div>
      <ul className={styles.legend}>
        {algorithms.map((a) => (
          <li
            key={a.id}
            className={`${styles.legendItem} ${!isActive(a.id) ? styles.legendItemDimmed : ""}`}
            onClick={() => handleLegendClick(a.id)}
          >
            <span
              className={styles.dot}
              style={{
                background: isActive(a.id)
                  ? ALGORITHM_META[a.id].color
                  : "var(--text-disabled)",
              }}
            />
            {ALGORITHM_META[a.id].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
