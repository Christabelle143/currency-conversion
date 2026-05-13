'use client';

import React, { createContext, useContext, useReducer } from 'react';
import { CurrencyCode } from '@/lib/mockRates';

export interface QuoteData {
  quoteId: string;
  sendAmount: number;
  sendCurrency: string;
  receiveCurrency: CurrencyCode;
  fee: number;
  rate: number;
  netAmount: number;
  receiveAmount: number;
  expiresAt: number;
}

export type WizardStep = 1 | 2 | 3;

interface RemittanceState {
  step: WizardStep;
  quote: QuoteData | null;
  isSubmitting: boolean;
  completedAt: Date | null;
}

type RemittanceAction =
  | { type: 'SET_QUOTE'; payload: QuoteData }
  | { type: 'ADVANCE'; payload: WizardStep }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_COMPLETED'; payload: Date }
  | { type: 'RESET' };

const initialState: RemittanceState = {
  step: 1,
  quote: null,
  isSubmitting: false,
  completedAt: null,
};

function reducer(state: RemittanceState, action: RemittanceAction): RemittanceState {
  switch (action.type) {
    case 'SET_QUOTE':
      return { ...state, quote: action.payload };
    case 'ADVANCE':
      return { ...state, step: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_COMPLETED':
      return { ...state, step: 3, isSubmitting: false, completedAt: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface RemittanceContextValue extends RemittanceState {
  dispatch: React.Dispatch<RemittanceAction>;
}

const RemittanceContext = createContext<RemittanceContextValue | null>(null);

export function RemittanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <RemittanceContext.Provider value={{ ...state, dispatch }}>
      {children}
    </RemittanceContext.Provider>
  );
}

export function useRemittance() {
  const ctx = useContext(RemittanceContext);
  if (!ctx) throw new Error('useRemittance must be used within RemittanceProvider');
  return ctx;
}
