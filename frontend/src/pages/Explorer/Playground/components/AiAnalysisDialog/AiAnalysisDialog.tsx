import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@/shared/components/Dialog";
import { SkeletonText } from "@/shared/components/Skeleton";
import Button from "@/shared/components/Button";
import type { AiResult } from "@/types/ai";
import type { RunStage } from "@/types/runStage";
import { ALGORITHM_TO_IMPL_KEY } from "@/data/implementations/traceConverters";
import { getLevelByImplKey } from "@/services/LevelService";
import styles from "./AiAnalysisDialog.module.scss";

interface AiAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  runStage: RunStage;
  aiResult: AiResult | null;
}

type DialogTab = "complexity" | "algorithm" | "summary";

export function AiAnalysisDialog({
  isOpen,
  onClose,
  runStage,
  aiResult,
}: AiAnalysisDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>("complexity");
  const navigate = useNavigate();

  const isLoading = runStage === "analysis" || (runStage !== "done" && aiResult === null);
  // TODO: sentry — log when analysis completes with no result (backend returned null)
  const isError = runStage === "done" && aiResult === null;

  const tutorialLevel = useMemo(() => {
    if (!aiResult?.detected_algorithm) return null;
    const implKey = ALGORITHM_TO_IMPL_KEY[aiResult.detected_algorithm];
    if (!implKey) return null;
    return getLevelByImplKey(implKey);
  }, [aiResult?.detected_algorithm]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className={styles.dialogTitle}>
          <span className={styles.dialogTitleIcon}>✦</span>
          AI Analysis
          {runStage === "analysis" && (
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
        {tutorialLevel && (
          <Button
            variant="unstyled"
            className={`${styles.tab} ${activeTab === "algorithm" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("algorithm")}
          >
            Algorithm
          </Button>
        )}
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
            <div className={styles.blockHeader}>Time Complexity</div>
            {isError ? (
              <p className={styles.errorState}>Analysis failed — please re-run.</p>
            ) : isLoading || !aiResult ? (
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
                    {aiResult.analysis_source}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Algorithm */}
      {activeTab === "algorithm" && tutorialLevel && (
        <div className={styles.tabBody}>
          <div className={styles.block}>
            <div className={styles.blockHeader}>Detected Algorithm</div>
            <div className={styles.algoBlock}>
              <span className={styles.algoName}>
                {aiResult?.detected_algorithm?.replace(/_/g, " ")}
              </span>
              {aiResult?.confidence_score != null && (
                <span className={styles.algoConfidence}>
                  {Math.round(aiResult.confidence_score * 100)}%
                </span>
              )}
            </div>
          </div>
          <div className={styles.tutorialCta}>
            <p className={styles.tutorialCtaHint}>
              Want to learn how this algorithm works step by step?
            </p>
            <div title="前往該演算法的教學頁面，包含動畫演示與練習題">
              <Button
                variant="primaryOutline"
                size="sm"
                onClick={() => {
                  navigate(`/tutorial/${tutorialLevel.category}/${tutorialLevel.id}`);
                  onClose();
                }}
              >
                Go to Tutorial
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AI Summary */}
      {activeTab === "summary" && (
        <div className={styles.tabBody}>
          <div className={styles.block}>
            <div className={styles.blockHeader}>Code Summary</div>
            {isError ? (
              <p className={styles.errorState}>Analysis failed — please re-run.</p>
            ) : isLoading || !aiResult?.summary ? (
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
