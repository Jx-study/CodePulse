import styles from './Footer.module.scss';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h2>CodePulse</h2>
          <p>{t('footer.tagline')}</p>
        </div>
        
        <div className={styles.footerSection}>
          <h4>{t('footer.resources.title')}</h4>
          <ul>
            <li><Link to="/guide">{t('footer.resources.guide')}</Link></li>
            <li><Link to="/faq">{t('footer.resources.faq')}</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h4>{t('footer.contact.title')}</h4>
          <ul>
            <li>
              <a
                href="https://github.com/Jx-study/CodePulse"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('footer.contact.github')}
              </a>
            </li>
            <li>
              <a
                href="mailto:codepulse112@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('footer.contact.support')}
              </a>
            </li>
            <li>
              <a
                href="https://forms.gle/i4ycZ9QrXQPVvCSBA"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('footer.contact.feedback')}
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}

export default Footer;
