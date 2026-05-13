export type CurrencyCode = 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

const BASE_RATES: Record<CurrencyCode, number> = {
  EUR: 0.9234,
  GBP: 0.7891,
  JPY: 149.52,
  CAD: 1.3612,
  AUD: 1.5423,
};

export function generateMockRates(
  previous?: Record<CurrencyCode, number>
): Record<CurrencyCode, number> {
  const result = {} as Record<CurrencyCode, number>;
  for (const currency of SUPPORTED_CURRENCIES) {
    const base = previous?.[currency] ?? BASE_RATES[currency];
    const drift = (Math.random() - 0.5) * 0.006 * base;
    result[currency] = Math.max(0.0001, base + drift);
  }
  return result;
}
