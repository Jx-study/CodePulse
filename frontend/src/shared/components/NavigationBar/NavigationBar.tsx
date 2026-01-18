import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavigationBar.module.scss';

function NavigationBar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className={styles.navigationBar}>
      <ul className={styles.navMenu}>
        <li>
          <Link
            to="/"
            className={location.pathname === "/" ? styles.active : ""}
          >
            {t("home")}
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? styles.active : ""}
          >
            {t("dashboardLabel")}
          </Link>
        </li>
        <li>
          <Link
            to="/explorer"
            className={location.pathname === "/explorer" ? styles.active : ""}
          >
            {t("explorer")}
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            className={location.pathname === "/about" ? styles.active : ""}
          >
            {t("aboutUs")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavigationBar;