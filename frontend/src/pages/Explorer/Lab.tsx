import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Icon from "@/shared/components/Icon";
import { LabProvider, useLabContext } from "./Lab/context/LabContext";
import { useLabAnimation } from "./Lab/hooks/useLabAnimation";
import { LabSidebar } from "./Lab/components/LabSidebar/LabSidebar";
import { MetricsDashboard } from "./Lab/components/MetricsDashboard/MetricsDashboard";
import { AnimationGrid } from "./Lab/components/AnimationGrid/AnimationGrid";
import { ComplexityChart } from "./Lab/components/ComplexityChart/ComplexityChart";
import { AnimationToolbar } from "./Lab/components/AnimationToolbar/AnimationToolbar";
import styles from "./Lab.module.scss";

function LabShell() {
  const { t } = useTranslation();
  const {
    algorithms,
    currentStep,
    maxSteps,
    playState,
    speed,
    showComplexityChart,
    complexityChartMode,
    layoutFlipped,
    dispatch,
  } = useLabContext();

  useLabAnimation(playState, speed, maxSteps, dispatch);

  return (
    <div className={styles.lab}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Link to="/explorer" className={styles.backBtn} aria-label="返回 Explorer">
            <Icon name="arrow-left" decorative />
          </Link>
          <div className={styles.divider} />
          <h1 className={styles.toolbarTitle}>
            {t("explorer")} — 演算法實驗室
          </h1>
        </div>
      </div>

      <div
        className={styles.workspace}
        data-flipped={layoutFlipped ? "true" : "false"}
      >
        <LabSidebar />
        <div className={styles.main}>
          <MetricsDashboard />
          <div className={styles.stage}>
            {showComplexityChart ? (
              <ComplexityChart
                algorithms={algorithms}
                currentStep={currentStep}
                maxSteps={maxSteps}
                mode={complexityChartMode}
              />
            ) : (
              <AnimationGrid
                algorithms={algorithms}
                currentStep={currentStep}
              />
            )}
          </div>
          <AnimationToolbar />
        </div>
      </div>
    </div>
  );
}

function Lab() {
  return (
    <LabProvider>
      <LabShell />
    </LabProvider>
  );
}

export default Lab;
