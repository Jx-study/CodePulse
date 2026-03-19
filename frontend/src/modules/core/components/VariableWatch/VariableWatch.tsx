import React from "react";
import styles from "./VariableWatch.module.scss";

interface VariableWatchProps {
  variables?: Record<string, string | number | boolean | null>;
}

export const VariableWatch: React.FC<VariableWatchProps> = ({ variables }) => {
  
  const hasVariables = variables && Object.keys(variables).length > 0;

  return (
    <div className={styles.variableWatchContainer}>
      <div className={styles.title}>Variables Snapshot</div>
      <div className={styles.grid}>
        {!hasVariables ? (
        // 情況 A：沒有變數 (null, undefined, 或 {})
        <div className={styles.variableItem}>
          <span className={styles.varValue}>No variables</span>
        </div>
      ) : (
        // 情況 B：有變數，進行 map 渲染
        Object.entries(variables).map(([key, value]) => {
          const isNullish = value === null || value === undefined;
          
          // 如果 value 是物件或陣列，用 JSON.stringify 處理，否則一般字串化即可
          const displayValue = isNullish 
            ? "null" 
            : (typeof value === 'object' ? JSON.stringify(value) : String(value));

          return (
            <div key={key} className={styles.variableItem}>
              <span className={styles.varName}>{key}:</span>
              <span className={isNullish ? styles.nullValue : styles.varValue}>
                {displayValue}
              </span>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};

export default VariableWatch;
