import { describe, it, expect } from 'vitest';
import { exportFigmaTokens } from '../../../src/io/export/figma-tokens.ts';
import { applyImportResult } from '../../../src/io/import/apply.ts';
import { parseFigmaTokens } from '../../../src/io/import/figma-tokens.ts';

describe('exportFigmaTokens', () => {
  it('exports hex token wrapped in global set using $value/$type', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [{ id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] }],
      edges: [],
    });
    const output = exportFigmaTokens(state);
    const parsed = JSON.parse(output) as { global: unknown };
    expect(parsed).toHaveProperty('global');
    expect(parsed.global).toMatchObject({
      color: { brand: { '500': { $value: '#7C3AED', $type: 'color' } } },
    });
  });

  it('exports reference token as {dotted.path}', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [
        { id: 'color/brand/500', name: '500', group: 'color/brand', value: { type: 'hex', value: '#7C3AED' }, tags: [] },
        { id: 'color/text/primary', name: 'primary', group: 'color/text', value: { type: 'reference', tokenId: 'color/brand/500' }, tags: [] },
      ],
      edges: [{ from: 'color/brand/500', to: 'color/text/primary', type: 'reference' }],
    });
    const output = exportFigmaTokens(state);
    const parsed = JSON.parse(output) as { global: { color: { text: { primary: { $value: string } } } } };
    expect(parsed.global.color.text.primary.$value).toBe('{color.brand.500}');
  });

  it('round-trips a Figma Tokens import', () => {
    const ft = JSON.stringify({
      global: {
        color: {
          brand: { '500': { value: '#7C3AED', type: 'color' } },
          text: { primary: { value: '{color.brand.500}', type: 'color' } },
        },
      },
    });
    const importResult = parseFigmaTokens(ft);
    expect(importResult.ok).toBe(true);
    if (!importResult.ok) return;
    const state = applyImportResult(importResult);
    const exported = exportFigmaTokens(state);
    const re_imported = parseFigmaTokens(exported);
    expect(re_imported.ok).toBe(true);
    if (!re_imported.ok) return;
    expect(re_imported.tokens).toHaveLength(2);
  });
});
