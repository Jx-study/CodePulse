import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import NavigationBar from "../NavigationBar/NavigationBar";
import MobileMenu from "../NavigationBar/MobileMenu";
import Icon from "../Icon";
import Button from "../Button";
import LanguageSetting from "@/modules/user/components/LanguageSetting/LanguageSetting";
import UserStatus from "@/modules/user/components/UserStatus/UserStatus";
import logo from "/images/codePulse_logo.png";

function MainHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        <div className={styles.leftSection}>
          <Button
            variant="icon"
            className={styles.hamburgerButton}
            onClick={toggleMobileMenu}
            aria-label="打開導航選單"
            aria-expanded={isMobileMenuOpen}
          >
            <Icon name={isMobileMenuOpen ? "times" : "bars"} size="lg" />
          </Button>

          <div className={styles.logo}>
            <Link to="/">
              <img src={logo} alt="CodePulse Logo" />
            </Link>
          </div>
        </div>

        <NavigationBar />

        <div className={styles.rightSection}>
          <LanguageSetting />
          <UserStatus />
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}

export default MainHeader;
