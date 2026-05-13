'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n } from '@/lib/i18n';
import { PageLoader } from '@/components/PageLoader/PageLoader';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      initI18n();
    } catch (err) {
      setError('Failed to initialise translations.');
      console.error('[i18n] init error:', err);
      return;
    }

    if (i18n.isInitialized) {
      setReady(true);
      return;
    }

    const onReady = () => setReady(true);
    const onFail = (err: unknown) => {
      console.error('[i18n] failed to load translations:', err);
      // Still mark ready so the app renders (keys will show as fallback)
      setReady(true);
    };

    i18n.on('initialized', onReady);
    i18n.on('failedLoading', onFail);

    return () => {
      i18n.off('initialized', onReady);
      i18n.off('failedLoading', onFail);
    };
  }, []);

  if (error) {
    // Non-fatal — render children anyway; keys will fall back to raw key strings
    console.warn('[I18nProvider] rendering without translations:', error);
  }

  return (
    <I18nextProvider i18n={i18n}>
      {ready ? children : <PageLoader message="Loading translations…" />}
    </I18nextProvider>
  );
}
