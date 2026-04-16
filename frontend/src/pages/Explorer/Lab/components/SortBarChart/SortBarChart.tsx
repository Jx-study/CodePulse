import { useMemo } from "react";
import type { BaseElement } from "@/modules/core/DataLogic/BaseElement";
import { Status, statusColorMap } from "@/modules/core/DataLogic/BaseElement";
import styles from "./SortBarChart.module.scss";

function barColor(status: string): string {
  const s = status as Status;
  return statusColorMap[s] ?? statusColorMap[Status.Unfinished];
}

export interface SortBarChartProps {
  title: string;
  elements: BaseElement[];
}

export function SortBarChart({ title, elements }: SortBarChartProps) {
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
      <div className={styles.title}>{title}</div>
      <div className={styles.chart}>
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
