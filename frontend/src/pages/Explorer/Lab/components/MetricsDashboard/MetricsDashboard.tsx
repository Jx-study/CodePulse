import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import { useLabContext } from "../../context/LabContext";
import type { AlgorithmId } from "../../types/lab";
import styles from "./MetricsDashboard.module.scss";

const MANUAL_COLOR = "#ff6b35";

function formatElapsed(ms: number): string {
  if (ms <= 0) return "--";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatMs(ms: number): string {
  if (ms < 0.001) return "0 ms";
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  return `${ms.toFixed(2)} ms`;
}

function stepIndex(currentStep: number, len: number): number {
  if (len === 0) return 0;
  return Math.min(currentStep, len - 1);
}

function spaceValueAtStep(
  id: AlgorithmId,
  stepIdx: number,
  stackDepthPerStep: number[],
  auxSizePerStep: number[],
): number {
  if (id === "quickSort") return stackDepthPerStep[stepIdx] ?? 0;
  if (id === "mergeSort") return auxSizePerStep[stepIdx] ?? 0;
  return 0;
}

function spaceUnitKey(id: AlgorithmId): string {
  if (id === "quickSort") return "metrics.spaceUnitLayers";
  if (id === "mergeSort") return "metrics.spaceUnitElements";
  return "";
}

export function MetricsDashboard() {
  const { t } = useTranslation("lab");
  const {
    algorithms,
    currentStep,
    manualSortEnabled,
    manualSortMoves,
    manualSortStartMs,
    manualSortEndMs,
    inputData,
    manualSortData,
  } = useLabContext();

  const [liveNow, setLiveNow] = useState(() => Date.now());

  useEffect(() => {
    if (!manualSortStartMs || manualSortEndMs !== null) return;
    const id = setInterval(() => setLiveNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [manualSortStartMs, manualSortEndMs]);

  const sortedRef = useMemo(
    () => [...inputData].sort((a, b) => a - b),
    [inputData],
  );

  const isManualCompleted =
    manualSortEnabled &&
    manualSortMoves > 0 &&
    manualSortData.length > 0 &&
    manualSortData.every((v, i) => v === sortedRef[i]);

  const elapsedMs = manualSortStartMs
    ? (manualSortEndMs ?? liveNow) - manualSortStartMs
    : 0;

  const timeRows = useMemo(() => {
    return algorithms.map((a) => {
      const meta = ALGORITHM_META[a.id];
      const fraction = a.steps.length > 0
        ? Math.min(currentStep, a.steps.length) / a.steps.length
        : 0;
      const displayMs = a.execTimeMs * fraction;
      return {
        id: a.id,
        label: meta.label,
        value: displayMs,
        totalMs: a.execTimeMs,
        color: meta.color,
      };
    });
  }, [algorithms, currentStep]);

  const maxTimeMs = useMemo(() => {
    if (!algorithms.length) return 1e-9;
    return Math.max(1e-9, ...algorithms.map((a) => a.execTimeMs));
  }, [algorithms]);

  const compareRows = useMemo(() => {
    return algorithms.map((a) => {
      const meta = ALGORITHM_META[a.id];
      const idx = stepIndex(currentStep, a.compareCountPerStep.length);
      const v = a.compareCountPerStep[idx] ?? 0;
      const maxV = a.compareCountPerStep.length
        ? a.compareCountPerStep[a.compareCountPerStep.length - 1]
        : 0;
      return { id: a.id, label: meta.label, value: v, maxValue: maxV, color: meta.color };
    });
  }, [algorithms, currentStep]);

  const moveRows = useMemo(() => {
    return algorithms.map((a) => {
      const meta = ALGORITHM_META[a.id];
      const idx = stepIndex(currentStep, a.moveCountPerStep.length);
      const v = a.moveCountPerStep[idx] ?? 0;
      const maxV = a.moveCountPerStep.length
        ? a.moveCountPerStep[a.moveCountPerStep.length - 1]
        : 0;
      return { id: a.id, label: meta.label, value: v, maxValue: maxV, color: meta.color };
    });
  }, [algorithms, currentStep]);

  const spaceRows = useMemo(() => {
    return algorithms.map((a) => {
      const meta = ALGORITHM_META[a.id];
      const idx = stepIndex(
        currentStep,
        Math.max(a.stackDepthPerStep.length, a.auxSizePerStep.length),
      );
      const v = spaceValueAtStep(
        a.id,
        idx,
        a.stackDepthPerStep,
        a.auxSizePerStep,
      );
      const maxStack = a.stackDepthPerStep.length
        ? Math.max(...a.stackDepthPerStep)
        : 0;
      const maxAux = a.auxSizePerStep.length
        ? Math.max(...a.auxSizePerStep)
        : 0;
      const maxValue = Math.max(maxStack, maxAux, 1);
      return {
        id: a.id,
        label: meta.label,
        value: v,
        maxValue,
        color: meta.color,
        unitKey: spaceUnitKey(a.id),
      };
    });
  }, [algorithms, currentStep]);

  const maxCompare = useMemo(() => {
    if (!compareRows.length) return 1;
    return Math.max(1, ...compareRows.map((r) => r.maxValue));
  }, [compareRows]);

  const maxMove = useMemo(() => {
    if (!moveRows.length) return 1;
    return Math.max(1, ...moveRows.map((r) => r.maxValue));
  }, [moveRows]);

  const maxSpace = useMemo(() => {
    if (!spaceRows.length) return 1;
    return Math.max(1, ...spaceRows.map((r) => r.maxValue));
  }, [spaceRows]);

  return (
    <div className={styles.wrap}>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionTitle}>{t("metrics.execTime")}</span>
        </div>
        <div className={styles.hBars}>
          {timeRows.map((row) => (
            <div key={row.id} className={styles.hRow}>
              <span className={styles.rowLabel}>{row.label}</span>
              <div className={styles.hTrack}>
                <div
                  className={styles.hFill}
                  style={{
                    width: `${(row.value / maxTimeMs) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
              <span className={styles.rowValue}>{formatMs(row.value)}</span>
            </div>
          ))}
          {!timeRows.length && (
            <p className={styles.placeholder}>{t("metrics.selectToShow")}</p>
          )}
        </div>
      </div>

      <div className={`${styles.section} ${styles.sectionMetrics}`}>
        <div className={styles.sectionHead}>
          <span
            className={styles.sectionTitle}
            title={t("metrics.compareCountTitle")}
          >
            {t("metrics.compareCount")}
          </span>
        </div>
        <div className={styles.hBars}>
          {compareRows.map((row) => (
            <div key={row.id} className={styles.hRow}>
              <span className={styles.rowLabel}>{row.label}</span>
              <div className={styles.hTrack}>
                <div
                  className={styles.hFill}
                  style={{
                    width: `${(row.value / maxCompare) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          ))}
          {!compareRows.length && (
            <p className={styles.placeholder}>{t("metrics.selectToShow")}</p>
          )}
        </div>
      </div>

      <div className={`${styles.section} ${styles.sectionMetrics}`}>
        <div className={styles.sectionHead}>
          <span
            className={styles.sectionTitle}
            title={t("metrics.moveCountTitle")}
          >
            {t("metrics.moveCount")}
          </span>
        </div>
        <div className={styles.hBars}>
          {moveRows.map((row) => (
            <div key={row.id} className={styles.hRow}>
              <span className={styles.rowLabel}>{row.label}</span>
              <div className={styles.hTrack}>
                <div
                  className={styles.hFill}
                  style={{
                    width: `${(row.value / maxMove) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          ))}
          {!moveRows.length && (
            <p className={styles.placeholder}>{t("metrics.selectToShow")}</p>
          )}
        </div>
      </div>

      <div className={`${styles.section} ${styles.sectionMetrics}`}>
        <div className={styles.sectionHead}>
          <span
            className={styles.sectionTitle}
            title={t("metrics.auxSpaceTitle")}
          >
            {t("metrics.auxSpace")}
          </span>
        </div>
        <div className={styles.hBars}>
          {spaceRows.map((row) => (
            <div key={row.id} className={styles.hRow}>
              <span className={styles.rowLabel}>{row.label}</span>
              <div className={styles.hTrack}>
                <div
                  className={styles.hFill}
                  style={{
                    width: `${(row.value / maxSpace) * 100}%`,
                    background: row.color,
                  }}
                />
              </div>
              <span className={styles.rowValue}>
                {row.unitKey ? `${row.value} ${t(row.unitKey)}` : row.value}
              </span>
            </div>
          ))}
          {!spaceRows.length && (
            <p className={styles.placeholder}>{t("metrics.selectToShow")}</p>
          )}
        </div>
      </div>

      {manualSortEnabled && (
        <div className={`${styles.section} ${styles.sectionMetrics} ${styles.sectionManual}`}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>{t("metrics.manualSortTitle")}</span>
            {isManualCompleted && (
              <div className={styles.statBadge}>{t("metrics.sortComplete")}</div>
            )}
          </div>
          <div className={styles.manualStats}>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>{t("metrics.elapsed")}</span>
              <span className={styles.statValue} style={{ color: MANUAL_COLOR }}>
                {formatElapsed(elapsedMs)}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>{t("metrics.moves")}</span>
              <span className={styles.statValue} style={{ color: MANUAL_COLOR }}>
                {manualSortMoves}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
