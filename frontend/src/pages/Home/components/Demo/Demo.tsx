import React, { useEffect, useState } from 'react';
import styles from './Demo.module.scss';
import { useTranslation } from 'react-i18next';

function Demo() {
  const [opacity, setOpacity] = useState(1);
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(prev => (prev === 1 ? 0.7 : 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.demo} id="demo">
      <div className='container'>
        <h2 className='section-title'>{t('demo_section.title')}</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>{t('demo_section.subtitle')}</p>
        
        <div className={styles.demoPreview}>
          <div className={styles.codeWindow}>
            <div className={styles.codeLine}>def bubble_sort(arr):</div>
            <div className={styles.codeLine}>    n = len(arr)</div>
            <div className={`${styles.codeLine} ${styles.executing}`}>    
              <div className={styles.breakpoint}></div>
              for i in range(n):  # ← {t('current_line')}
            </div>
            <div className={styles.codeLine}>        for j in range(0, n-i-1):</div>
            <div className={styles.codeLine}>            {'if arr[j] > arr[j+1]:'}</div>
            <div className={styles.codeLine}>                arr[j], arr[j+1] = arr[j+1], arr[j]</div>
            <div className={styles.codeLine}>    return arr</div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
            <strong>💡{t('demo_section.analysis')} ：</strong> {t('demo_section.analysis_text')}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Demo;
