import { useRef, useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "@/shared/components/Button";
import Icon from "@/shared/components/Icon";
import { useLabContext } from "../../context/LabContext";
import styles from "./ManualSortChart.module.scss";

const COLOR_UNFINISHED = "#1d79cfff";
const COLOR_CORRECT = "#46f336ff";
const COLOR_DRAGGING = "#ff6b35";

export function ManualSortChart() {
  const { t } = useTranslation("lab");
  const {
    inputData,
    manualSortData,
    manualDragStarted,
    manualSortStartMs,
    manualSortEndMs,
    playState,
    dispatch,
  } = useLabContext();

  const chartRef = useRef<HTMLDivElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [startX, setStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);

  const sortedRef = useMemo(
    () => [...inputData].sort((a, b) => a - b),
    [inputData],
  );

  const minVal = manualSortData.length ? Math.min(...manualSortData) : 0;
  const maxVal = manualSortData.length ? Math.max(...manualSortData) : 1;
  const range = maxVal - minVal || 1;
  const barHeights = manualSortData.map((v) => ((v - minVal) / range) * 85);

  const isCompleted =
    manualSortData.length > 0 &&
    manualSortData.every((v, i) => v === sortedRef[i]);

  useEffect(() => {
    if (isCompleted && manualSortStartMs !== null && manualSortEndMs === null) {
      dispatch({ type: "MANUAL_SORT_COMPLETE", endMs: Date.now() });
    }
  }, [isCompleted, manualSortStartMs, manualSortEndMs, dispatch]);

  // Compute which slot the dragged bar is currently hovering over
  const getDragOver = (): number | null => {
    if (dragFrom === null || !chartRef.current) return null;
    const n = manualSortData.length;
    if (n === 0) return null;
    const barWidth = chartRef.current.offsetWidth / n;
    const originalCenterX = dragFrom * barWidth + barWidth / 2;
    const currentCenterX = originalCenterX + (dragCurrentX - startX);
    return Math.max(0, Math.min(n - 1, Math.floor(currentCenterX / barWidth)));
  };

  const dragOver = getDragOver();

  const getTranslateX = (i: number): number => {
    if (dragFrom === null || !chartRef.current) return 0;
    const n = manualSortData.length;
    if (n === 0) return 0;
    const barWidth = chartRef.current.offsetWidth / n;

    if (i === dragFrom) return dragCurrentX - startX;
    if (dragOver === null || dragOver === dragFrom) return 0;

    if (dragFrom < dragOver) {
      if (i > dragFrom && i <= dragOver) return -barWidth;
    } else {
      if (i >= dragOver && i < dragFrom) return barWidth;
    }
    return 0;
  };

  const getBarColor = (i: number, val: number): string => {
    if (i === dragFrom) return COLOR_DRAGGING;
    if (val === sortedRef[i]) return COLOR_CORRECT;
    return COLOR_UNFINISHED;
  };

  // Dragged bar follows cursor instantly; other bars animate; post-drop: no transition
  const getTransition = (i: number): string => {
    if (dragFrom === null) return "none";
    if (i === dragFrom) return "none";
    return "transform 150ms ease";
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragFrom(i);
    setStartX(e.clientX);
    setDragCurrentX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (dragFrom !== i) return;
    setDragCurrentX(e.clientX);
  };

  const onPointerUp = (_e: React.PointerEvent<HTMLDivElement>, i: number) => {
    if (dragFrom !== i) return;
    if (dragOver !== null && dragOver !== dragFrom) {
      dispatch({ type: "MANUAL_SORT_SWAP", fromIdx: dragFrom, toIdx: dragOver });
      if (!manualDragStarted && playState !== "playing") {
        dispatch({ type: "PLAY" });
      }
    }
    setDragFrom(null);
  };

  const onPointerCancel = () => {
    setDragFrom(null);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Manual Sort</span>
        <Button
          size="sm"
          variant="ghost"
          className={styles.buttonClass}
          onClick={() => dispatch({ type: "MANUAL_SORT_RESET" })}
          aria-label={t("manualSort.resetAriaLabel")}
        >
          <Icon name="rotate" decorative />
        </Button>
      </div>

      <div className={styles.chart} ref={chartRef}>
        {manualSortData.map((val, i) => (
          <div
            key={i}
            className={`${styles.barColumn} ${i === dragFrom ? styles.dragging : ""}`}
            onPointerDown={(e) => onPointerDown(e, i)}
            onPointerMove={(e) => onPointerMove(e, i)}
            onPointerUp={(e) => onPointerUp(e, i)}
            onPointerCancel={onPointerCancel}
            aria-label={
              val === sortedRef[i]
                ? t("manualSort.barAriaLabelInPlace", { slot: i + 1, val })
                : t("manualSort.barAriaLabel", { slot: i + 1, val })
            }
            style={{
              transform: `translateX(${getTranslateX(i)}px)`,
              transition: getTransition(i),
            }}
          >
            <div
              className={styles.bar}
              style={{
                height: `${barHeights[i] ?? 0}%`,
                background: getBarColor(i, val),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
