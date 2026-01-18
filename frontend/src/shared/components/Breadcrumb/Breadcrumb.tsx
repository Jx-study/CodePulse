import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { BreadcrumbItem, BreadcrumbProps } from "@/types";
import styles from "./Breadcrumb.module.scss";
import Icon from "../Icon";

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  showBackButton = true,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/dashboard");
  };

  const handleItemClick = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <nav className={styles.breadcrumb} aria-label="breadcrumb">
      {showBackButton && (
        <button
          className={styles.backButton}
          onClick={handleBackClick}
          aria-label={t("breadcrumb.backToDashboard")}
        >
          <span className={styles.backIcon}>
            <Icon name="arrow-left" size="sm" />
          </span>
          <span className={styles.backText}>{t("breadcrumb.dashboard")}</span>
        </button>
      )}

      {items.length > 0 && (
        <div className={styles.breadcrumbList}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className={styles.separator}>/</span>}
              <span
                className={`${styles.breadcrumbItem} ${
                  index === items.length - 1 ? styles.current : ""
                } ${item.path ? styles.clickable : ""}`}
                onClick={() => item.path && handleItemClick(item.path)}
              >
                {item.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Breadcrumb;
