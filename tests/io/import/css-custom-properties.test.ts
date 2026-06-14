import { describe, it, expect } from 'vitest';
import { parseCSSCustomProperties } from '../../../src/io/import/css-custom-properties.ts';

const SIMPLE_CSS = `
:root {
  --color-brand-500: #7C3AED;
  --color-brand-400: #A78BFA;
}
`;

const WITH_REFERENCE_CSS = `
:root {
  --color-brand-500: #7C3AED;
  --color-text-primary: var(--color-brand-500);
}
`;

const WITH_COMMENT_CSS = `
:root {
  /* brand palette */
  --color-base: #000000; /* black */
}
`;

const WITH_NON_COLOR_CSS = `
:root {
  --color-base: #000000;
  --spacing-sm: 4px;
}
`;

const WITH_HSL_CSS = `
:root {
  --color-brand: hsl(262, 83%, 58%);
}
`;

describe('parseCSSCustomProperties', () => {
  it('parses hex custom properties', () => {
    const result = parseCSSCustomProperties(SIMPLE_CSS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(2);
    const t = result.tokens.find((t) => t.id === 'color-brand-500');
    expect(t?.value).toEqual({ type: 'hex', value: '#7C3AED' });
    expect(t?.name).toBe('color-brand-500');
    expect(t?.group).toBe('');
  });

  it('creates reference token and edge for var(--name) values', () => {
    const result = parseCSSCustomProperties(WITH_REFERENCE_CSS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const ref = result.tokens.find((t) => t.id === 'color-text-primary');
    expect(ref?.value).toEqual({ type: 'reference', tokenId: 'color-brand-500' });
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toEqual({ from: 'color-brand-500', to: 'color-text-primary', type: 'reference' });
  });

  it('skips comments and non-color declarations', () => {
    const result = parseCSSCustomProperties(WITH_NON_COLOR_CSS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens).toHaveLength(1);
    expect(result.tokens[0]?.id).toBe('color-base');
  });

  it('strips inline comments from values', () => {
    const result = parseCSSCustomProperties(WITH_COMMENT_CSS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0]?.value).toEqual({ type: 'hex', value: '#000000' });
  });

  it('accepts hsl() values as hex-type tokens', () => {
    const result = parseCSSCustomProperties(WITH_HSL_CSS);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.tokens[0]?.value).toEqual({ type: 'hex', value: 'hsl(262, 83%, 58%)' });
  });

  it('returns error for reference to unknown property', () => {
    const css = ':root { --text: var(--unknown); }';
    const result = parseCSSCustomProperties(css);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors[0]?.message).toContain('unknown');
  });
});
