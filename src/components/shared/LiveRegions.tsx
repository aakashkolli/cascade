// src/components/shared/LiveRegions.tsx
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

// Module-level singleton — populated when <LiveRegions> mounts
const refs: {
  violation: RefObject<HTMLDivElement | null> | null;
  propagation: RefObject<HTMLDivElement | null> | null;
  error: RefObject<HTMLDivElement | null> | null;
} = { violation: null, propagation: null, error: null };

let violationTimer: ReturnType<typeof setTimeout> | null = null;

export function announceViolation(message: string): void {
  if (violationTimer) clearTimeout(violationTimer);
  violationTimer = setTimeout(() => {
    const el = refs.violation?.current;
    if (el) el.textContent = message;
  }, 300);
}

export function announceError(message: string): void {
  const el = refs.error?.current;
  if (el) el.textContent = message;
}

export function announcePropagation(message: string): void {
  const el = refs.propagation?.current;
  if (el) el.textContent = message;
}

// Styles for screen-reader-only visually hidden elements
const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

export function LiveRegions(): JSX.Element {
  const violationRef = useRef<HTMLDivElement>(null);
  const propagationRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refs.violation = violationRef;
    refs.propagation = propagationRef;
    refs.error = errorRef;
    return () => {
      refs.violation = null;
      refs.propagation = null;
      refs.error = null;
    };
  }, []);

  return (
    <>
      <div
        ref={violationRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={srOnly}
      />
      <div
        ref={propagationRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={srOnly}
      />
      <div
        ref={errorRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={srOnly}
      />
    </>
  );
}
