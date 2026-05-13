'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemittance } from '@/contexts/RemittanceContext';
import { formatCurrency, formatRate } from '@/lib/formatCurrency';
import styles from './Wizard.module.scss';

function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function Step2Confirm() {
  const { t, i18n } = useTranslation('remittance');
  const { quote, dispatch } = useRemittance();
  const [timeLeft, setTimeLeft] = useState(() =>
    quote ? Math.max(0, quote.expiresAt - Date.now()) : 0
  );
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    if (!quote) return;
    hasExpiredRef.current = false;

    const tick = () => {
      const remaining = Math.max(0, quote.expiresAt - Date.now());
      setTimeLeft(remaining);
      if (remaining === 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        fetch('/api/metrics/increment', { method: 'POST' }).catch(console.error);
        dispatch({ type: 'RESET' });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quote, dispatch]);

  if (!quote) return null;

  const pct = Math.min(100, (timeLeft / (5 * 60_000)) * 100);
  const timerCls =
    timeLeft <= 30_000
      ? styles.timerCritical
      : timeLeft <= 60_000
      ? styles.timerWarning
      : styles.timerNormal;
  const barColor =
    timeLeft <= 30_000 ? '#f87171' : timeLeft <= 60_000 ? '#fbbf24' : '#60a5fa';

  const handleConfirm = () => {
    if (timeLeft === 0) return;
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    setTimeout(() => dispatch({ type: 'SET_COMPLETED', payload: new Date() }), 1500);
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardHeaderTitle}>{t('step2_title')}</h2>
        <p className={styles.cardHeaderSub}>Your rate is locked — confirm before it expires</p>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.timerBlock}>
          <p className={styles.timerLabel}>{t('quote_expires_in')}</p>
          <div className={`${styles.timerDisplay} ${timerCls}`}>
            {formatCountdown(timeLeft)}
          </div>
          <div className={styles.timerBar}>
            <div
              className={styles.timerBarFill}
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        <div className={styles.breakdown}>
          <div className={styles.breakdownTitle}>Transfer Summary</div>
          <div className={styles.breakdownRow}>
            <span>You send</span>
            <span>{formatCurrency(quote.sendAmount, quote.sendCurrency, i18n.language)}</span>
          </div>
          <div className={`${styles.breakdownRow} ${styles.feeRow}`}>
            <span>− {t('fee')}</span>
            <span className={styles.feeVal}>
              − {formatCurrency(quote.fee, quote.sendCurrency, i18n.language)}
            </span>
          </div>
          <div className={styles.breakdownRow}>
            <span>{t('total_converted')}</span>
            <span>{formatCurrency(quote.netAmount, quote.sendCurrency, i18n.language)}</span>
          </div>
          <div className={styles.breakdownRow}>
            <span>{t('rate')}</span>
            <span className={styles.rateVal}>
              1 USD = {formatRate(quote.rate, quote.receiveCurrency, i18n.language)}{' '}
              {quote.receiveCurrency}
            </span>
          </div>
          <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
            <span>{t('receive_amount')}</span>
            <span className={styles.receiveAmt}>
              {formatCurrency(quote.receiveAmount, quote.receiveCurrency, i18n.language)}
            </span>
          </div>
          <div className={styles.quoteId}>{quote.quoteId}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.ghostBtn} onClick={() => dispatch({ type: 'RESET' })}>
            ← {t('back')}
          </button>
          <button
            className={styles.primaryBtn}
            onClick={handleConfirm}
            disabled={timeLeft === 0}
          >
            {t('confirm')} ✓
          </button>
        </div>
      </div>
    </>
  );
}
