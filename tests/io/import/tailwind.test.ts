import { describe, it, expect } from 'vitest';
import { parseTailwind } from '../../../src/io/import/tailwind.ts';

describe('parseTailwind', () => {
  it('parses a flat colors object', () => {
    const input = JSON.stringify({ brand: { '500': '#7C3AED', '400': '#A78BFA' } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(2);
    expect(result.edges).toHaveLength(0);
    const t = result.tokens.find((t) => t.id === 'brand/500');
    expect(t?.value).toEqual({ type: 'hex', value: '#7C3AED' });
    expect(t?.name).toBe('500');
    expect(t?.group).toBe('brand');
  });

  it('unwraps { colors: {...} } wrapper', () => {
    const input = JSON.stringify({ colors: { brand: { '500': '#7C3AED' } } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0].id).toBe('brand/500');
  });

  it('unwraps { theme: { colors: {...} } } wrapper', () => {
    const input = JSON.stringify({ theme: { colors: { brand: { '500': '#7C3AED' } } } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0].id).toBe('brand/500');
  });

  it('normalizes hex to uppercase', () => {
    const input = JSON.stringify({ brand: { '500': '#7c3aed' } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0].value).toEqual({ type: 'hex', value: '#7C3AED' });
  });

  it('accepts #RGB shorthand hex', () => {
    const input = JSON.stringify({ brand: { base: '#F0F' } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0].value).toEqual({ type: 'hex', value: '#F0F' });
  });

  it('skips non-string leaf values silently', () => {
    const input = JSON.stringify({ brand: { '500': '#7C3AED', DEFAULT: null } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
  });

  it('returns error for non-hex string values', () => {
    const input = JSON.stringify({ brand: { '500': 'notahex' } });
    const result = parseTailwind(input);
    expect(result.ok).toBe(false);
  });

  it('returns error for invalid JSON', () => {
    expect(parseTailwind('bad').ok).toBe(false);
  });
});
