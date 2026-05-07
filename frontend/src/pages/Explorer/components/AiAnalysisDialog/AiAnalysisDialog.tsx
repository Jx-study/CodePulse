import { useState } from "react";
import Button from "@/shared/components/Button";
import Dialog from "@/shared/components/Dialog";
import { SkeletonText } from "@/shared/components/Skeleton";
import type { RunStage } from "../StatusBar";
import styles from "./AiAnalysisDialog.module.scss";

export interface AiResult {
  detected_algorithm: string | null;
  confidence_score: number | null;
  time_complexity: string | null;
  analysis_source: "gemini" | "miniLM" | null;
  summary: string | null;
  suggestions: string[];
}

// Top-3 candidates when confidence is low (MiniLM mode)
export interface AlgoCandidate {
  name: string;
  score: number;
}

interface AiAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  runStage: RunStage;
  aiResult: AiResult | null;
  /** Provided by backend when MiniLM is used and confidence < 0.85 */
  top3Candidates?: AlgoCandidate[];
  /** Called when user confirms an algorithm to apply */
  onApplyAlgorithm?: (algoName: string) => void;
}

type DialogTab = "detection" | "summary";

export function AiAnalysisDialog({
  isOpen,
  onClose,
  runStage,
  aiResult,
  top3Candidates,
  onApplyAlgorithm,
}: AiAnalysisDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>("detection");
  const [selectedAlgo, setSelectedAlgo] = useState<string | null>(null);

  const isLoading = runStage === "gemini";
  const isHighConfidence =
    aiResult !== null &&
    (aiResult.confidence_score === null || aiResult.confidence_score >= 0.85) &&
    !top3Candidates?.length;
  const isTop3Mode = !isHighConfidence && !!top3Candidates?.length;

  const handleApply = () => {
    const target = isTop3Mode
      ? selectedAlgo ?? top3Candidates![0]?.name
      : aiResult?.detected_algorithm;
    if (target && onApplyAlgorithm) {
      onApplyAlgorithm(target);
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className={styles.dialogTitle}>
          <span className={styles.dialogTitleIcon}>✦</span>
          AI Analysis
          {isLoading && (
            <span className={styles.dialogTitleNote}>Gemini 仲裁中…</span>
          )}
        </div>
      }
    >
      {/* Local tabs */}
      <div className={styles.tabs}>
        <Button
          variant="unstyled"
          className={`${styles.tab} ${activeTab === "detection" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("detection")}
        >
          Algorithm Detection
        </Button>
        <Button
          variant="unstyled"
          className={`${styles.tab} ${activeTab === "summary" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("summary")}
        >
          Code Summary
        </Button>
      </div>

      {/* Tab: Detection */}
      {activeTab === "detection" && (
        <div className={styles.tabBody}>
          {isLoading ? (
            <div className={styles.block}>
              <div className={styles.blockHeader}>◎ Detected Algorithm</div>
              <div className={styles.skeletonWrap}>
                <SkeletonText lines={2} />
              </div>
            </div>
          ) : isTop3Mode ? (
            /* MiniLM top-3 mode */
            <div className={styles.block}>
              <div className={styles.blockHeader}>
                ◎ 演算法辨識結果不明確，請選擇最符合的：
              </div>
              <div className={styles.top3List}>
                {top3Candidates!.map((c) => {
                  const chosen = selectedAlgo ?? top3Candidates![0]?.name;
                  const isSelected = c.name === chosen;
                  return (
                    <Button
                      key={c.name}
                      variant="unstyled"
                      className={`${styles.top3Option} ${isSelected ? styles.top3Selected : ""}`}
                      onClick={() => setSelectedAlgo(c.name)}
                    >
                      <span className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ""}`}>
                        {isSelected && <span className={styles.radioDot} />}
                      </span>
                      <span className={styles.top3Name}>{c.name}</span>
                      <span className={styles.top3Score}>{Math.round(c.score * 100)}%</span>
                      <span className={styles.top3Bar}>
                        <span className={styles.top3Fill} style={{ width: `${c.score * 100}%` }} />
                      </span>
                    </Button>
                  );
                })}
              </div>
              <div className={styles.applyRow}>
                <Button variant="unstyled" className={styles.applyBtn} onClick={handleApply}>
                  ▶ 套用選定動畫
                </Button>
                <Button variant="unstyled" className={styles.skipBtn} onClick={onClose}>
                  略過
                </Button>
              </div>
            </div>
          ) : (
            /* High-confidence single result */
            <div className={styles.block}>
              <div className={styles.blockHeader}>◎ Detected Algorithm</div>
              <div className={styles.detectionRow}>
                <span className={styles.algoName}>
                  {aiResult?.detected_algorithm ?? "—"}
                </span>
                {aiResult?.confidence_score != null && (
                  <div className={styles.confidenceWrap}>
                    <span className={styles.confidenceLabel}>
                      信心 {Math.round(aiResult.confidence_score * 100)}%
                    </span>
                    <span className={styles.confidenceBar}>
                      <span
                        className={styles.confidenceFill}
                        style={{ width: `${aiResult.confidence_score * 100}%` }}
                      />
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.metaRow}>
                {aiResult?.time_complexity && (
                  <span className={styles.metaTag}>
                    <span className={styles.metaLabel}>Time</span>
                    {aiResult.time_complexity}
                  </span>
                )}
                {aiResult?.analysis_source && (
                  <span className={styles.sourceBadge}>
                    ✦ {aiResult.analysis_source}
                  </span>
                )}
              </div>
              {aiResult?.detected_algorithm && (
                <Button variant="unstyled" className={styles.applyBtnFull} onClick={handleApply}>
                  ▶ 套用 {aiResult.detected_algorithm} 動畫
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Summary */}
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
                  <div className={styles.summaryLabel}>用途</div>
                  <p className={styles.summaryText}>{aiResult.summary}</p>
                </div>
                {aiResult.suggestions.length > 0 && (
                  <div>
                    <div className={styles.summaryLabel}>優化建議</div>
                    <ul className={styles.suggestions}>
                      {aiResult.suggestions.map((s, i) => (
                        <li key={i} className={styles.suggestionItem}>
                          <span className={styles.suggestionBullet} />
                          {s}
                        </li>
                      ))}
                    </ul>
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