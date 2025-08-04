import React from 'react';
import styles from './Audience.module.scss';
import { useTranslation } from 'react-i18next';

// Import audience images
import beginnersImg from './assets/beginners.png';
import developersImg from './assets/developers.png';
import studentsImg from './assets/students.png';

function Audience() {
  const { t } = useTranslation();

  return (
    <section className={styles.audience} id="audience">
      <div className='container'>
        <h2 className='section-title'>{t('audience_section.title')}</h2>
        
        <div className={`${styles.audienceGrid} common-grid`}>
          <div className={`common-card ${styles.audienceCard}`}>
            <div className="audienceIcon">
              <img src={beginnersImg} alt="Beginners" />
            </div>
            <h3>{t('audience_section.beginners.title')}</h3>
            <p>{t('audience_section.beginners.description')}</p>
          </div>
          
          <div className={`common-card ${styles.audienceCard}`}>
            <div className="audienceIcon">
              <img src={developersImg} alt="Developers" />
            </div>
            <h3>{t('audience_section.developers.title')}</h3>
            <p>{t('audience_section.developers.description')}</p>
          </div>
          
          <div className={`common-card ${styles.audienceCard}`}>
            <div className="audienceIcon">
              <img src={studentsImg} alt="Students" />
            </div>
            <h3>{t('audience_section.students.title')}</h3>
            <p>{t('audience_section.students.description')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Audience;
