import { bench, describe } from 'vitest';
import { parseStyleDictionary } from '../../../src/io/import/style-dictionary.ts';
import { parseFigmaTokens } from '../../../src/io/import/figma-tokens.ts';
import { applyImportResult } from '../../../src/io/import/apply.ts';

function buildSDFixture(n: number): string {
  const obj: Record<string, Record<string, { value: string; type: string }>> = {};
  for (let i = 0; i < n; i++) {
    const group = `palette${Math.floor(i / 10)}`;
    if (!obj[group]) obj[group] = {};
    const shade = i.toString(16).padStart(6, '0');
    (obj[group] as Record<string, { value: string; type: string }>)[`token${i}`] = {
      value: `#${shade.slice(0, 6)}`,
      type: 'color',
    };
  }
  return JSON.stringify(obj);
}

function buildFTFixture(n: number): string {
  const tokens: Record<string, { value: string; type: string }> = {};
  for (let i = 0; i < n; i++) {
    const shade = i.toString(16).padStart(6, '0');
    tokens[`token${i}`] = { value: `#${shade.slice(0, 6)}`, type: 'color' };
  }
  return JSON.stringify({ global: tokens });
}

const sd1000 = buildSDFixture(1000);
const ft1000 = buildFTFixture(1000);

describe('import benchmarks', () => {
  bench('parseStyleDictionary — 1000 tokens', () => {
    parseStyleDictionary(sd1000);
  });

  bench('parseFigmaTokens — 1000 tokens', () => {
    parseFigmaTokens(ft1000);
  });

  bench('parseFigmaTokens + applyImportResult — 1000 tokens (parse + propagation)', () => {
    const result = parseFigmaTokens(ft1000);
    if (result.ok) applyImportResult(result);
  });
});
