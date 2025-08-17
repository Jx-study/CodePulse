import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Hero.module.scss';
import PulseBackground from './PulseBackground';

function Hero() {
  const { t } = useTranslation();
  const pulseBackgroundRef = useRef();

  const handleHeroClick = (event) => {
    if (pulseBackgroundRef.current) {
      const heroElement = event.currentTarget;
      const rect = heroElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      pulseBackgroundRef.current.addParticleAt(x, y);
    }
  };

  return (
    <section className={styles.hero} id="home" onClick={handleHeroClick}>
      <PulseBackground ref={pulseBackgroundRef} />
      <div className={styles.heroContent}>
        <h1>{t('hero.title')}</h1>
        <h3>{t('hero.subtitle')}</h3>
        <p>
          {t('hero.description.main')} 
          <br />
          {t('hero.description.sub')}
        </p>
        <a href="#demo" className='cta-button'>{t('hero.cta')}</a>
      </div>
    </section>
  );
}

export default Hero;