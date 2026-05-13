export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { step2TimeoutCounter } from '@/lib/metrics';

export async function POST() {
  step2TimeoutCounter.inc({ reason: 'timer_expired' });
  return NextResponse.json({ ok: true });
}
