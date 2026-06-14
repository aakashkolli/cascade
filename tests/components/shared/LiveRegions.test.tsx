// tests/components/shared/LiveRegions.test.tsx
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LiveRegions, announceError, announceViolation, announcePropagation } from '../../../src/components/shared/LiveRegions';

describe('LiveRegions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('announceError immediately sets alert region textContent', () => {
    render(<LiveRegions />);
    act(() => {
      announceError('parse failed');
    });
    const alert = document.querySelector('[role="alert"]');
    expect(alert?.textContent).toBe('parse failed');
  });

  it('announceViolation is debounced: rapid calls result in one update after 300ms', () => {
    render(<LiveRegions />);
    act(() => {
      announceViolation('1 violation');
      announceViolation('2 violations');
      announceViolation('3 violations');
    });
    // Before timer fires, textContent should still be empty
    const status = document.querySelector('[role="status"]');
    expect(status?.textContent).toBe('');
    // Advance timer past debounce
    act(() => { vi.advanceTimersByTime(300); });
    expect(status?.textContent).toBe('3 violations');
  });

  it('announcePropagation immediately sets propagation status region', () => {
    render(<LiveRegions />);
    act(() => {
      announcePropagation('5 tokens updated');
    });
    // There are two [role="status"] elements — propagation is the second one
    const statuses = document.querySelectorAll('[role="status"]');
    expect(statuses[1]?.textContent).toBe('5 tokens updated');
  });

  it('renders three live regions: two role=status and one role=alert', () => {
    render(<LiveRegions />);
    expect(document.querySelectorAll('[role="status"]').length).toBe(2);
    expect(document.querySelectorAll('[role="alert"]').length).toBe(1);
  });
});
