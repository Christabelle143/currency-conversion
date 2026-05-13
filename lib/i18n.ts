import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';

export function initI18n() {
  if (i18n.isInitialized) return;

  const isClient = typeof window !== 'undefined';

  i18n
    .use(ChainedBackend)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr'],
      ns: ['common', 'dashboard', 'remittance'],
      defaultNS: 'common',
      backend: {
        backends: isClient ? [LocalStorageBackend, HttpBackend] : [HttpBackend],
        backendOptions: isClient
          ? [
              { expirationTime: 7 * 24 * 60 * 60 * 1000 },
              { loadPath: '/locales/{{lng}}/{{ns}}.json' },
            ]
          : [{ loadPath: '/locales/{{lng}}/{{ns}}.json' }],
      },
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
}

export default i18n;
