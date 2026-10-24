import { useTranslation } from "react-i18next";
import { StatusConfig, DEFAULT_STATUS_CONFIG } from "@/types/statusConfig";
import styles from "./StatusLegend.module.scss";

interface StatusLegendProps {
  className?: string;
  /** Optional custom status configuration - 可選的自訂狀態配置 */
  statusConfig?: StatusConfig;
}

const StatusLegend = ({ className, statusConfig }: StatusLegendProps) => {
  const config = statusConfig ?? DEFAULT_STATUS_CONFIG;
  const { t } = useTranslation(config.i18nNs);

  const getLabel = (label: string) => (config.i18nNs ? t(label) : label);

  return (
    <div className={`${styles.legend} ${className || ""}`}>
      <div className={styles.items}>
        {config.statuses.map((status) => (
          <div key={status.key} className={styles.item}>
            <span
              className={styles.colorCircle}
              style={{ backgroundColor: status.color }}
            />
            <span className={styles.label}>{getLabel(status.label)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusLegend;
