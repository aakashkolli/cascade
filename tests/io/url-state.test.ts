import { describe, it, expect } from 'vitest';
import { serialize, deserialize } from '../../src/io/url-state.ts';
import { applyImportResult } from '../../src/io/import/apply.ts';
import type { TokenSystemState } from '../../src/engine/types.ts';

function makeSimpleState(): TokenSystemState {
  return applyImportResult({
    ok: true,
    tokens: [
      { id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] },
      { id: 'color/text/primary', name: 'primary', group: 'color/text', value: { type: 'reference', tokenId: 'color/brand/500' }, tags: [] },
    ],
    edges: [{ from: 'color/brand/500', to: 'color/text/primary', type: 'reference' }],
  });
}

function makeContrastState(): TokenSystemState {
  return applyImportResult({
    ok: true,
    tokens: [
      { id: 'bg', name: 'bg', group: '', value: { type: 'hex', value: '#FFFFFF' }, tags: [] },
      { id: 'fg', name: 'fg', group: '', value: { type: 'hex', value: '#000000' }, tags: [] },
    ],
    edges: [{ from: 'bg', to: 'fg', type: 'contrast-pair' }],
  });
}

describe('serialize', () => {
  it('returns a string starting with v1:', () => {
    expect(serialize(makeSimpleState())).toMatch(/^v1:/);
  });

  it('produces a shorter string than raw JSON', () => {
    const state = makeSimpleState();
    const raw = JSON.stringify({ tokens: [...state.tokens.values()], edges: [...state.edgeMeta.entries()] });
    expect(serialize(state).length).toBeLessThan(raw.length);
  });
});

describe('deserialize', () => {
  it('returns null for an invalid hash', () => {
    expect(deserialize('not-valid')).toBeNull();
    expect(deserialize('')).toBeNull();
    expect(deserialize('v1:AAAA_invalid_compressed')).toBeNull();
  });

  it('restores tokens and edges after round-trip serialization', () => {
    const original = makeSimpleState();
    const hash = serialize(original);
    const restored = deserialize(hash);
    expect(restored).not.toBeNull();
    if (!restored) return;

    expect(restored.tokens.size).toBe(original.tokens.size);
    for (const [id, token] of original.tokens) {
      expect(restored.tokens.get(id)).toEqual(token);
    }
    expect(restored.edgeMeta.size).toBe(original.edgeMeta.size);
    for (const [key, type] of original.edgeMeta) {
      expect(restored.edgeMeta.get(key)).toBe(type);
    }
  });

  it('restores resolved values after deserialization', () => {
    const original = makeSimpleState();
    const restored = deserialize(serialize(original));
    expect(restored).not.toBeNull();
    if (!restored) return;
    expect(restored.resolvedValues.get('color/brand/500')?.hex).toBe('#7C3AED');
    expect(restored.resolvedValues.get('color/text/primary')?.hex).toBe('#7C3AED');
  });

  it('restores violations after deserialization', () => {
    const original = makeContrastState();
    expect(original.violations.size).toBe(1);
    const restored = deserialize(serialize(original));
    expect(restored).not.toBeNull();
    if (!restored) return;
    expect(restored.violations.size).toBe(1);
    const [, result] = [...restored.violations.entries()][0] ?? [];
    expect(result?.ratio).toBeCloseTo(21, 1);
  });

  it('round-trips 200 tokens with no data loss', () => {
    const tokens = [];
    const edges = [];
    for (let i = 0; i < 100; i++) {
      const hex = `#${i.toString(16).padStart(2, '0').repeat(3)}`;
      tokens.push({ id: `base/${i}`, name: String(i), group: 'base', value: { type: 'hex' as const, value: hex }, tags: [] });
    }
    for (let i = 0; i < 100; i++) {
      tokens.push({ id: `alias/${i}`, name: String(i), group: 'alias', value: { type: 'reference' as const, tokenId: `base/${i}` }, tags: [] });
      edges.push({ from: `base/${i}`, to: `alias/${i}`, type: 'reference' as const });
    }
    const original = applyImportResult({ ok: true, tokens, edges });
    const restored = deserialize(serialize(original));
    expect(restored).not.toBeNull();
    if (!restored) return;
    expect(restored.tokens.size).toBe(200);
    expect(restored.edgeMeta.size).toBe(100);
    for (const [id, token] of original.tokens) {
      expect(restored.tokens.get(id)).toEqual(token);
    }
    for (const [id, resolved] of original.resolvedValues) {
      expect(restored.resolvedValues.get(id)?.hex).toBe(resolved.hex);
    }
  });
});
