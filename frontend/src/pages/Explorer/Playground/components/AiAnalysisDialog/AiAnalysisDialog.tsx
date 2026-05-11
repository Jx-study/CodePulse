import { useState } from "react";
import Dialog from "@/shared/components/Dialog";
import { SkeletonText } from "@/shared/components/Skeleton";
import Button from "@/shared/components/Button";
import type { AiResult } from "@/types/ai";
import type { RunStage } from "@/types/runStage";
import styles from "./AiAnalysisDialog.module.scss";

interface AiAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  runStage: RunStage;
  aiResult: AiResult | null;
}

type DialogTab = "complexity" | "summary";

export function AiAnalysisDialog({
  isOpen,
  onClose,
  runStage,
  aiResult,
}: AiAnalysisDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>("complexity");

  const isLoading = runStage === "gemini" || (runStage !== "done" && aiResult === null);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className={styles.dialogTitle}>
          <span className={styles.dialogTitleIcon}>✦</span>
          AI Analysis
          {runStage === "gemini" && (
            <span className={styles.dialogTitleNote}>Gemini 仲裁中…</span>
          )}
        </div>
      }
    >
      {/* Tabs */}
      <div className={styles.tabs}>
        <Button
          variant="unstyled"
          className={`${styles.tab} ${activeTab === "complexity" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("complexity")}
        >
          Complexity
        </Button>
        <Button
          variant="unstyled"
          className={`${styles.tab} ${activeTab === "summary" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          AI Summary
        </Button>
      </div>

      {/* Tab: Complexity */}
      {activeTab === "complexity" && (
        <div className={styles.tabBody}>
          <div className={styles.block}>
            <div className={styles.blockHeader}>◎ Time Complexity</div>
            {isLoading || !aiResult ? (
              <div className={styles.skeletonWrap}>
                <SkeletonText lines={2} />
              </div>
            ) : (
              <div className={styles.complexityBody}>
                <span className={styles.complexityValue}>
                  {aiResult.time_complexity ?? "—"}
                </span>
                {aiResult.analysis_source && (
                  <span className={styles.sourceBadge}>
                    ✦ {aiResult.analysis_source}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AI Summary */}
      {activeTab === "summary" && (
        <div className={styles.tabBody}>
          <div className={styles.block}>
            <div className={styles.blockHeader}>◈ Code Summary</div>
            {isLoading || !aiResult?.summary ? (
              <div className={styles.skeletonWrap}>
                <SkeletonText lines={5} />
              </div>
            ) : (
              <div className={styles.summaryBody}>
                <div>
                  <div className={styles.summaryLabel}>Purpose</div>
                  <p className={styles.summaryText}>{aiResult.summary.purpose}</p>
                </div>
                {aiResult.summary.feedback && (
                  <div>
                    <div className={styles.summaryLabel}>Feedback</div>
                    <p className={styles.summaryText}>{aiResult.summary.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default AiAnalysisDialog;
