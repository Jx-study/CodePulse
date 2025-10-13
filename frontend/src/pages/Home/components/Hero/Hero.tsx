import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import styles from './Hero.module.scss';
import PulseBackground from './PulseBackground';
import Demo from '../Demo/Demo';

function Hero() {
  const { t } = useTranslation();
  const pulseBackgroundRef = useRef();
  const ctaButtonRef = useRef();
  const heroRef = useRef();

  const handleHeroClick = (event) => {
    if (pulseBackgroundRef.current) {
      const heroElement = event.currentTarget;
      const rect = heroElement.getBoundingClientRect();
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
        <Link
          to="/explorer"
          className="cta-button"
          ref={ctaButtonRef}
          onMouseEnter={handleCtaHover}
          onMouseLeave={handleCtaLeave}
        >
          {t("hero.cta")}
        </Link>
      </div>
    </section>
  );
}

export default Hero;