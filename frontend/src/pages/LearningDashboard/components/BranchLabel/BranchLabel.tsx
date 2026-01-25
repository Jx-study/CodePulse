import styles from "./BranchLabel.module.scss";
import type { BranchLabelProps } from "@/types";

/**
 * BranchLabel - 分支路徑標籤組件
 *
 * 顯示在分支路徑上方的標籤，用於標識不同的學習路徑
 * 例如：「Sorting Path」、「Search Path」、「Advanced Path」
 *
 * @example
 * <BranchLabel
 *   label="Sorting Path"
 *   position={{ x: 200, y: 100 }}
 *   color="#635bff"
 * />
 */
function BranchLabel({ label, position, color = "#635bff" }: BranchLabelProps) {
  return (
    <div
      className={styles.branchLabel}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        borderColor: color,
      }}
    >
      <div
        className={styles.labelContent}
        style={{
          color: color,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default BranchLabel;
