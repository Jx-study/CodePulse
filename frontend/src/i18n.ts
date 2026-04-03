import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh-TW',
    supportedLngs: ['en', 'zh-TW'],
    ns: ['common', 'home', 'auth', 'dashboard', 'tutorial', 'practice', 'about'],
    defaultNS: 'common',
    returnEmptyString: false,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => lng.startsWith('zh') ? 'zh-TW' : lng,
    },
  });

export default i18n;