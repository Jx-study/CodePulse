import { StatusConfig, DEFAULT_STATUS_CONFIG } from "@/types/statusConfig";
import styles from "./StatusLegend.module.scss";

interface StatusLegendProps {
  className?: string;
  /** Optional custom status configuration - 可選的自訂狀態配置 */
  statusConfig?: StatusConfig;
}

const StatusLegend = ({ className, statusConfig }: StatusLegendProps) => {
  // Use provided config or fall back to default
  const config = statusConfig ?? DEFAULT_STATUS_CONFIG;

  return (
    <div className={`${styles.legend} ${className || ""}`}>
      <div className={styles.items}>
        {config.statuses.map((status) => (
          <div key={status.key} className={styles.item}>
            <span
              className={styles.colorCircle}
              style={{ backgroundColor: status.color }}
            />
            <span className={styles.label}>{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusLegend;
