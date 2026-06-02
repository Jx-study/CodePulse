// frontend/src/pages/Explorer/components/StatusBar/StatusBar.tsx
import { useTranslation } from "react-i18next";
import type { RunStage } from "@/types/runStage";
import styles from "./StatusBar.module.scss";

const STAGE_ORDER: RunStage[] = ["syntax_check", "sandbox", "analysis"];

interface StatusBarProps {
  stage: RunStage;
}

export function StatusBar({ stage }: StatusBarProps) {
  const { t } = useTranslation("playground");
  const isRunning = stage !== "idle" && stage !== "done";
  const isDone    = stage === "done";

  const stageMessages: Record<RunStage, string> = {
    idle:         t("statusBar.idle"),
    syntax_check: t("statusBar.syntaxCheck"),
    sandbox:      t("statusBar.sandbox"),
    analysis:     t("statusBar.analysis"),
    done:         t("statusBar.done"),
  };

  return (
    <div className={styles.bar}>
      <span
        className={`${styles.dot} ${isDone ? styles.dotDone : isRunning ? styles.dotRunning : styles.dotIdle}`}
      />
      <span className={`${styles.message} ${isDone ? styles.messageDone : ""}`}>
        {stageMessages[stage]}
      </span>

      {isRunning && (
        <div className={styles.pills}>
          {STAGE_ORDER.map((s, i) => {
            const idx        = STAGE_ORDER.indexOf(stage);
            const isActive   = s === stage;
            const isComplete = STAGE_ORDER.indexOf(s) < idx;
            return (
              <span key={s}>
                {i > 0 && <span className={styles.sep}>›</span>}
                <span
                  className={`${styles.pill} ${isActive ? styles.pillActive : isComplete ? styles.pillDone : ""}`}
                >
                  {s}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StatusBar;
