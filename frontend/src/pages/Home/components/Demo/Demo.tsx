import styles from './Demo.module.scss';
import { useTranslation } from 'react-i18next';

function Demo() {
  const { t } = useTranslation('home');

  return (
    <section className={styles.demo} id="demo">
      <div className='container'>
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
          
          <div className={styles.analysisBox}>
            <strong>💡{t('demo_section.analysis')}：</strong> {t('demo_section.analysis_text')}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Demo;
