import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState, useRef } from 'react';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStyleDictionary } from '../../../src/io/import/style-dictionary';
import { useTokenGraphStore } from '../../../src/store/tokenGraphStore';
import { TokensView } from '../../../src/components/tokens/TokensView';
import type { TokenId } from '../../../src/engine/types';

const fixturePath = join(import.meta.dirname, '../../fixtures/sample-50-token-style-dictionary.json');
function importFixture() {
  const json = readFileSync(fixturePath, 'utf-8');
  const result = parseStyleDictionary(json);
  act(() => { useTokenGraphStore.getState().importSystem(result); });
}

/** Stateful wrapper that mirrors what Layout does, so TokensView has full behaviour. */
function TokensViewHarness({ onImportClick }: { onImportClick: () => void }) {
  const [selectedId, setSelectedId] = useState<TokenId | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function handleSelect(id: TokenId, el: HTMLElement) {
    triggerRef.current = el;
    setSelectedId(id);
  }

  function handleClose() {
    setSelectedId(null);
    triggerRef.current?.focus();
  }

  return (
    <TokensView
      onImportClick={onImportClick}
      selectedId={selectedId}
      onSelect={handleSelect}
      onClose={handleClose}
    />
  );
}

describe('TokensView', () => {
  beforeEach(() => {
    useTokenGraphStore.getState().reset();
  });

  it('shows EmptyState when no tokens loaded', () => {
    render(
      <TokensView
        onImportClick={() => {}}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId('empty-state')).toBeDefined();
  });

  it('shows TokenList after importing tokens', () => {
    importFixture();
    render(
      <TokensView
        onImportClick={() => {}}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId('token-list')).toBeDefined();
  });

  it('clicking a token row opens the detail panel', async () => {
    const user = userEvent.setup();
    importFixture();
    render(<TokensViewHarness onImportClick={() => {}} />);
    const rows = document.querySelectorAll('button[data-testid^="token-"]');
    await user.click(rows[0] as HTMLElement);
    expect(screen.getByTestId('detail-panel')).toBeDefined();
  });

  it('Escape in detail panel closes it and returns focus to the token row', async () => {
    const user = userEvent.setup();
    importFixture();
    render(<TokensViewHarness onImportClick={() => {}} />);
    const rows = document.querySelectorAll('button[data-testid^="token-"]');
    const firstRow = rows[0] as HTMLElement;
    await user.click(firstRow);
    // Detail panel should be open and heading should have focus
    await waitFor(() => {
      expect(screen.getByTestId('detail-panel')).toBeDefined();
    });
    await user.keyboard('[Escape]');
    // Detail panel should be closed
    expect(screen.queryByTestId('detail-panel')).toBeNull();
    // Focus should return to the token row
    expect(document.activeElement).toBe(firstRow);
  });
});
