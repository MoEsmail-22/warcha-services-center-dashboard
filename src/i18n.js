import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    ns: ['common', 'nav', 'dashboard', 'bookings', 'quotes', 'services', 'reviews', 'settings'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      // Check URL path first (e.g., /en/dev → 'en'), then cookie, localStorage, etc.
      order: ['path', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
      lookupLocalStorage: 'warcha_lang',
      lookupCookie: 'warcha_lang',
      cookieMinutes: 525600,
      cookieDomain: '',
      // Extract language from the first URL segment
      lookupFromPathKey: 'lng',
    },
  });

export default i18n;
