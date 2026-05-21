import styles from "./DSDiagram.module.scss";

const LINEAR_COLOR = "#3b82f6";
const NONLINEAR_COLOR = "#10b981";

const linear = ["Array 陣列", "Linked List 鏈結串列", "Stack 堆疊", "Queue 佇列"];
const nonLinear = ["Tree 樹", "Graph 圖", "Hash Table 雜湊表", "Heap 堆積"];

export default function DSDiagram() {
  return (
    <div className={styles.wrapper}>
      {/* Root */}
      <div className={styles.root}>資料結構</div>

      {/* Vertical line from root */}
      <div className={styles.rootLine} />

      {/* Horizontal connector */}
      <div className={styles.hConnector} />

      {/* Two branches */}
      <div className={styles.branches}>
        {/* Linear */}
        <div className={styles.branch}>
          <div className={styles.branchLine} />
          <div className={styles.category} style={{ borderColor: LINEAR_COLOR, color: LINEAR_COLOR }}>
            線性結構
          </div>
          <div className={styles.catLine} />
          <div className={styles.items}>
            {linear.map((name) => (
              <div key={name} className={styles.item} style={{ borderColor: `${LINEAR_COLOR}55` }}>
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Non-Linear */}
        <div className={styles.branch}>
          <div className={styles.branchLine} />
          <div className={styles.category} style={{ borderColor: NONLINEAR_COLOR, color: NONLINEAR_COLOR }}>
            非線性結構
          </div>
          <div className={styles.catLine} />
          <div className={styles.items}>
            {nonLinear.map((name) => (
              <div key={name} className={styles.item} style={{ borderColor: `${NONLINEAR_COLOR}55` }}>
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
