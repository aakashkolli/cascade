import { describe, it, expect, beforeEach } from 'vitest';
import { useTokenGraphStore } from '../../src/store/tokenGraphStore.ts';
import type { ImportResult } from '../../src/io/import/types.ts';

// ─── Shared fixture ───────────────────────────────────────────────────────────

function makeImportResult(): ImportResult {
  return {
    ok: true,
    tokens: [
      { id: 'color/brand/500', name: 'brand-500', group: 'brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] },
      { id: 'color/neutral/50', name: 'neutral-50', group: 'neutral', value: { type: 'hex', value: '#FAFAFA' }, tags: [] },
    ],
    edges: [],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('tokenGraphStore', () => {
  beforeEach(() => {
    useTokenGraphStore.getState().reset();
  });

  it('1. importSystem populates tokens and resolvedValues', () => {
    const result = makeImportResult();
    useTokenGraphStore.getState().importSystem(result);

    const { tokens, resolvedValues } = useTokenGraphStore.getState();
    expect(tokens.size).toBe(2);
    expect(tokens.has('color/brand/500')).toBe(true);
    expect(tokens.has('color/neutral/50')).toBe(true);
    expect(resolvedValues.size).toBe(2);
    expect(resolvedValues.get('color/brand/500')?.hex).toBe('#7C3AED');
    expect(resolvedValues.get('color/neutral/50')?.hex).toBe('#FAFAFA');
  });

  it('2. setTokenValue updates a token value', () => {
    useTokenGraphStore.getState().importSystem(makeImportResult());
    useTokenGraphStore.getState().setTokenValue('color/brand/500', { type: 'hex', value: '#FF0000' });

    const { tokens, resolvedValues } = useTokenGraphStore.getState();
    const token = tokens.get('color/brand/500');
    expect(token?.value).toEqual({ type: 'hex', value: '#FF0000' });
    expect(resolvedValues.get('color/brand/500')?.hex).toBe('#FF0000');
  });

  it('3. undo reverts setTokenValue; redo re-applies it', () => {
    useTokenGraphStore.getState().importSystem(makeImportResult());
    useTokenGraphStore.getState().setTokenValue('color/brand/500', { type: 'hex', value: '#FF0000' });

    useTokenGraphStore.getState().undo();
    expect(useTokenGraphStore.getState().resolvedValues.get('color/brand/500')?.hex).toBe('#7C3AED');

    useTokenGraphStore.getState().redo();
    expect(useTokenGraphStore.getState().resolvedValues.get('color/brand/500')?.hex).toBe('#FF0000');
  });

  it('4. importSystem resets undo history', () => {
    // Make a mutation so history is non-empty
    useTokenGraphStore.getState().importSystem(makeImportResult());
    useTokenGraphStore.getState().setTokenValue('color/brand/500', { type: 'hex', value: '#FF0000' });
    expect(useTokenGraphStore.getState().past.length).toBeGreaterThan(0);

    // importSystem replaces state and resets history
    useTokenGraphStore.getState().importSystem(makeImportResult());
    expect(useTokenGraphStore.getState().past.length).toBe(0);
    expect(useTokenGraphStore.getState().future.length).toBe(0);
  });

  it('5. serializeToHash returns non-empty string; loadFromHash restores token count', () => {
    useTokenGraphStore.getState().importSystem(makeImportResult());

    const hash = useTokenGraphStore.getState().serializeToHash();
    expect(hash.length).toBeGreaterThan(0);

    // Reset and reload from hash
    useTokenGraphStore.getState().reset();
    expect(useTokenGraphStore.getState().tokens.size).toBe(0);

    const ok = useTokenGraphStore.getState().loadFromHash(hash);
    expect(ok).toBe(true);
    expect(useTokenGraphStore.getState().tokens.size).toBe(2);
  });

  it('6. exportCSS returns a string starting with :root {', () => {
    useTokenGraphStore.getState().importSystem(makeImportResult());
    const css = useTokenGraphStore.getState().exportCSS();
    expect(css.startsWith(':root {')).toBe(true);
  });
});
