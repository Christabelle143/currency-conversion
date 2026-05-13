'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useRemittance } from '@/contexts/RemittanceContext';
import { formatCurrency, formatRate, formatDateTime } from '@/lib/formatCurrency';
import styles from './Wizard.module.scss';

export function Step3Receipt() {
  const { t, i18n } = useTranslation('remittance');
  const { quote, completedAt, isSubmitting, dispatch } = useRemittance();

  if (isSubmitting) {
    return (
      <div className={styles.submitting}>
        <div className={styles.spinner} />
        <p>{t('submitting')}</p>
      </div>
    );
  }

  if (!quote || !completedAt) return null;

  return (
    <>
      <div className={styles.successBanner}>
        <div className={styles.successRing}>✓</div>
        <h2 className={styles.receiptTitle}>{t('receipt_title')}</h2>
        <p className={styles.receiptSub}>{t('receipt_subtitle')}</p>
      </div>

      <div className={styles.receipt}>
        <div className={styles.receiptRow}>
          <span className={styles.receiptLabel}>{t('receipt_id')}</span>
          <span className={styles.receiptVal} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
            {quote.quoteId}
          </span>
        </div>
        <div className={styles.receiptRow}>
          <span className={styles.receiptLabel}>{t('receipt_date')}</span>
          <span className={styles.receiptVal}>{formatDateTime(completedAt, i18n.language)}</span>
        </div>

        <div className={styles.receiptDivider} />

        <div className={styles.receiptRow}>
          <span className={styles.receiptLabel}>{t('receipt_you_sent')}</span>
          <span className={styles.receiptVal}>
            {formatCurrency(quote.sendAmount, quote.sendCurrency, i18n.language)}
          </span>
        </div>
        <div className={styles.receiptRow}>
          <span className={styles.receiptLabel}>{t('receipt_fee')}</span>
          <span className={styles.receiptVal}>
            {formatCurrency(quote.fee, quote.sendCurrency, i18n.language)}
          </span>
        </div>
        <div className={styles.receiptRow}>
          <span className={styles.receiptLabel}>{t('receipt_rate')}</span>
          <span className={styles.receiptVal}>
            1 USD = {formatRate(quote.rate, quote.receiveCurrency, i18n.language)}{' '}
            {quote.receiveCurrency}
          </span>
        </div>

        <div className={styles.receiptDivider} />

        <div className={`${styles.receiptRow} ${styles.receiptHighlight}`}>
          <span className={styles.receiptLabel}>{t('receipt_they_receive')}</span>
          <span className={styles.receiptBigAmt}>
            {formatCurrency(quote.receiveAmount, quote.receiveCurrency, i18n.language)}
          </span>
        </div>

        <div className={styles.receiptActions}>
          <button
            className={styles.ghostBtn}
            style={{ flex: 1 }}
            onClick={() => dispatch({ type: 'RESET' })}
          >
            {t('start_new')}
          </button>
          <Link href="/dashboard" className={styles.linkBtn} style={{ flex: 1 }}>
            {t('view_dashboard')}
          </Link>
        </div>
      </div>
    </>
  );
}
