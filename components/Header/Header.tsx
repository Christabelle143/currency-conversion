'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import styles from './Header.module.scss';

export function Header() {
  const { t } = useTranslation('common');

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoMark}>R</span>
          {t('app_title')}
        </Link>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>
            {t('nav_dashboard')}
          </Link>
          <Link href="/remittance" className={styles.navLink}>
            {t('nav_send')}
          </Link>
        </nav>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
