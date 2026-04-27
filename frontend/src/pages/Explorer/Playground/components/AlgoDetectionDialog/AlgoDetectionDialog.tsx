import { useState } from "react";
import Button from "@/shared/components/Button";
import Dialog from "@/shared/components/Dialog";
import type { AiResult, AlgoCandidate } from "@/types/ai";
import styles from "./AlgoDetectionDialog.module.scss";

interface AlgoDetectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  aiResult: AiResult | null;
  top3Candidates: AlgoCandidate[];
  onApply: (algoName: string) => void;
}

export function AlgoDetectionDialog({
  isOpen,
  onClose,
  aiResult,
  top3Candidates,
  onApply,
}: AlgoDetectionDialogProps) {
  const [selectedAlgo, setSelectedAlgo] = useState<string | null>(null);

  const isHighConfidence =
    aiResult !== null &&
    aiResult.level1_eligible &&
    !top3Candidates.length;

  const handleApply = () => {
    if (isHighConfidence) {
      if (aiResult?.detected_algorithm) onApply(aiResult.detected_algorithm);
    } else {
      const target = selectedAlgo ?? top3Candidates[0]?.name;
      if (target) onApply(target);
    }
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className={styles.title}>
          <span className={styles.titleIcon}>✦</span>
          Algorithm Detected
        </div>
      }
    >
      <div className={styles.body}>
        {isHighConfidence ? (
          <>
            <div className={styles.algoRow}>
              <span className={styles.algoName}>
                {aiResult?.detected_algorithm}
              </span>
              {aiResult?.confidence_score != null && (
                <div className={styles.confidenceWrap}>
                  <span className={styles.confidenceLabel}>
                    {Math.round(aiResult.confidence_score * 100)}%
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
            <p className={styles.hint}>
              Apply the matching animation for this algorithm?
            </p>
            <div className={styles.actionRow}>
              <Button variant="primary" size="sm" onClick={handleApply}>
                Apply Animation
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Skip
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.hint}>
              Results are inconclusive. Select the best match:
            </p>
            <div className={styles.top3List}>
              {top3Candidates.map((c) => {
                const chosen = selectedAlgo ?? top3Candidates[0]?.name;
                const isSelected = c.name === chosen;
                return (
                  <Button
                    key={c.name}
                    variant="unstyled"
                    className={`${styles.top3Option} ${isSelected ? styles.top3Selected : ""}`}
                    onClick={() => setSelectedAlgo(c.name)}
                  >
                    <span
                      className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ""}`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
                    <span className={styles.top3Name}>{c.name}</span>
                    <span className={styles.top3Score}>
                      {Math.round(c.score * 100)}%
                    </span>
                    <span className={styles.top3Bar}>
                      <span
                        className={styles.top3Fill}
                        style={{ width: `${c.score * 100}%` }}
                      />
                    </span>
                  </Button>
                );
              })}
            </div>
            <div className={styles.actionRow}>
              <Button variant="primary" size="sm" onClick={handleApply}>
                Apply Animation
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Skip
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}

export default AlgoDetectionDialog;
