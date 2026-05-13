'use client';

import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
import { I18nProvider } from './I18nProvider/I18nProvider';
import { LiveRatesProvider } from '@/contexts/LiveRatesContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary context="App">
      <I18nProvider>
        <ErrorBoundary context="LiveRates">
          <LiveRatesProvider>{children}</LiveRatesProvider>
        </ErrorBoundary>
      </I18nProvider>
    </ErrorBoundary>
  );
}
