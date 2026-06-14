import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../../../src/components/layout/Header';
import { useTokenGraphStore } from '../../../src/store/tokenGraphStore';

describe('Header', () => {
  beforeEach(() => {
    useTokenGraphStore.getState().reset();
  });

  it('shows "0 violations" when store is empty', () => {
    render(<Header onImportClick={() => {}} currentView="tokens" onViewChange={vi.fn()} />);
    expect(screen.getByTestId('violation-count').textContent).toContain('0');
    expect(screen.getByTestId('violation-count').textContent).toContain('violations');
  });

  it('clicking Import button calls onImportClick', async () => {
    const user = userEvent.setup();
    const onImportClick = vi.fn();
    render(<Header onImportClick={onImportClick} currentView="tokens" onViewChange={vi.fn()} />);
    await user.click(screen.getByTestId('import-button'));
    expect(onImportClick).toHaveBeenCalledOnce();
  });

  it('renders three view tabs', () => {
    render(<Header onImportClick={() => {}} currentView="tokens" onViewChange={vi.fn()} />);
    expect(screen.getByTestId('tab-tokens')).toBeDefined();
    expect(screen.getByTestId('tab-graph')).toBeDefined();
    expect(screen.getByTestId('tab-audit')).toBeDefined();
  });

  it('clicking Audit tab calls onViewChange with "audit"', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<Header onImportClick={() => {}} currentView="tokens" onViewChange={onViewChange} />);
    const auditTab = screen.getByTestId('tab-audit');
    expect(auditTab.getAttribute('aria-selected')).toBe('false');
    await user.click(auditTab);
    expect(onViewChange).toHaveBeenCalledWith('audit');
  });
});
