import { describe, it, expect } from 'vitest';
import { exportStyleDictionary } from '../../../src/io/export/style-dictionary.ts';
import { applyImportResult } from '../../../src/io/import/apply.ts';
import { parseStyleDictionary } from '../../../src/io/import/style-dictionary.ts';

describe('exportStyleDictionary', () => {
  it('exports a hex token as nested SD JSON', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [{ id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] }],
      edges: [],
    });
    const output = exportStyleDictionary(state);
    const parsed = JSON.parse(output) as unknown;
    expect(parsed).toMatchObject({
      color: { brand: { '500': { value: '#7C3AED', type: 'color' } } },
    });
  });

  it('exports a reference token as {dotted.path}', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [
        { id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] },
        { id: 'color/text/primary', name: 'primary', group: 'color/text', value: { type: 'reference', tokenId: 'color/brand/500' }, tags: [] },
      ],
      edges: [{ from: 'color/brand/500', to: 'color/text/primary', type: 'reference' }],
    });
    const output = exportStyleDictionary(state);
    const parsed = JSON.parse(output) as unknown;
    expect(parsed).toMatchObject({
      color: { text: { primary: { value: '{color.brand.500}', type: 'color' } } },
    });
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
    const output = exportStyleDictionary(state);
    const parsed = JSON.parse(output) as Record<string, unknown>;
    const colorNode = parsed['color'] as Record<string, unknown>;
    const lightNode = colorNode['light'] as Record<string, unknown>;
    expect(typeof lightNode['value']).toBe('string');
    expect((lightNode['value'] as string).startsWith('#')).toBe(true);
  });

  it('round-trips a Style Dictionary import', () => {
    const sd = JSON.stringify({
      color: {
        brand: { '500': { value: '#7C3AED', type: 'color' } },
        text: { primary: { value: '{color.brand.500}', type: 'color' } },
      },
    });
    const importResult = parseStyleDictionary(sd);
    expect(importResult.ok).toBe(true);
    if (!importResult.ok) return;
    const state = applyImportResult(importResult);
    const exported = exportStyleDictionary(state);
    const re_imported = parseStyleDictionary(exported);
    expect(re_imported.ok).toBe(true);
    if (!re_imported.ok) return;
    expect(re_imported.tokens).toHaveLength(2);
  });
});
