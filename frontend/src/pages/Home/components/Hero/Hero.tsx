import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./Hero.module.scss";
import PulseBackground from "./PulseBackground";
import Demo from "../Demo/Demo";
import Button from "@/shared/components/Button";

function Hero() {
  const { t } = useTranslation();
  const pulseBackgroundRef = useRef<any>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const handleHeroClick = (event: React.MouseEvent) => {
    if (pulseBackgroundRef.current && heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      pulseBackgroundRef.current.addWanderingParticle(x, y);
    }
  };

  const handleCtaHover = () => {
    if (pulseBackgroundRef.current && ctaButtonRef.current && heroRef.current) {
      const heroRect = heroRef.current.getBoundingClientRect();
      const ctaRect = ctaButtonRef.current.getBoundingClientRect();

      const targetX = ctaRect.left + ctaRect.width / 2 - heroRect.left;
      const targetY = ctaRect.top + ctaRect.height / 2 - heroRect.top;

      pulseBackgroundRef.current.attractParticles(targetX, targetY);
    }
  };

  const handleCtaLeave = () => {
    if (pulseBackgroundRef.current) {
      pulseBackgroundRef.current.resetParticles();
    }
  };

  return (
    <section
      className={styles.hero}
      id="home"
      ref={heroRef}
      onClick={handleHeroClick}
    >
      <PulseBackground ref={pulseBackgroundRef} />
      <div className={styles.heroContent}>
        <h1>{t("hero.title")}</h1>
        <h3>{t("hero.subtitle")}</h3>
        <p>
          {t("hero.description.main")}
          <br />
          {t("hero.description.sub")}
        </p>

        <div className={styles.demoContainer}>
          <Demo />
        </div>
        <Button
          variant="primary"
          size="lg"
          as={Link}
          to="/explorer"
          ref={ctaButtonRef}
          onMouseEnter={handleCtaHover}
          onMouseLeave={handleCtaLeave}
        >
          {t("hero.cta")}
        </Button>
      </div>
    </section>
  );
}

export default Hero;
