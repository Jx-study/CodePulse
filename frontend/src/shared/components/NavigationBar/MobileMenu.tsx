import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./MobileMenu.module.scss";
import Icon from "../Icon";
import Button from "../Button";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // ESC 鍵關閉 + 防止背景滾動
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // 路由改變時關閉菜單
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <nav
        className={styles.drawer}
        role="navigation"
        aria-label="移動端導航選單"
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>{t("navigation")}</h2>
          <Button
            variant="icon"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="關閉選單"
          >
            <Icon name="times" size="lg" />
          </Button>
        </div>

        <ul className={styles.navList}>
          <li>
            <Link
              to="/"
              className={location.pathname === "/" ? styles.active : ""}
            >
              <Icon name="home" size="md" />
              <span>{t("home")}</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard"
              className={
                location.pathname === "/dashboard" ? styles.active : ""
              }
            >
              <Icon name="chart-line" size="md" />
              <span>{t("dashboardLabel")}</span>
            </Link>
          </li>
          <li>
            <Link
              to="/explorer"
              className={location.pathname === "/explorer" ? styles.active : ""}
            >
              <Icon name="compass" size="md" />
              <span>{t("explorer")}</span>
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={location.pathname === "/about" ? styles.active : ""}
            >
              <Icon name="info-circle" size="md" />
              <span>{t("aboutUs")}</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default MobileMenu;
