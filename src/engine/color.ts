import type { RGB, HSL, OKLCH } from './types.ts';
import { relativeLuminance } from './contrast.ts';

export interface ParsedColor {
  readonly hex: string;
  readonly rgb: RGB;
  readonly hsl: HSL;
  readonly oklch: OKLCH;
  readonly luminance: number;
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

export function parseColor(input: string): ParsedColor | null {
  const s = input.trim();
  if (!s) return null;

  const hex3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(s);
  if (hex3) {
    const r = parseInt(hex3[1] + hex3[1], 16);
    const g = parseInt(hex3[2] + hex3[2], 16);
    const b = parseInt(hex3[3] + hex3[3], 16);
    return fromRgb(r, g, b);
  }

  const hex6 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(s);
  if (hex6) {
    const r = parseInt(hex6[1], 16);
    const g = parseInt(hex6[2], 16);
    const b = parseInt(hex6[3], 16);
    return fromRgb(r, g, b);
  }

  const hslMatch = /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i.exec(s);
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const sat = parseFloat(hslMatch[2]);
    const l = parseFloat(hslMatch[3]);
    const [r, g, b] = hslToRgb([h, sat, l]);
    return fromRgb(r, g, b);
  }

  const oklchMatch = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/i.exec(s);
  if (oklchMatch) {
    const L = parseFloat(oklchMatch[1]);
    const C = parseFloat(oklchMatch[2]);
    const H = parseFloat(oklchMatch[3]);
    const [r, g, b] = oklchToRgb([L, C, H]);
    return fromRgb(r, g, b);
  }

  return null;
}

function fromRgb(r: number, g: number, b: number): ParsedColor {
  const rgb: RGB = [r, g, b];
  const hsl = rgbToHsl(rgb);
  const oklch = rgbToOklch(rgb);
  const lum = relativeLuminance(r, g, b);
  return { hex: rgbToHex(rgb), rgb, hsl, oklch, luminance: lum };
}

// ─── Conversions ──────────────────────────────────────────────────────────────

export function rgbToHex(rgb: RGB): string {
  return (
    '#' +
    Array.from(rgb)
      .map((c) => Math.round(c).toString(16).padStart(2, '0').toUpperCase())
      .join('')
  );
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl[0] / 360;
  const s = hsl[1] / 100;
  const l = hsl[2] / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number): number => {
    const tt = ((t % 1) + 1) % 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(h + 1 / 3) * 255),
    Math.round(hue2rgb(h) * 255),
    Math.round(hue2rgb(h - 1 / 3) * 255),
  ];
}

// OKLCH ↔ RGB via linear sRGB and OKLab
// Matrices from https://bottosson.github.io/posts/oklab/
const M1 = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];
const M2 = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];
const M1inv = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];
const M2inv = [
  [1.0, 0.3963377774, 0.2158037573],
  [1.0, -0.1055613458, -0.0638541728],
  [1.0, -0.0894841775, -1.2914855480],
];

function srgbLinearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function srgbDelinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function mat3mul(m: number[][], v: number[]): number[] {
  return m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
}

export function rgbToOklch(rgb: RGB): OKLCH {
  const lin = [rgb[0], rgb[1], rgb[2]].map((c) => srgbLinearize(c / 255));
  const lms = mat3mul(M1, lin).map((x) => Math.cbrt(Math.max(0, x)));
  const [L, a, b] = mat3mul(M2, lms);
  const C = Math.sqrt(a * a + b * b);
  const H = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}

export function oklchToRgb(oklch: OKLCH): RGB {
  const [L, C, H] = oklch;
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const lms_ = mat3mul(M2inv, [L, a, b]);
  const lms = lms_.map((x) => x * x * x);
  const lin = mat3mul(M1inv, lms);
  return lin.map((c) =>
    Math.round(Math.min(1, Math.max(0, srgbDelinearize(c))) * 255)
  ) as unknown as RGB;
}

// ─── Computed functions ───────────────────────────────────────────────────────

export function lighten(rgb: [number, number, number], amount: number): [number, number, number] {
  const hsl = rgbToHsl(rgb);
  return hslToRgb([hsl[0], hsl[1], Math.min(100, hsl[2] + amount)]) as [number, number, number];
}

export function darken(rgb: [number, number, number], amount: number): [number, number, number] {
  const hsl = rgbToHsl(rgb);
  return hslToRgb([hsl[0], hsl[1], Math.max(0, hsl[2] - amount)]) as [number, number, number];
}

/** Blend rgb with white at `alpha`% opacity (simulates transparency on white). */
export function alphaBlend(rgb: [number, number, number], alpha: number): [number, number, number] {
  const a = Math.min(100, Math.max(0, alpha)) / 100;
  return [
    Math.round(rgb[0] * a + 255 * (1 - a)),
    Math.round(rgb[1] * a + 255 * (1 - a)),
    Math.round(rgb[2] * a + 255 * (1 - a)),
  ];
}
