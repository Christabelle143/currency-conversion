'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemittance } from '@/contexts/RemittanceContext';
import { useLiveRates } from '@/contexts/LiveRatesContext';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/lib/mockRates';
import { formatCurrency, formatRate } from '@/lib/formatCurrency';
import styles from './Wizard.module.scss';

const FIXED_FEE = 2.0;

export function Step1Quote() {
  const { t, i18n } = useTranslation('remittance');
  const { dispatch } = useRemittance();
  const { rates } = useLiveRates();

  const [sendAmount, setSendAmount] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState<CurrencyCode>('EUR');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const amount = parseFloat(sendAmount) || 0;
  const rate = rates[receiveCurrency] ?? 0;
  const netAmount = amount - FIXED_FEE;
  const receiveAmount = netAmount > 0 ? netAmount * rate : 0;
  const isValid = amount > FIXED_FEE && rate > 0;

  const handleProceed = async () => {
    if (!isValid) return;
    setIsFetching(true);
    setFetchError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendAmount: amount, receiveCurrency }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Server error (${res.status})`);
      const quote = await res.json();
      dispatch({ type: 'SET_QUOTE', payload: quote });
      dispatch({ type: 'ADVANCE', payload: 2 });
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : 'Failed to get quote. Please try again.';
      setFetchError(msg);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardHeaderTitle}>{t('step1_title')}</h2>
        <p className={styles.cardHeaderSub}>Live rates update every 10 seconds</p>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('send_amount')}</label>
          <div className={styles.amountWrap}>
            <span className={styles.prefix}>$</span>
            <input
              type="number"
              className={styles.input}
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder="0.00"
              min="2.01"
              step="0.01"
              autoFocus
            />
            <span className={styles.suffix}>USD</span>
          </div>
          {amount > 0 && amount <= FIXED_FEE && (
            <p className={styles.error}>⚠ {t('min_amount')}</p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{t('receive_currency')}</label>
          <select
            className={styles.select}
            value={receiveCurrency}
            onChange={(e) => setReceiveCurrency(e.target.value as CurrencyCode)}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c} — {getCurrencyName(c, i18n.language)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.breakdown}>
          <div className={styles.breakdownTitle}>Quote Summary</div>
          {isValid ? (
            <>
              <div className={styles.breakdownRow}>
                <span>You send</span>
                <span>{formatCurrency(amount, 'USD', i18n.language)}</span>
              </div>
              <div className={`${styles.breakdownRow} ${styles.feeRow}`}>
                <span>− {t('fee')}</span>
                <span className={styles.feeVal}>
                  − {formatCurrency(FIXED_FEE, 'USD', i18n.language)}
                </span>
              </div>
              <div className={styles.breakdownRow}>
                <span>{t('total_converted')}</span>
                <span>{formatCurrency(netAmount, 'USD', i18n.language)}</span>
              </div>
              <div className={styles.breakdownRow}>
                <span>{t('rate')}</span>
                <span className={styles.rateVal}>
                  1 USD = {formatRate(rate, receiveCurrency, i18n.language)} {receiveCurrency}
                </span>
              </div>
              <div className={`${styles.breakdownRow} ${styles.totalRow}`}>
                <span>{t('receive_amount')}</span>
                <span className={styles.receiveAmt}>
                  {formatCurrency(receiveAmount, receiveCurrency, i18n.language)}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.breakdownEmpty}>{t('enter_amount')}</div>
          )}
        </div>

        {fetchError && (
          <p className={styles.error} role="alert">⚠ {fetchError}</p>
        )}

        <button
          className={styles.primaryBtn}
          onClick={handleProceed}
          disabled={!isValid || isFetching}
          type="button"
        >
          {isFetching ? 'Getting quote…' : `${t('proceed')} →`}
        </button>
      </div>
    </>
  );
}

function getCurrencyName(currency: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(currency) ?? currency;
  } catch {
    return currency;
  }
}
