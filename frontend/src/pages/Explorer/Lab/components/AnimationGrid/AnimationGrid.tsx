import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import EmptyState from "@/shared/components/EmptyState";
import Icon from "@/shared/components/Icon";
import { ALGORITHM_META } from "../../data/algorithmMeta";
import { useLabContext } from "../../context/LabContext";
import type { LabAlgorithmState } from "../../types/lab";
import { ManualSortChart } from "../ManualSortChart/ManualSortChart";
import { SortBarChart } from "../SortBarChart/SortBarChart";
import styles from "./AnimationGrid.module.scss";

function displayStepIndex(currentStep: number, stepCount: number): number {
  if (stepCount === 0) return 0;
  return Math.min(currentStep, stepCount - 1);
}

export interface AnimationGridProps {
  algorithms: LabAlgorithmState[];
  currentStep: number;
  manualSortEnabled?: boolean;
}

export function AnimationGrid({ algorithms, currentStep, manualSortEnabled = false }: AnimationGridProps) {
  const { t } = useTranslation("lab");
  const { dispatch } = useLabContext();

  const handleMaxItemsChange = useCallback(
    (max: number) => dispatch({ type: "SET_MAX_CHART_ITEMS", max }),
    [dispatch],
  );

  if (!algorithms.length && !manualSortEnabled) {
    return (
      <EmptyState
        icon={<Icon name="chart-bar" size="xl" />}
        title={t("animationGrid.emptyTitle")}
        description={t("animationGrid.emptyDesc")}
        className={styles.empty}
        aria-label={t("animationGrid.emptyTitle")}
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
            titleColor={meta.color}
            elements={step?.elements ?? []}
            onMaxItemsChange={handleMaxItemsChange}
          />
        );
      })}
      {manualSortEnabled && <ManualSortChart />}
    </div>
  );
}
