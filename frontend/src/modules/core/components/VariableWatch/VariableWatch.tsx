import React from "react";
import styles from "./VariableWatch.module.scss";

interface VariableWatchProps {
  variables?: Record<string, string | number | boolean | null>;
}

export const VariableWatch: React.FC<VariableWatchProps> = ({ variables }) => {
  if (!variables || Object.keys(variables).length === 0) {
    return null;
  }

  return (
    <div className={styles.variableWatchContainer}>
      <div className={styles.title}>Variables Snapshot</div>
      <div className={styles.grid}>
        {Object.entries(variables).map(([key, value]) => (
          <div key={key} className={styles.variableItem}>
            <span className={styles.varName}>{key}:</span>
            <span className={value === null || value === undefined ? styles.nullValue : styles.varValue}>
              {value === null || value === undefined ? "null" : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariableWatch;
