import { Counter, Registry } from 'prom-client';

declare global {
  // eslint-disable-next-line no-var
  var _promRegistry: Registry | undefined;
  // eslint-disable-next-line no-var
  var _step2TimeoutCounter: Counter | undefined;
}

if (!global._promRegistry) {
  global._promRegistry = new Registry();
}

if (!global._step2TimeoutCounter) {
  global._step2TimeoutCounter = new Counter({
    name: 'remittance_step2_timeout_total',
    help: 'Count of users who abandoned at Step 2 when the quote timer expired',
    labelNames: ['reason'],
    registers: [global._promRegistry],
  });
}

export const registry = global._promRegistry;
export const step2TimeoutCounter = global._step2TimeoutCounter;
