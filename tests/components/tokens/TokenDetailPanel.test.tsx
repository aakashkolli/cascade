import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { parseStyleDictionary } from '../../../src/io/import/style-dictionary';
import { useTokenGraphStore } from '../../../src/store/tokenGraphStore';
import { TokenDetailPanel } from '../../../src/components/tokens/TokenDetailPanel';

const fixturePath = join(import.meta.dirname, '../../fixtures/sample-50-token-style-dictionary.json');

function importFixture() {
  const json = readFileSync(fixturePath, 'utf-8');
  const result = parseStyleDictionary(json);
  act(() => { useTokenGraphStore.getState().importSystem(result); });
}

function getFirstHexTokenId(): string {
  const store = useTokenGraphStore.getState();
  for (const [id, token] of store.tokens) {
    if (token.value.type === 'hex') return id;
  }
  throw new Error('No hex token found in fixture');
}

describe('TokenDetailPanel', () => {
  beforeEach(() => {
    useTokenGraphStore.getState().reset();
  });

  it('renders the token name in the heading', () => {
    importFixture();
    const tokenId = getFirstHexTokenId();
    render(<TokenDetailPanel tokenId={tokenId} onClose={() => {}} />);
    const heading = screen.getByTestId('detail-panel-heading');
    expect(heading.textContent).toBeTruthy();
  });

  it('heading receives focus on mount (tokenId change)', async () => {
    importFixture();
    const tokenId = getFirstHexTokenId();
    render(<TokenDetailPanel tokenId={tokenId} onClose={() => {}} />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('detail-panel-heading'));
    });
  });

  it('Escape key calls onClose', async () => {
    const user = userEvent.setup();
    importFixture();
    const tokenId = getFirstHexTokenId();
    const onClose = vi.fn();
    render(<TokenDetailPanel tokenId={tokenId} onClose={onClose} />);
    // Wait for heading to receive focus (auto-focus on mount)
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('detail-panel-heading'));
    });
    await user.keyboard('[Escape]');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders ColorPicker for a hex token', () => {
    importFixture();
    const tokenId = getFirstHexTokenId();
    render(<TokenDetailPanel tokenId={tokenId} onClose={() => {}} />);
    expect(screen.getByTestId('color-picker')).toBeDefined();
  });

  it('ContrastPairs section is rendered', () => {
    importFixture();
    const tokenId = getFirstHexTokenId();
    render(<TokenDetailPanel tokenId={tokenId} onClose={() => {}} />);
    expect(screen.getByRole('region', { name: 'Contrast pairs' })).toBeDefined();
  });
});
