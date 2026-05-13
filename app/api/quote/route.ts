import { NextResponse } from 'next/server';
import { generateMockRates, CurrencyCode } from '@/lib/mockRates';

declare global {
  // eslint-disable-next-line no-var
  var _quoteRates: Record<CurrencyCode, number> | undefined;
}

if (!global._quoteRates) {
  global._quoteRates = generateMockRates();
}

const FIXED_FEE = 2.0;
const QUOTE_TTL_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json();
  const { sendAmount, receiveCurrency } = body as {
    sendAmount: number;
    receiveCurrency: CurrencyCode;
  };

  global._quoteRates = generateMockRates(global._quoteRates);
  const rate = global._quoteRates[receiveCurrency];

  if (!rate) {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
  }

  const netAmount = sendAmount - FIXED_FEE;
  const receiveAmount = netAmount * rate;
  const expiresAt = Date.now() + QUOTE_TTL_MS;

  return NextResponse.json({
    quoteId: `QT-${Date.now()}`,
    sendAmount,
    sendCurrency: 'USD',
    receiveCurrency,
    fee: FIXED_FEE,
    rate,
    netAmount,
    receiveAmount,
    expiresAt,
  });
}
