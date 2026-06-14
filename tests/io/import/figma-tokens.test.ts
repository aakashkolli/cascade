import { describe, it, expect } from 'vitest';
import { parseFigmaTokens } from '../../../src/io/import/figma-tokens.ts';

const SIMPLE_FT = JSON.stringify({
  global: {
    color: {
      brand: {
        '500': { value: '#7C3AED', type: 'color' },
      },
    },
  },
});

const WITH_REFERENCE_FT = JSON.stringify({
  global: {
    color: {
      brand: { '500': { value: '#7C3AED', type: 'color' } },
      text: { primary: { value: '{color.brand.500}', type: 'color' } },
    },
  },
});

const MULTI_SET_FT = JSON.stringify({
  base: {
    color: { primary: { value: '#7C3AED', type: 'color' } },
  },
  semantic: {
    color: { action: { value: '{color.primary}', type: 'color' } },
  },
});

const WITH_METADATA_FT = JSON.stringify({
  $metadata: { tokenSetOrder: ['global'] },
  global: {
    color: { base: { value: '#000000', type: 'color' } },
  },
});

const DTCG_FT = JSON.stringify({
  global: {
    color: { brand: { '500': { $value: '#7C3AED', $type: 'color' } } },
  },
});

describe('parseFigmaTokens', () => {
  it('parses a simple hex token within a set, strips set name from ID', () => {
    const result = parseFigmaTokens(SIMPLE_FT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].id).toBe('color/brand/500');
    expect(result.tokens[0].value).toEqual({ type: 'hex', value: '#7C3AED' });
  });

  it('creates a reference edge for {dotted.path} values', () => {
    const result = parseFigmaTokens(WITH_REFERENCE_FT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({ from: 'color/brand/500', to: 'color/text/primary', type: 'reference' });
  });

  it('merges tokens from multiple token sets', () => {
    const result = parseFigmaTokens(MULTI_SET_FT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(2);
    const ids = result.tokens.map((t) => t.id);
    expect(ids).toContain('color/primary');
    expect(ids).toContain('color/action');
  });

  it('skips $metadata and other $-prefixed top-level keys', () => {
    const result = parseFigmaTokens(WITH_METADATA_FT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].id).toBe('color/base');
  });

  it('parses DTCG $value/$type syntax within a set', () => {
    const result = parseFigmaTokens(DTCG_FT);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0].value).toEqual({ type: 'hex', value: '#7C3AED' });
  });

  it('returns error for reference to unknown token', () => {
    const bad = JSON.stringify({ global: { color: { text: { primary: { value: '{color.unknown}', type: 'color' } } } } });
    const result = parseFigmaTokens(bad);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0].message).toContain('color.unknown');
  });

  it('returns error for invalid JSON', () => {
    expect(parseFigmaTokens('{bad').ok).toBe(false);
  });
});
