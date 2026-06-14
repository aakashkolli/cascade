import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { useTokenGraphStore } from '../../../src/store/tokenGraphStore';
import { ImportPanel } from '../../../src/components/import/ImportPanel';

const fixturePath = join(import.meta.dirname, '../../fixtures/sample-50-token-style-dictionary.json');
const validJSON = readFileSync(fixturePath, 'utf-8');

describe('ImportPanel', () => {
  beforeEach(() => {
    useTokenGraphStore.getState().reset();
  });

  it('dialog has role="dialog" and aria-modal="true"', () => {
    render(<ImportPanel onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('focus trap: Tab key 20 times keeps focus inside dialog', async () => {
    const user = userEvent.setup();
    render(<ImportPanel onClose={() => {}} />);
    const dialog = screen.getByTestId('import-panel');
    // Tab 20 times — focus must stay within the dialog
    for (let i = 0; i < 20; i++) {
      await user.tab();
    }
    // After 20 tabs, active element must still be inside the dialog
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('Escape key calls onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImportPanel onClose={onClose} />);
    // Focus the textarea first so Escape fires on a focused element inside the dialog
    screen.getByTestId('import-textarea').focus();
    await user.keyboard('[Escape]');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pasting valid JSON and clicking Import calls importSystem and closes', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImportPanel onClose={onClose} />);
    const textarea = screen.getByTestId('import-textarea');
    await user.click(textarea);
    await user.paste(validJSON);
    await user.click(screen.getByTestId('import-submit'));
    // importSystem should have been called — store should now have tokens
    expect(useTokenGraphStore.getState().tokens.size).toBeGreaterThan(0);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('pasting invalid JSON shows parse errors without closing', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImportPanel onClose={onClose} />);
    const textarea = screen.getByTestId('import-textarea');
    await user.click(textarea);
    await user.paste('{ this is not valid json }');
    await user.click(screen.getByTestId('import-submit'));
    expect(screen.getByTestId('parse-errors')).toBeDefined();
    expect(onClose).not.toHaveBeenCalled();
  });
});
