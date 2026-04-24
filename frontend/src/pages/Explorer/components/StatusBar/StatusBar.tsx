// frontend/src/pages/Explorer/components/StatusBar/StatusBar.tsx
import type { RunStage } from "@/types/runStage";
import styles from "./StatusBar.module.scss";

const STAGE_ORDER: RunStage[] = ["syntax_check", "sandbox", "analysis", "gemini"];

const STAGE_MESSAGES: Record<RunStage, string> = {
  idle:         "就緒 — 按下 Run 開始分析",
  syntax_check: "語法預檢與沙箱啟動中…",
  sandbox:      "正在模擬執行並計算複雜度…",
  analysis:     "演算法辨識中…",
  gemini:       "Gemini 專家仲裁中… （動畫已可播放）",
  done:         "分析完成",
};

interface StatusBarProps {
  stage: RunStage;
}

export function StatusBar({ stage }: StatusBarProps) {
  const isRunning = stage !== "idle" && stage !== "done";
  const isDone    = stage === "done";

  return (
    <div className={styles.bar}>
      <span
        className={`${styles.dot} ${isDone ? styles.dotDone : isRunning ? styles.dotRunning : styles.dotIdle}`}
      />
      <span className={`${styles.message} ${isDone ? styles.messageDone : ""}`}>
        {STAGE_MESSAGES[stage]}
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
