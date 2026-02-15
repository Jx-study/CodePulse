import React from "react";
import type { AnalysisReport } from "@/types/practice";
import styles from "./ResultModal.module.scss";

interface Props {
  analysis: AnalysisReport;
}

const AnalysisCard: React.FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className={styles.analysisCard}>
      <h4 className={styles.analysisTitle}>學習診斷報告</h4>

      <div className={styles.analysisHeader}>
        <p className={styles.overallComment}>{analysis.overallComment}</p>
      </div>

      <div className={styles.tagsContainer}>
        {analysis.weaknessTags.map((tag) => (
          <span key={tag} className={`${styles.tag} ${styles.tagWeakness}`}>
            {tag}
          </span>
        ))}
        {analysis.behaviorTags.map((tag) => (
          <span key={tag} className={`${styles.tag} ${styles.tagBehavior}`}>
            {tag}
          </span>
        ))}
      </div>

      {analysis.suggestions.length > 0 && (
        <ul className={styles.suggestionsList}>
          {analysis.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AnalysisCard;
