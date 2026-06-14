import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrefersReducedMotion } from '../../src/hooks/usePrefersReducedMotion.ts';

describe('usePrefersReducedMotion', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(typeof result.current).toBe('boolean');
  });

  it('returns false in test environment (happy-dom matchMedia default)', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });
});
