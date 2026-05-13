'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/lib/mockRates';

export type RateDirection = 'up' | 'down' | 'neutral';

export interface RateEntry {
  currency: CurrencyCode;
  rate: number;
  direction: RateDirection;
}

interface LiveRatesContextValue {
  rates: Record<CurrencyCode, number>;
  rateEntries: RateEntry[];
  lastUpdated: Date | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  retry: () => void;
}

const EMPTY_RATES = {} as Record<CurrencyCode, number>;
const POLL_INTERVAL = 10_000;
const MAX_CONSECUTIVE_FAILURES = 3;

const LiveRatesContext = createContext<LiveRatesContextValue>({
  rates: EMPTY_RATES,
  rateEntries: [],
  lastUpdated: null,
  isLoading: true,
  isUpdating: false,
  error: null,
  retry: () => {},
});

export function LiveRatesProvider({ children }: { children: React.ReactNode }) {
  const [rateEntries, setRateEntries] = useState<RateEntry[]>([]);
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(EMPTY_RATES);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prevRatesRef = useRef<Record<CurrencyCode, number>>(EMPTY_RATES);
  const failureCountRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRates = useCallback(async () => {
    setIsUpdating(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);

      const res = await fetch('/api/rates', { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: { rates: Record<CurrencyCode, number>; timestamp: number } = await res.json();
      const newRates = data.rates;
      const prev = prevRatesRef.current;

      const entries: RateEntry[] = SUPPORTED_CURRENCIES.map((currency) => ({
        currency,
        rate: newRates[currency],
        direction:
          prev[currency] === undefined
            ? 'neutral'
            : newRates[currency] > prev[currency]
            ? 'up'
            : newRates[currency] < prev[currency]
            ? 'down'
            : 'neutral',
      }));

      prevRatesRef.current = newRates;
      setRates(newRates);
      setRateEntries(entries);
      setLastUpdated(new Date(data.timestamp));
      setIsLoading(false);
      setError(null);
      failureCountRef.current = 0;
    } catch (err) {
      failureCountRef.current += 1;
      const msg =
        err instanceof Error && err.name === 'AbortError'
          ? 'Rate request timed out.'
          : 'Could not load exchange rates.';

      console.error('[LiveRates] fetch failed:', err);

      if (failureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
        setError(msg);
        setIsLoading(false);
      }
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    fetchRates();
    intervalRef.current = setInterval(fetchRates, POLL_INTERVAL);
  }, [fetchRates]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startPolling();
    return stopPolling;
  }, [startPolling, stopPolling]);

  const retry = useCallback(() => {
    failureCountRef.current = 0;
    setError(null);
    setIsLoading(true);
    stopPolling();
    startPolling();
  }, [startPolling, stopPolling]);

  return (
    <LiveRatesContext.Provider
      value={{ rates, rateEntries, lastUpdated, isLoading, isUpdating, error, retry }}
    >
      {children}
    </LiveRatesContext.Provider>
  );
}

export function useLiveRates() {
  return useContext(LiveRatesContext);
}
