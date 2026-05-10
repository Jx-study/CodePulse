import { useEffect, useMemo, useRef } from "react";
import type { BaseElement } from "@/modules/core/DataLogic/BaseElement";
import { Status, statusColorMap } from "@/modules/core/DataLogic/BaseElement";
import styles from "./SortBarChart.module.scss";

const MIN_BAR_TOTAL_PX = 5; // 3px bar + 2px gap
const CHART_PADDING_X = 8;  // 4px left + 4px right padding

function barColor(status: string): string {
  const s = status as Status;
  return statusColorMap[s] ?? statusColorMap[Status.Unfinished];
}

export interface SortBarChartProps {
  title: string;
  titleColor?: string;
  elements: BaseElement[];
  onMaxItemsChange?: (max: number) => void;
}

export function SortBarChart({ title, titleColor, elements, onMaxItemsChange }: SortBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onMaxItemsChange || !chartRef.current) return;
    const el = chartRef.current;
    const compute = (width: number) => {
      const max = Math.max(20, Math.floor((width - CHART_PADDING_X) / MIN_BAR_TOTAL_PX));
      onMaxItemsChange(max);
    };
    compute(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => {
      compute(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [onMaxItemsChange]);

  const { barHeights, colors } = useMemo(() => {
    const nums = elements.map((el) => {
      const v = parseFloat(String(el.value));
      return Number.isFinite(v) ? v : 0;
    });
    const minVal = nums.length ? Math.min(...nums) : 0;
    const maxVal = nums.length ? Math.max(...nums) : 0;
    const range = maxVal - minVal || 1;
    const heights = nums.map((n) => ((n - minVal) / range) * 85);
    const cols = elements.map((el) => barColor(el.status));
    return { barHeights: heights, colors: cols };
  }, [elements]);

  return (
    <div className={styles.wrap}>
      <div className={styles.title} style={{ color: titleColor }}>
        {title}
      </div>
      <div ref={chartRef} className={styles.chart}>
        {elements.map((el, i) => (
          <div key={el.id || i} className={styles.barColumn}>
            <div
              className={styles.bar}
              style={{
                height: `${barHeights[i] ?? 0}%`,
                background: colors[i],
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
