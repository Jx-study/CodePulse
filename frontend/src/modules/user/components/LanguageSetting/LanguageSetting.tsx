import { useTranslation } from "react-i18next";
import styles from "./LanguageSetting.module.scss";
import Dropdown from "@/shared/components/Dropdown";
import Icon from "@/shared/components/Icon";

function LanguageSetting() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const languageOptions = [
    { key: "en", label: "English", icon: <Icon name="globe" size="sm" /> },
    { key: "zh-TW", label: "繁體中文", icon: <Icon name="globe" size="sm" /> },
    { key: "zh-CN", label: "简体中文", icon: <Icon name="globe" size="sm" /> },
  ];

  // 获取当前语言的显示文本
  const getCurrentLanguageLabel = () => {
    const currentLang = languageOptions.find(
      (lang) => lang.key === i18n.language,
    );
    return currentLang?.label || "English";
  };

  const handleLanguageChange = (key: string) => {
    changeLanguage(key);
  };

  return (
    <div className={styles.languageSetting}>
      <Dropdown
        trigger={
          <div className={styles.languageTrigger}>
            <Icon name="globe" size="md" />
            <span className={styles.currentLanguage}>
              {getCurrentLanguageLabel()}
            </span>
          </div>
        }
        items={languageOptions.map((lang) => ({
          ...lang,
          onClick: () => handleLanguageChange(lang.key),
        }))}
        placement="bottom-right"
        closeOnSelect={true}
        showChevron={true}
        aria-label="選擇語言"
      />
    </div>
  );
}

export default LanguageSetting;
