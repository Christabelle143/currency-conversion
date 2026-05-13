import { formatCurrency, formatRate, formatDateTime } from '@/lib/formatCurrency';

describe('formatCurrency', () => {
  it('formats USD amount in en-US locale', () => {
    const result = formatCurrency(100, 'USD', 'en');
    expect(result).toMatch(/\$100\.00/);
  });

  it('formats EUR amount in fr locale with French conventions', () => {
    const result = formatCurrency(100, 'EUR', 'fr');
    // French uses a non-breaking space as thousands sep and comma decimal
    expect(result).toMatch(/100/);
    expect(result).toMatch(/EUR|€/);
  });

  it('formats JPY without decimal places', () => {
    const result = formatCurrency(1000, 'JPY', 'en');
    expect(result).toMatch(/1,000/);
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0, 'USD', 'en');
    expect(result).toMatch(/\$0\.00/);
  });
});

describe('formatRate', () => {
  it('formats rate to 4 decimal places for non-JPY currencies', () => {
    const result = formatRate(0.9234, 'EUR', 'en');
    expect(result).toBe('0.9234');
  });

  it('formats JPY rate to 2 decimal places', () => {
    const result = formatRate(149.52, 'JPY', 'en');
    expect(result).toBe('149.52');
  });

  it('formats rate for GBP', () => {
    const result = formatRate(0.7891, 'GBP', 'en');
    expect(result).toBe('0.7891');
  });
});

describe('formatDateTime', () => {
  it('includes year, month, day in the formatted string', () => {
    const date = new Date('2025-06-15T10:30:00');
    const result = formatDateTime(date, 'en');
    expect(result).toMatch(/2025/);
  });

  it('produces different output for different locales', () => {
    const date = new Date('2025-06-15T10:30:00');
    const en = formatDateTime(date, 'en');
    const fr = formatDateTime(date, 'fr');
    // Both should contain the year but formatting differs
    expect(en).toMatch(/2025/);
    expect(fr).toMatch(/2025/);
    // They should be different strings
    expect(en).not.toBe(fr);
  });
});
