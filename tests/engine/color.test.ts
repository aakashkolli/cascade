import { describe, it, expect, assert } from 'vitest';
import { parseColor, rgbToHex, lighten, darken, alphaBlend } from '../../src/engine/color.ts';

describe('parseColor', () => {
  it('parses #RGB shorthand', () => {
    const c = parseColor('#abc');
    expect(c).not.toBeNull();
    assert(c !== null);
    expect(c.rgb).toEqual([0xaa, 0xbb, 0xcc]);
  });

  it('parses #RRGGBB', () => {
    const c = parseColor('#534AB7');
    expect(c).not.toBeNull();
    assert(c !== null);
    expect(c.rgb).toEqual([0x53, 0x4a, 0xb7]);
  });

  it('parses hsl()', () => {
    const c = parseColor('hsl(0, 100%, 50%)');
    expect(c).not.toBeNull();
    assert(c !== null);
    expect(c.rgb[0]).toBeCloseTo(255, 0);
    expect(c.rgb[1]).toBeCloseTo(0, 0);
    expect(c.rgb[2]).toBeCloseTo(0, 0);
  });

  it('parses oklch()', () => {
    const c = parseColor('oklch(0.5 0.1 30)');
    expect(c).not.toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(parseColor('notacolor')).toBeNull();
    expect(parseColor('#GGGGGG')).toBeNull();
    expect(parseColor('')).toBeNull();
  });

  it('populates luminance', () => {
    const white = parseColor('#ffffff');
    const black = parseColor('#000000');
    assert(white !== null);
    assert(black !== null);
    expect(white.luminance).toBeCloseTo(1, 2);
    expect(black.luminance).toBeCloseTo(0, 2);
  });
});

describe('rgbToHex', () => {
  it('produces uppercase #RRGGBB', () => {
    expect(rgbToHex([255, 255, 255])).toBe('#FFFFFF');
    expect(rgbToHex([0, 0, 0])).toBe('#000000');
    expect(rgbToHex([83, 74, 183])).toBe('#534AB7');
  });
});

describe('lighten', () => {
  it('increases lightness by the given amount', () => {
    const base = parseColor('#808080');
    assert(base !== null);
    const result = lighten(base.rgb as [number, number, number], 10);
    const lighter = parseColor(rgbToHex(result));
    assert(lighter !== null);
    expect(lighter.hsl[2]).toBeGreaterThan(base.hsl[2]);
  });

  it('clamps at 100% lightness', () => {
    const white = parseColor('#ffffff');
    assert(white !== null);
    const result = lighten(white.rgb as [number, number, number], 20);
    expect(rgbToHex(result)).toBe('#FFFFFF');
  });
});

describe('darken', () => {
  it('decreases lightness by the given amount', () => {
    const base = parseColor('#808080');
    assert(base !== null);
    const result = darken(base.rgb as [number, number, number], 10);
    const darker = parseColor(rgbToHex(result));
    assert(darker !== null);
    expect(darker.hsl[2]).toBeLessThan(base.hsl[2]);
  });
});

describe('alphaBlend', () => {
  it('blends fg with white at 50% alpha', () => {
    const black: [number, number, number] = [0, 0, 0];
    const result = alphaBlend(black, 50);
    expect(result[0]).toBeCloseTo(128, 0);
  });
});
