import { describe, it, expect } from 'vitest';
import { parseFigmaTokens } from '../../src/io/import/figma-tokens.ts';
import { parseStyleDictionary } from '../../src/io/import/style-dictionary.ts';
import { applyImportResult } from '../../src/io/import/apply.ts';
import { serialize, deserialize } from '../../src/io/url-state.ts';

const SAMPLE_50_STYLE_DICTIONARY = JSON.stringify({
  color: {
    brand: {
      '50':  { value: '#F5F3FF', type: 'color' },
      '100': { value: '#EDE9FE', type: 'color' },
      '200': { value: '#DDD6FE', type: 'color' },
      '300': { value: '#C4B5FD', type: 'color' },
      '400': { value: '#A78BFA', type: 'color' },
      '500': { value: '#7C3AED', type: 'color' },
      '600': { value: '#6D28D9', type: 'color' },
      '700': { value: '#5B21B6', type: 'color' },
      '800': { value: '#4C1D95', type: 'color' },
      '900': { value: '#2E1065', type: 'color' },
    },
    neutral: {
      '50':  { value: '#FAFAFA', type: 'color' },
      '100': { value: '#F4F4F5', type: 'color' },
      '200': { value: '#E4E4E7', type: 'color' },
      '300': { value: '#D4D4D8', type: 'color' },
      '400': { value: '#A1A1AA', type: 'color' },
      '500': { value: '#71717A', type: 'color' },
      '600': { value: '#52525B', type: 'color' },
      '700': { value: '#3F3F46', type: 'color' },
      '800': { value: '#27272A', type: 'color' },
      '900': { value: '#18181B', type: 'color' },
    },
    status: {
      error:   { value: '#DC2626', type: 'color' },
      warning: { value: '#D97706', type: 'color' },
      success: { value: '#16A34A', type: 'color' },
      info:    { value: '{color.brand.600}', type: 'color' },
    },
    text: {
      primary:   { value: '{color.neutral.900}', type: 'color' },
      secondary: { value: '{color.neutral.600}', type: 'color' },
      disabled:  { value: '{color.neutral.400}', type: 'color' },
      inverse:   { value: '{color.neutral.50}',  type: 'color' },
      link:      { value: '{color.brand.600}',   type: 'color' },
    },
    surface: {
      primary:   { value: '{color.neutral.50}',  type: 'color' },
      secondary: { value: '{color.neutral.100}', type: 'color' },
      tertiary:  { value: '{color.neutral.200}', type: 'color' },
      inverse:   { value: '{color.neutral.900}', type: 'color' },
      brand:     { value: '{color.brand.500}',   type: 'color' },
    },
    border: {
      default: { value: '{color.neutral.200}', type: 'color' },
      strong:  { value: '{color.neutral.400}', type: 'color' },
      subtle:  { value: '{color.neutral.100}', type: 'color' },
      focus:   { value: '{color.brand.500}',   type: 'color' },
    },
    action: {
      primary:        { value: '{color.brand.500}',   type: 'color' },
      'primary-hover':  { value: '{color.brand.600}',   type: 'color' },
      'primary-text':   { value: '{color.neutral.50}',  type: 'color' },
      secondary:      { value: '{color.neutral.200}', type: 'color' },
      'secondary-text': { value: '{color.neutral.900}', type: 'color' },
    },
    icon: {
      default: { value: '{color.neutral.700}', type: 'color' },
      muted:   { value: '{color.neutral.500}', type: 'color' },
      inverse: { value: '{color.neutral.50}',  type: 'color' },
      brand:   { value: '{color.brand.500}',   type: 'color' },
      error:   { value: '{color.status.error}', type: 'color' },
    },
    focus: {
      ring:        { value: '{color.brand.500}', type: 'color' },
      'ring-offset': { value: '{color.neutral.50}', type: 'color' },
    },
  },
});

