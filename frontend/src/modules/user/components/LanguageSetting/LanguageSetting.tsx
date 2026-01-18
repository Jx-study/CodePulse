import { useTranslation } from 'react-i18next';
import styles from './LanguageSetting.module.scss';

function LanguageSetting() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.languageSetting}>
      <select 
        onChange={(e) => changeLanguage(e.target.value)} 
        value={i18n.language}
        className={styles.languageSelect}
      >
        <option value="en">English</option>
        <option value="zh-TW">繁體中文</option>
        <option value="zh-CN">简体中文</option>
      </select>
    </div>
  );
}

export default LanguageSetting;