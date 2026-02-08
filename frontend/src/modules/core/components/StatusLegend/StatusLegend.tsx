import { statusColorMap, Status } from "../../DataLogic/BaseElement";
import styles from "./StatusLegend.module.scss";

interface StatusLegendProps {
  className?: string;
}

const statusLabels: Record<Status, string> = {
  unfinished: "未完成",
  prepare: "準備中",
  target: "目標",
  complete: "完成",
  inactive: "未啟用",
};

const StatusLegend = ({ className }: StatusLegendProps) => {
  const statuses = Object.keys(statusColorMap) as Status[];

  return (
    <div className={`${styles.legend} ${className || ""}`}>
      <div className={styles.items}>
        {statuses.map((status) => (
          <div key={status} className={styles.item}>
            <span
              className={styles.colorCircle}
              style={{ backgroundColor: statusColorMap[status] }}
            />
            <span className={styles.label}>{statusLabels[status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusLegend;
