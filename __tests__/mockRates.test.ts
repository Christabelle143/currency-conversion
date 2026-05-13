import { generateMockRates, SUPPORTED_CURRENCIES } from '@/lib/mockRates';

describe('generateMockRates', () => {
  it('returns rates for all 5 supported currencies', () => {
    const rates = generateMockRates();
    SUPPORTED_CURRENCIES.forEach((c) => {
      expect(rates[c]).toBeDefined();
      expect(typeof rates[c]).toBe('number');
    });
  });

  it('produces positive rates', () => {
    const rates = generateMockRates();
    SUPPORTED_CURRENCIES.forEach((c) => {
      expect(rates[c]).toBeGreaterThan(0);
    });
  });

  it('produces rates close to base values', () => {
    const rates = generateMockRates();
    expect(rates.EUR).toBeGreaterThan(0.85);
    expect(rates.EUR).toBeLessThan(1.0);
    expect(rates.JPY).toBeGreaterThan(130);
    expect(rates.JPY).toBeLessThan(170);
  });

  it('drifts from previous rates on subsequent calls', () => {
    const first = generateMockRates();
    const second = generateMockRates(first);
    // Rates should change slightly but remain positive
    SUPPORTED_CURRENCIES.forEach((c) => {
      expect(second[c]).toBeGreaterThan(0);
    });
    // At least one rate should have changed (statistically certain)
    const anyChanged = SUPPORTED_CURRENCIES.some((c) => first[c] !== second[c]);
    expect(anyChanged).toBe(true);
  });

  it('never returns zero or negative rates', () => {
    let rates = generateMockRates();
    for (let i = 0; i < 100; i++) {
      rates = generateMockRates(rates);
      SUPPORTED_CURRENCIES.forEach((c) => {
        expect(rates[c]).toBeGreaterThan(0);
      });
    }
  });
});
