'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { useLiveRates, RateEntry, RateDirection } from '@/contexts/LiveRatesContext';
import { formatRate, formatTime } from '@/lib/formatCurrency';
import styles from './RateDashboard.module.scss';

type FlashMap = Record<string, RateDirection | ''>;

const CURRENCY_META: Record<string, { flag: string; color: string }> = {
  EUR: { flag: '🇪🇺', color: '#003399' },
  GBP: { flag: '🇬🇧', color: '#cf101a' },
  JPY: { flag: '🇯🇵', color: '#bc002d' },
  CAD: { flag: '🇨🇦', color: '#d52b1e' },
  AUD: { flag: '🇦🇺', color: '#00457c' },
};

const SKELETON_ROWS = 5;

function TableSkeleton() {
  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Currency</th>
            <th className={styles.center}>1 USD =</th>
            <th className={styles.right}>Change</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} className={styles.row}>
              <td>
                <div className={styles.currencyCell}>
                  <span className={`${styles.skeleton} ${styles.skeletonFlag}`} />
                  <div>
                    <span className={`${styles.skeleton} ${styles.skeletonCode}`} />
                    <span className={`${styles.skeleton} ${styles.skeletonName}`} />
                  </div>
                </div>
              </td>
              <td className={styles.center}>
                <span className={`${styles.skeleton} ${styles.skeletonRate}`} />
              </td>
              <td className={styles.right}>
                <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RateErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className={styles.errorCard}>
      <span className={styles.errorIcon}>⚠</span>
      <p className={styles.errorMsg}>{message}</p>
      <button className={styles.retryBtn} onClick={onRetry} type="button">
        Retry
      </button>
    </div>
  );
}

function DashboardInner() {
  const { t, i18n } = useTranslation('dashboard');
  const { rateEntries, lastUpdated, isLoading, isUpdating, error, retry } = useLiveRates();
  const [flashMap, setFlashMap] = useState<FlashMap>({});

  useEffect(() => {
    if (rateEntries.length === 0) return;
    const newFlash: FlashMap = {};
    rateEntries.forEach(({ currency, direction }) => {
      if (direction !== 'neutral') newFlash[currency] = direction;
    });
    if (Object.keys(newFlash).length > 0) setFlashMap(newFlash);
  }, [rateEntries]);

  const handleAnimationEnd = (currency: string) => {
    setFlashMap((prev) => ({ ...prev, [currency]: '' }));
  };

  const rowClass = (currency: string) => {
    const f = flashMap[currency];
    if (f === 'up') return `${styles.row} ${styles.flashGreen}`;
    if (f === 'down') return `${styles.row} ${styles.flashRed}`;
    return styles.row;
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <span className={`${styles.liveDot} ${isUpdating ? styles.liveDotPulse : error ? styles.liveDotError : ''}`} />
              {error ? 'Error' : isUpdating ? t('updating') : t('live')}
            </div>
            <h1 className={styles.heroTitle}>{t('title')}</h1>
            <p className={styles.heroSub}>{t('subtitle')}</p>
          </div>
          {lastUpdated && !error && (
            <div className={styles.heroRight}>
              <p className={styles.updatedLabel}>{t('last_updated')}</p>
              <p className={styles.updatedTime}>{formatTime(lastUpdated, i18n.language)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {error ? (
          <RateErrorCard message={error} onRetry={retry} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('currency')}</th>
                  <th className={styles.center}>1 USD =</th>
                  <th className={styles.right}>{t('change')}</th>
                </tr>
              </thead>
              <tbody>
                {rateEntries.map(({ currency, rate, direction }) => (
                  <tr
                    key={currency}
                    className={rowClass(currency)}
                    onAnimationEnd={() => handleAnimationEnd(currency)}
                  >
                    <td>
                      <div className={styles.currencyCell}>
                        <span className={styles.flag}>{CURRENCY_META[currency]?.flag}</span>
                        <div
                          className={styles.colorDot}
                          style={{ background: CURRENCY_META[currency]?.color }}
                        />
                        <div>
                          <span className={styles.code}>{currency}</span>
                          <span className={styles.name}>
                            {getCurrencyName(currency, i18n.language)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.center}>
                      <span className={styles.rate}>
                        {formatRate(rate, currency, i18n.language)}
                      </span>
                      <span className={styles.rateCcy}>{currency}</span>
                    </td>
                    <td className={styles.right}>
                      <DirectionChip direction={direction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.cta}>
          <Link href="/remittance" className={styles.ctaBtn}>
            {t('send_money')} <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RateDashboard() {
  return (
    <ErrorBoundary context="RateDashboard">
      <DashboardInner />
    </ErrorBoundary>
  );
}

function DirectionChip({ direction }: { direction: RateDirection }) {
  if (direction === 'up')
    return <span className={`${styles.chip} ${styles.chipUp}`}>▲ Up</span>;
  if (direction === 'down')
    return <span className={`${styles.chip} ${styles.chipDown}`}>▼ Down</span>;
  return <span className={`${styles.chip} ${styles.chipFlat}`}>— Flat</span>;
}

function getCurrencyName(currency: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(currency) ?? currency;
  } catch {
    return currency;
  }
}
