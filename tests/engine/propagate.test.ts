import { describe, it, expect, assert } from 'vitest';
import { makeTokenSystemState } from '../../src/engine/types.ts';
import { propagate } from '../../src/engine/propagate.ts';
import type { Token } from '../../src/engine/types.ts';

function hexToken(id: string, hex: string): Token {
  return { id, name: id, group: 'color', value: { type: 'hex', value: hex }, tags: [] };
}

function refToken(id: string, targetId: string): Token {
  return { id, name: id, group: 'color', value: { type: 'reference', tokenId: targetId }, tags: [] };
}

/**
 * Build a state with:
 * - base (#000000) → alias (reference) → alias2 (reference)
 * - white (#ffffff)
 * - contrast-pair edge: white (bg) → alias (fg)
 * The edge direction convention: white→alias means "white is background, alias is foreground".
 */
function buildState() {
  const state = makeTokenSystemState();

  state.tokens.set('base', hexToken('base', '#000000'));
  state.tokens.set('alias', refToken('alias', 'base'));
  state.tokens.set('alias2', refToken('alias2', 'alias'));
  state.tokens.set('white', hexToken('white', '#ffffff'));

  // Reference edges: base → alias → alias2
  state.edges.set('base', ['alias']);
  state.edges.set('alias', ['alias2']);
  state.edges.set('alias2', []);
  state.edges.set('white', []);
  state.reverseEdges.set('base', []);
  state.reverseEdges.set('alias', ['base']);
  state.reverseEdges.set('alias2', ['alias']);
  state.reverseEdges.set('white', []);
  state.edgeMeta.set('base→alias', 'reference');
  state.edgeMeta.set('alias→alias2', 'reference');

  // Contrast-pair edge: white (bg) → alias (fg)
  // Convention: edge from→to where edgeMeta[key] = 'contrast-pair' means: from=bg, to=fg
  state.edges.set('white', ['alias']);
  state.reverseEdges.set('alias', ['base', 'white']);
  state.edgeMeta.set('white→alias', 'contrast-pair');

  // Initial propagation
  propagate(state, 'base');
  propagate(state, 'white');

  return state;
}

describe('propagate — basic resolution', () => {
  it('resolves a single hex token', () => {
    const state = makeTokenSystemState();
    state.tokens.set('a', hexToken('a', '#FF0000'));
    state.edges.set('a', []);
    state.reverseEdges.set('a', []);
    propagate(state, 'a');
    expect(state.resolvedValues.get('a')?.hex).toBe('#FF0000');
  });

  it('resolves reference tokens downstream of dirty node', () => {
    const state = buildState();
    expect(state.resolvedValues.get('alias')?.hex).toBe('#000000');
    expect(state.resolvedValues.get('alias2')?.hex).toBe('#000000');
  });

  it('only touches reachable nodes — white is not re-resolved when base changes', () => {
    const state = buildState();
    const whiteResolvedBefore = state.resolvedValues.get('white');
    state.tokens.set('base', hexToken('base', '#FF0000'));
    propagate(state, 'base');
    // white is not downstream of base — same object reference means it wasn't recomputed
    expect(state.resolvedValues.get('white')).toBe(whiteResolvedBefore);
  });
});

describe('propagate — violation index', () => {
  it('computes a contrast result for a contrast-pair edge (black alias on white)', () => {
    const state = buildState();
    // alias (#000000 via base) on white (#ffffff) → should be 21:1, AAA
    expect(state.violations.size).toBeGreaterThan(0);
    const result = Array.from(state.violations.values()).at(0);
    expect(result).toBeDefined();
    assert(result !== undefined);
    expect(result.aaaPass).toBe(true);
  });

  it('detects a violation when base color becomes a mid-gray', () => {
    const state = buildState();
    state.tokens.set('base', hexToken('base', '#777777'));
    propagate(state, 'base');
    const result = Array.from(state.violations.values()).at(0);
    expect(result).toBeDefined();
    assert(result !== undefined);
    expect(result.aaPass).toBe(false); // #777 on white ≈ 4.48:1, just fails AA
  });

  it('updates the violation when a violation is fixed', () => {
    const state = buildState();
    // Set base to fail
    state.tokens.set('base', hexToken('base', '#777777'));
    propagate(state, 'base');
    const result1 = Array.from(state.violations.values()).at(0);
    assert(result1 !== undefined);
    expect(result1.aaPass).toBe(false);
    // Fix it
    state.tokens.set('base', hexToken('base', '#000000'));
    propagate(state, 'base');
    const result2 = Array.from(state.violations.values()).at(0);
    assert(result2 !== undefined);
    expect(result2.aaaPass).toBe(true);
  });
});

describe('propagate — topological order', () => {
  it('resolves a 3-level reference chain correctly in one pass', () => {
    const state = makeTokenSystemState();
    state.tokens.set('base', hexToken('base', '#123456'));
    state.tokens.set('mid', refToken('mid', 'base'));
    state.tokens.set('leaf', refToken('leaf', 'mid'));
    state.edges.set('base', ['mid']);
    state.edges.set('mid', ['leaf']);
    state.edges.set('leaf', []);
    state.reverseEdges.set('base', []);
    state.reverseEdges.set('mid', ['base']);
    state.reverseEdges.set('leaf', ['mid']);
    state.edgeMeta.set('base→mid', 'reference');
    state.edgeMeta.set('mid→leaf', 'reference');
    propagate(state, 'base');
    const baseHex = state.resolvedValues.get('base')?.hex;
    expect(state.resolvedValues.get('leaf')?.hex).toBe(baseHex);
  });
});
