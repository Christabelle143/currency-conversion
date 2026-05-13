'use client';

import React, { Component, ReactNode } from 'react';
import styles from './ErrorBoundary.module.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Label to show in the error header */
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.context ? ` / ${this.props.context}` : ''}]`, error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <DefaultFallback
          error={this.state.error}
          context={this.props.context}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

function DefaultFallback({
  error,
  context,
  onReset,
}: {
  error: Error | null;
  context?: string;
  onReset: () => void;
}) {
  return (
    <div className={styles.wrapper} role="alert">
      <div className={styles.card}>
        <div className={styles.iconRow}>
          <span className={styles.icon}>⚠</span>
        </div>
        <h2 className={styles.title}>Something went wrong</h2>
        {context && <p className={styles.context}>in {context}</p>}
        {error?.message && (
          <pre className={styles.message}>{error.message}</pre>
        )}
        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={onReset} type="button">
            Try again
          </button>
          <button
            className={styles.reloadBtn}
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
