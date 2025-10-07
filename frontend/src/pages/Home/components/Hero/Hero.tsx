import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Hero.module.scss';
import PulseBackground from './PulseBackground';
import Demo from '../Demo/Demo';
import { D3Canvas } from "../../../../modules/core/Render/D3Canvas";
import { Node } from "../../../../modules/core/DataLogic/Node";
import { Box } from "../../../../modules/core/DataLogic/Box";

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

  // test
  const n = new Node();
  n.id = "n1";
  n.moveTo(150, 120);
  n.radius = 32;
  n.setStatus("target");
  n.description = "我是圓形";

  const n2 = new Node();
  n2.id = "n2";
  n2.moveTo(300, 140);
  n2.radius = 32;
  n2.setStatus("target");
  n2.description = "我是圓形2";

  // n.addLink(n2);

  const b = new Box();
  b.id = "b1";
  b.moveTo(360, 220);
  b.width = 50;
  b.height = 50;
  b.setStatus("prepare");
  b.description = "我是矩形";

  

  return (
    <section 
      className={styles.hero} 
      id="home" 
      ref={heroRef}
      onClick={handleHeroClick}
    >
      {/* test */}
      <D3Canvas elements={[n, n2, b]} />;
      <PulseBackground ref={pulseBackgroundRef} />
      <div className={styles.heroContent}>
        <h1>{t('hero.title')}</h1>
        <h3>{t('hero.subtitle')}</h3>
        <p>
          {t('hero.description.main')}
          <br />
          {t('hero.description.sub')}
        </p>
        <a
          href="#demo"
          className='cta-button'
          ref={ctaButtonRef}
          onMouseEnter={handleCtaHover}
          onMouseLeave={handleCtaLeave}
        >
          {t('hero.cta')}
        </a>
        <div className={styles.demoContainer}>
          <Demo />
        </div>
      </div>
    </section>
  );
}

export default Hero;