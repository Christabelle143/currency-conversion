'use client';

import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.scss';

const LANGUAGES = [
  { code: 'en', labelKey: 'english' },
  { code: 'fr', labelKey: 'french' },
] as const;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');

  const handleChange = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18n-language', lng);
    }
  };

  return (
    <div className={styles.switcher}>
      <span className={styles.label}>{t('language')}:</span>
      <div className={styles.buttons}>
        {LANGUAGES.map(({ code, labelKey }) => (
          <button
            key={code}
            className={`${styles.btn} ${i18n.language === code ? styles.active : ''}`}
            onClick={() => handleChange(code)}
            aria-pressed={i18n.language === code}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
