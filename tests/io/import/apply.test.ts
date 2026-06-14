import { describe, it, expect } from 'vitest';
import { applyImportResult } from '../../../src/io/import/apply.ts';
import type { ImportResult } from '../../../src/io/import/types.ts';

describe('applyImportResult', () => {
  it('populates tokens from a successful import', () => {
    const result: ImportResult = {
      ok: true,
      tokens: [
        { id: 'color/base', name: 'base', group: 'color', value: { type: 'hex', value: '#FF0000' }, tags: [] },
      ],
      edges: [],
    };
    const state = applyImportResult(result);
    expect(state.tokens.size).toBe(1);
    expect(state.resolvedValues.get('color/base')?.hex).toBe('#FF0000');
  });

  it('resolves references after applying edges', () => {
    const result: ImportResult = {
      ok: true,
      tokens: [
        { id: 'color/base', name: 'base', group: 'color', value: { type: 'hex', value: '#0000FF' }, tags: [] },
        { id: 'color/alias', name: 'alias', group: 'color', value: { type: 'reference', tokenId: 'color/base' }, tags: [] },
      ],
      edges: [{ from: 'color/base', to: 'color/alias', type: 'reference' }],
    };
    const state = applyImportResult(result);
    expect(state.resolvedValues.get('color/alias')?.hex).toBe('#0000FF');
  });

  it('throws on a failed import result', () => {
    const result: ImportResult = { ok: false, errors: [{ line: 1, message: 'bad input' }] };
    expect(() => applyImportResult(result)).toThrow('Cannot apply failed import result');
  });

  it('throws when an edge references an unknown token', () => {
    const result: ImportResult = {
      ok: true,
      tokens: [{ id: 'color/base', name: 'base', group: 'color', value: { type: 'hex', value: '#FF0000' }, tags: [] }],
      edges: [{ from: 'color/base', to: 'color/nonexistent', type: 'reference' }],
    };
    expect(() => applyImportResult(result)).toThrow('unknown token');
  });

  it('throws when imported edges contain a cycle', () => {
    const result: ImportResult = {
      ok: true,
      tokens: [
        { id: 'a', name: 'a', group: '', value: { type: 'hex', value: '#000000' }, tags: [] },
        { id: 'b', name: 'b', group: '', value: { type: 'reference', tokenId: 'a' }, tags: [] },
      ],
      // Cycle: a→b and b→a
      edges: [
        { from: 'a', to: 'b', type: 'reference' },
        { from: 'b', to: 'a', type: 'reference' },
      ],
    };
    expect(() => applyImportResult(result)).toThrow('circular dependency');
  });
});
