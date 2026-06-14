import { describe, it, expect } from 'vitest';
import { parseStyleDictionary } from '../../../src/io/import/style-dictionary.ts';

const SIMPLE_SD = JSON.stringify({
  color: {
    brand: {
      '500': { value: '#7C3AED', type: 'color' },
    },
  },
});

const WITH_REFERENCE_SD = JSON.stringify({
  color: {
    brand: { '500': { value: '#7C3AED', type: 'color' } },
    text: { primary: { value: '{color.brand.500}', type: 'color' } },
  },
});

const DTCG_SD = JSON.stringify({
  color: {
    brand: { '500': { $value: '#7C3AED', $type: 'color' } },
  },
});

const NON_COLOR_SKIP_SD = JSON.stringify({
  spacing: { sm: { value: '4px', type: 'dimension' } },
  color: { base: { value: '#000000', type: 'color' } },
});

const UNKNOWN_REF_SD = JSON.stringify({
  color: {
    text: { primary: { value: '{color.brand.500}', type: 'color' } },
  },
});

describe('parseStyleDictionary', () => {
  it('parses a simple hex token', () => {
    const result = parseStyleDictionary(SIMPLE_SD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
    const t = result.tokens[0];
    expect(t.id).toBe('color/brand/500');
    expect(t.name).toBe('500');
    expect(t.group).toBe('color/brand');
    expect(t.value).toEqual({ type: 'hex', value: '#7C3AED' });
  });

  it('parses DTCG $value/$type syntax', () => {
    const result = parseStyleDictionary(DTCG_SD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0]?.value).toEqual({ type: 'hex', value: '#7C3AED' });
  });

  it('creates a reference token and edge for {dotted.path} values', () => {
    const result = parseStyleDictionary(WITH_REFERENCE_SD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(2);
    const ref = result.tokens.find((t) => t.id === 'color/text/primary');
    expect(ref?.value).toEqual({ type: 'reference', tokenId: 'color/brand/500' });
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({ from: 'color/brand/500', to: 'color/text/primary', type: 'reference' });
  });

  it('preserves description when present', () => {
    const input = JSON.stringify({ color: { base: { value: '#000', type: 'color', description: 'Black' } } });
    const result = parseStyleDictionary(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0]?.description).toBe('Black');
  });

  it('skips non-color type tokens', () => {
    const result = parseStyleDictionary(NON_COLOR_SKIP_SD);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0]?.id).toBe('color/base');
  });

  it('returns error for reference to unknown token', () => {
    const result = parseStyleDictionary(UNKNOWN_REF_SD);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]?.message).toContain('color.brand.500');
  });

  it('returns error for invalid JSON', () => {
    const result = parseStyleDictionary('not json {');
    expect(result.ok).toBe(false);
  });

  it('skips $-prefixed top-level keys like $metadata', () => {
    const input = JSON.stringify({
      $metadata: { tokenSetOrder: ['global'] },
      color: { base: { value: '#000000', type: 'color' } },
    });
    const result = parseStyleDictionary(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0].id).toBe('color/base');
  });
});
