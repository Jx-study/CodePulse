import { useTranslation } from "react-i18next";
import styles from "./DSDiagram.module.scss";

const LINEAR_COLOR = "#3b82f6";
const NONLINEAR_COLOR = "#10b981";

export default function DSDiagram() {
  const { t } = useTranslation("lessons");
  const linear = t("visuals.dsDiagram.linearItems", { returnObjects: true }) as string[];
  const nonLinear = t("visuals.dsDiagram.nonLinearItems", { returnObjects: true }) as string[];

  return (
    <div className={styles.wrapper}>
      {/* Root */}
      <div className={styles.root}>{t("visuals.dsDiagram.root")}</div>

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
            {t("visuals.dsDiagram.linear")}
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
            {t("visuals.dsDiagram.nonLinear")}
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
