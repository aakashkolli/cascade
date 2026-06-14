import { describe, it, expect } from 'vitest';
import { contrastRatio, wcagLevel, computeContrastResult } from '../../src/engine/contrast.ts';
import { REFERENCE_PAIRS } from '../reference-pairs.ts';

describe('contrastRatio — WCAG reference pairs', () => {
  for (const pair of REFERENCE_PAIRS) {
    it(pair.description, () => {
      const actual = contrastRatio(pair.fg, pair.bg);
      expect(actual).toBeCloseTo(pair.ratio, 1);
    });
  }
});

describe('wcagLevel', () => {
  it('returns AAA for ratio >= 7', () => { expect(wcagLevel(7.0)).toBe('AAA'); });
  it('returns AA for 4.5 <= ratio < 7', () => { expect(wcagLevel(4.5)).toBe('AA'); });
  it('returns AA-large for 3.0 <= ratio < 4.5', () => { expect(wcagLevel(3.0)).toBe('AA-large'); });
  it('returns fail for ratio < 3', () => { expect(wcagLevel(2.99)).toBe('fail'); });
});

describe('computeContrastResult', () => {
  it('computes all four boolean pass fields', () => {
    const result = computeContrastResult('fg', 'bg', [0, 0, 0], [255, 255, 255]);
    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.aaPass).toBe(true);
    expect(result.aaLargePass).toBe(true);
    expect(result.aaaPass).toBe(true);
    expect(result.aaaLargePass).toBe(true);
    expect(result.level).toBe('AAA');
  });

  it('correctly classifies a fail', () => {
    const result = computeContrastResult('fg', 'bg', [255, 165, 0], [255, 255, 255]);
    expect(result.aaPass).toBe(false);
    expect(result.aaLargePass).toBe(false);
    expect(result.level).toBe('fail');
  });
});
