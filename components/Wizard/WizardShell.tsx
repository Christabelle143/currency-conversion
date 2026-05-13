'use client';

import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { RemittanceProvider, useRemittance } from '@/contexts/RemittanceContext';
import { Step1Quote } from './Step1Quote';
import { Step2Confirm } from './Step2Confirm';
import { Step3Receipt } from './Step3Receipt';
import styles from './Wizard.module.scss';

const STEPS = [1, 2, 3] as const;

function StepContent() {
  const { step } = useRemittance();
  if (step === 1) return <Step1Quote />;
  if (step === 2) return <Step2Confirm />;
  return <Step3Receipt />;
}

function Stepper() {
  const { t } = useTranslation('remittance');
  const { step } = useRemittance();

  const labels = [t('step1_title'), t('step2_title'), t('step3_title')];

  return (
    <div className={styles.stepper}>
      <div className={styles.stepTrack}>
        {STEPS.map((s) => (
          <div key={s} className={styles.stepItem}>
            <div
              className={`${styles.stepBubble} ${
                s < step
                  ? styles.bubbleDone
                  : s === step
                  ? styles.bubbleActive
                  : styles.bubblePending
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            {s < 3 && (
              <div className={`${styles.stepLine} ${s < step ? styles.stepLineDone : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className={styles.stepLabels}>
        {labels.map((label, i) => (
          <span
            key={i}
            className={`${styles.stepLabel} ${i + 1 === step ? styles.stepLabelActive : ''}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WizardShell() {
  return (
    <ErrorBoundary context="Wizard">
      <RemittanceProvider>
        <div className={styles.page}>
          <Stepper />
          <div className={styles.card}>
            <StepContent />
          </div>
        </div>
      </RemittanceProvider>
    </ErrorBoundary>
  );
}
