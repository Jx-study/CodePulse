import Icon from "@/shared/components/Icon";
import styles from "./FormAlert.module.scss";

export type FormAlertType = "success" | "error" | "info";

interface FormAlertProps {
  type: FormAlertType;
  message: string;
  className?: string;
}

const iconMap: Record<FormAlertType, string> = {
  success: "check-circle",
  error: "exclamation-circle",
  info: "info-circle",
};

function FormAlert({ type, message, className }: FormAlertProps) {
  if (!message) return null;

  return (
    <div
      className={`${styles.alert} ${styles[type]}${className ? ` ${className}` : ""}`}
      role="alert"
    >
      <Icon name={iconMap[type]} size="sm" className={styles.icon} />
      <span>{message}</span>
    </div>
  );
}

export default FormAlert;
