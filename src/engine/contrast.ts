import type { RGB, WCAGLevel, ContrastResult, TokenId } from './types.ts';

/** IEC 61966-2-1 piecewise linearization of one 0–255 sRGB channel. */
function linearize(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

/** WCAG 2.1 relative luminance from linear-light sRGB. */
export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * WCAG 2.1 contrast ratio.
 * Result is (lighter + 0.05) / (darker + 0.05), always >= 1.
 */
export function contrastRatio(fg: RGB, bg: RGB): number {
  const L1 = relativeLuminance(fg[0], fg[1], fg[2]);
  const L2 = relativeLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Map a contrast ratio to the highest WCAG level achieved. */
export function wcagLevel(ratio: number): WCAGLevel {
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3.0) return 'AA-large';
  return 'fail';
}

/** Compute all WCAG pass/fail fields for a foreground/background token pair. */
export function computeContrastResult(
  foregroundId: TokenId,
  backgroundId: TokenId,
  fg: RGB,
  bg: RGB
): ContrastResult {
  const ratio = contrastRatio(fg, bg);
  return {
    foregroundId,
    backgroundId,
    ratio,
    level: wcagLevel(ratio),
    aaPass: ratio >= 4.5,
    aaLargePass: ratio >= 3.0,
    aaaPass: ratio >= 7.0,
    aaaLargePass: ratio >= 4.5,
  };
}
