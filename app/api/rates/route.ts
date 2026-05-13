import { NextResponse } from 'next/server';
import { generateMockRates, CurrencyCode } from '@/lib/mockRates';

declare global {
  // eslint-disable-next-line no-var
  var _currentRates: Record<CurrencyCode, number> | undefined;
}

if (!global._currentRates) {
  global._currentRates = generateMockRates();
}

export async function GET() {
  global._currentRates = generateMockRates(global._currentRates);

  return NextResponse.json({
    base: 'USD',
    rates: global._currentRates,
    timestamp: Date.now(),
  });
}