const SAMPLE_50_FIGMA_TOKENS = JSON.stringify({
  global: {
    color: {
      brand: {
        '50':  { value: '#F5F3FF', type: 'color' },
        '100': { value: '#EDE9FE', type: 'color' },
        '200': { value: '#DDD6FE', type: 'color' },
        '300': { value: '#C4B5FD', type: 'color' },
        '400': { value: '#A78BFA', type: 'color' },
        '500': { value: '#7C3AED', type: 'color' },
        '600': { value: '#6D28D9', type: 'color' },
        '700': { value: '#5B21B6', type: 'color' },
        '800': { value: '#4C1D95', type: 'color' },
        '900': { value: '#2E1065', type: 'color' },
      },
      neutral: {
        '50':  { value: '#FAFAFA', type: 'color' },
        '100': { value: '#F4F4F5', type: 'color' },
        '200': { value: '#E4E4E7', type: 'color' },
        '300': { value: '#D4D4D8', type: 'color' },
        '400': { value: '#A1A1AA', type: 'color' },
        '500': { value: '#71717A', type: 'color' },
        '600': { value: '#52525B', type: 'color' },
        '700': { value: '#3F3F46', type: 'color' },
        '800': { value: '#27272A', type: 'color' },
        '900': { value: '#18181B', type: 'color' },
      },
      status: {
        error:   { value: '#DC2626', type: 'color' },
        warning: { value: '#D97706', type: 'color' },
        success: { value: '#16A34A', type: 'color' },
        info:    { value: '{color.brand.600}', type: 'color' },
      },
      text: {
        primary:   { value: '{color.neutral.900}', type: 'color' },
        secondary: { value: '{color.neutral.600}', type: 'color' },
        disabled:  { value: '{color.neutral.400}', type: 'color' },
        inverse:   { value: '{color.neutral.50}',  type: 'color' },
        link:      { value: '{color.brand.600}',   type: 'color' },
      },
      surface: {
        primary:   { value: '{color.neutral.50}',  type: 'color' },
        secondary: { value: '{color.neutral.100}', type: 'color' },
        tertiary:  { value: '{color.neutral.200}', type: 'color' },
        inverse:   { value: '{color.neutral.900}', type: 'color' },
        brand:     { value: '{color.brand.500}',   type: 'color' },
      },
      border: {
        default: { value: '{color.neutral.200}', type: 'color' },
        strong:  { value: '{color.neutral.400}', type: 'color' },
        subtle:  { value: '{color.neutral.100}', type: 'color' },
        focus:   { value: '{color.brand.500}',   type: 'color' },
      },
      action: {
        primary:        { value: '{color.brand.500}',   type: 'color' },
        'primary-hover':  { value: '{color.brand.600}',   type: 'color' },
        'primary-text':   { value: '{color.neutral.50}',  type: 'color' },
        secondary:      { value: '{color.neutral.200}', type: 'color' },
        'secondary-text': { value: '{color.neutral.900}', type: 'color' },
      },
      icon: {
        default: { value: '{color.neutral.700}', type: 'color' },
        muted:   { value: '{color.neutral.500}', type: 'color' },
        inverse: { value: '{color.neutral.50}',  type: 'color' },
        brand:   { value: '{color.brand.500}',   type: 'color' },
        error:   { value: '{color.status.error}', type: 'color' },
      },
      focus: {
        ring:        { value: '{color.brand.500}', type: 'color' },
        'ring-offset': { value: '{color.neutral.50}', type: 'color' },
      },
    },
  },
});

describe('Integration: import → applyImportResult', () => {
  it('imports sample-50-token-style-dictionary.json with 50 tokens', () => {
    const result = parseStyleDictionary(SAMPLE_50_STYLE_DICTIONARY);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.errors[0]?.message);
    expect(result.tokens).toHaveLength(50);
    const state = applyImportResult(result);
    expect(state.tokens.size).toBe(50);
    expect(state.resolvedValues.size).toBe(50);
  });

  it('imports sample-50-token-figma-tokens.json with 50 tokens', () => {
    const result = parseFigmaTokens(SAMPLE_50_FIGMA_TOKENS);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.errors[0]?.message);
    expect(result.tokens).toHaveLength(50);
    const state = applyImportResult(result);
    expect(state.tokens.size).toBe(50);
    expect(state.resolvedValues.size).toBe(50);
  });
});

describe('Integration: 200-token round-trip (Phase 2 exit criterion)', () => {
  it('import → serialize → deserialize with no data loss', () => {
    const tokens = [];
    const edges = [];
    for (let i = 0; i < 100; i++) {
      const shade = i.toString(16).padStart(2, '0');
      tokens.push({ id: `palette/${i}`, name: String(i), group: 'palette', value: { type: 'hex' as const, value: `#${shade}${shade}${shade}` }, tags: [] });
    }
    for (let i = 0; i < 100; i++) {
      tokens.push({ id: `semantic/${i}`, name: String(i), group: 'semantic', value: { type: 'reference' as const, tokenId: `palette/${i}` }, tags: [] });
      edges.push({ from: `palette/${i}`, to: `semantic/${i}`, type: 'reference' as const });
    }
    const original = applyImportResult({ ok: true, tokens, edges });
    expect(original.tokens.size).toBe(200);
    expect(original.resolvedValues.size).toBe(200);

    const hash = serialize(original);
    expect(hash).toMatch(/^v1:/);

    const restored = deserialize(hash);
    expect(restored).not.toBeNull();
    if (!restored) throw new Error('deserialize returned null');

    expect(restored.tokens.size).toBe(200);
    expect(restored.edgeMeta.size).toBe(100);
    expect(restored.resolvedValues.size).toBe(200);

    for (const [id, token] of original.tokens) {
      const rt = restored.tokens.get(id);
      expect(rt).toBeDefined();
      expect(rt?.value).toEqual(token.value);
    }
    for (const [id, resolved] of original.resolvedValues) {
      expect(restored.resolvedValues.get(id)?.hex).toBe(resolved.hex);
    }
  });
});
