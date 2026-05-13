'use client';

import styles from './PageLoader.module.scss';

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading…' }: PageLoaderProps) {
  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label={message}>
      <div className={styles.inner}>
        <div className={styles.logoMark}>R</div>
        <div className={styles.spinner} />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
