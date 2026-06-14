import { describe, it, expect } from 'vitest';
import { exportCSSCustomProperties } from '../../../src/io/export/css-custom-properties.ts';
import { applyImportResult } from '../../../src/io/import/apply.ts';

describe('exportCSSCustomProperties', () => {
  it('exports hex token as CSS custom property', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [{ id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] }],
      edges: [],
    });
    const output = exportCSSCustomProperties(state);
    expect(output).toContain('--color-brand-500: #7C3AED;');
    expect(output).toContain(':root {');
    expect(output).toContain('}');
  });

  it('exports reference token as var(--ref)', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [
        { id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] },
        { id: 'color/text/primary', name: 'primary', group: 'color/text', value: { type: 'reference', tokenId: 'color/brand/500' }, tags: [] },
      ],
      edges: [{ from: 'color/brand/500', to: 'color/text/primary', type: 'reference' }],
    });
    const output = exportCSSCustomProperties(state);
    expect(output).toContain('--color-text-primary: var(--color-brand-500);');
  });

  it('exports computed tokens as their resolved hex', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [
        { id: 'color/base', name: 'base', group: 'color', value: { type: 'hex', value: '#7C3AED' }, tags: [] },
        {
          id: 'color/light',
          name: 'light',
          group: 'color',
          value: { type: 'computed', fn: 'lighten', args: [{ type: 'tokenRef', tokenId: 'color/base' }, { type: 'number', value: 20 }] },
          tags: [],
        },
      ],
      edges: [{ from: 'color/base', to: 'color/light', type: 'computed' }],
    });
    const output = exportCSSCustomProperties(state);
    expect(output).toMatch(/--color-light: #[0-9A-Fa-f]{6};/);
  });

  it('sorts properties alphabetically', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [
        { id: 'z/token', name: 'token', group: 'z', value: { type: 'hex', value: '#000000' }, tags: [] },
        { id: 'a/token', name: 'token', group: 'a', value: { type: 'hex', value: '#FFFFFF' }, tags: [] },
      ],
      edges: [],
    });
    const output = exportCSSCustomProperties(state);
    const aPos = output.indexOf('--a-token');
    const zPos = output.indexOf('--z-token');
    expect(aPos).toBeLessThan(zPos);
  });
});
