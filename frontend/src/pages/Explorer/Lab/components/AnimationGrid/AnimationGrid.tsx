import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import type { LabAlgorithmState } from "../../types/lab";
import { SortBarChart } from "../SortBarChart/SortBarChart";
import styles from "./AnimationGrid.module.scss";

function displayStepIndex(currentStep: number, stepCount: number): number {
  if (stepCount === 0) return 0;
  return Math.min(currentStep, stepCount - 1);
}

export interface AnimationGridProps {
  algorithms: LabAlgorithmState[];
  currentStep: number;
}

export function AnimationGrid({ algorithms, currentStep }: AnimationGridProps) {
  if (!algorithms.length) {
    return (
      <EmptyState
        icon={<Icon name="chart-bar" size="xl" />}
        title="尚未選擇演算法"
        description="請在左側側邊欄勾選要比較的排序演算法。"
        className={styles.empty}
        aria-label="尚未選擇演算法"
      />
    );
  }

  return (
    <div className={styles.grid}>
      {algorithms.map((algo) => {
        const idx = displayStepIndex(currentStep, algo.steps.length);
        const step = algo.steps[idx];
        const meta = ALGORITHM_META[algo.id];
        return (
          <SortBarChart
            key={algo.id}
            title={meta.label}
            elements={step?.elements ?? []}
          />
        );
      })}
    </div>
  );
}
