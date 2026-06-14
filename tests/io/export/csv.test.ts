import { describe, it, expect } from 'vitest';
import { exportCSV } from '../../../src/io/export/csv.ts';
import { applyImportResult } from '../../../src/io/import/apply.ts';

function stateWithContrastPair(): ReturnType<typeof applyImportResult> {
  return applyImportResult({
    ok: true,
    tokens: [
      { id: 'color/white', name: 'white', group: 'color', value: { type: 'hex', value: '#FFFFFF' }, tags: [] },
      { id: 'color/black', name: 'black', group: 'color', value: { type: 'hex', value: '#000000' }, tags: [] },
    ],
    edges: [
      { from: 'color/white', to: 'color/black', type: 'contrast-pair' },
    ],
  });
}

describe('exportCSV', () => {
  it('includes header row', () => {
    const state = applyImportResult({ ok: true, tokens: [], edges: [] });
    const output = exportCSV(state);
    expect(output.split('\n')[0]).toBe('foreground,background,ratio,level,aaPass,aaLargePass,aaaPass,aaaLargePass');
  });

  it('has one data row per contrast pair', () => {
    const state = stateWithContrastPair();
    const lines = exportCSV(state).split('\n').filter(Boolean);
    expect(lines).toHaveLength(2);
  });

  it('formats ratio to 2 decimal places', () => {
    const state = stateWithContrastPair();
    const dataLine = exportCSV(state).split('\n')[1] ?? '';
    const [, , ratio] = dataLine.split(',');
    expect(ratio).toBe('21.00');
  });

  it('sorts rows by ratio ascending (worst first)', () => {
    const state = applyImportResult({
      ok: true,
      tokens: [
        { id: 'white', name: 'white', group: '', value: { type: 'hex', value: '#FFFFFF' }, tags: [] },
        { id: 'black', name: 'black', group: '', value: { type: 'hex', value: '#000000' }, tags: [] },
        { id: 'gray', name: 'gray', group: '', value: { type: 'hex', value: '#777777' }, tags: [] },
      ],
      edges: [
        { from: 'white', to: 'black', type: 'contrast-pair' },
        { from: 'white', to: 'gray', type: 'contrast-pair' },
      ],
    });
    const lines = exportCSV(state).split('\n').filter(Boolean);
    expect(lines).toHaveLength(3);
    const grayLine = lines.find((l) => l.includes('gray')) ?? '';
    const blackLine = lines.find((l) => l.includes('black')) ?? '';
    const grayRatio = parseFloat(grayLine.split(',')[2] ?? '0');
    const blackRatio = parseFloat(blackLine.split(',')[2] ?? '0');
    expect(grayRatio).toBeLessThan(blackRatio);
    expect(lines.indexOf(grayLine)).toBeLessThan(lines.indexOf(blackLine));
  });
});
