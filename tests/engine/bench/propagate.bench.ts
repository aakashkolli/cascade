import { bench, describe } from 'vitest';
import { makeTokenSystemState } from '../../../src/engine/types.ts';
import { propagate } from '../../../src/engine/propagate.ts';
import type { Token, TokenId, TokenSystemState } from '../../../src/engine/types.ts';

/**
 * Build a synthetic token system:
 * - 1 base hex token
 * - N-1 reference tokens in a single chain: base → t1 → t2 → ... → t(N-1)
 * - 1 white token with a contrast-pair edge to the last alias
 */
function buildSystem(n: number): TokenSystemState {
  const state = makeTokenSystemState();

  const base: Token = {
    id: 'base',
    name: 'base',
    group: 'color',
    value: { type: 'hex', value: '#000000' },
    tags: [],
  };
  state.tokens.set('base', base);
  state.edges.set('base', []);
  state.reverseEdges.set('base', []);

  const white: Token = {
    id: 'white',
    name: 'white',
    group: 'color',
    value: { type: 'hex', value: '#ffffff' },
    tags: [],
  };
  state.tokens.set('white', white);
  state.edges.set('white', []);
  state.reverseEdges.set('white', []);

  let prevId: TokenId = 'base';
  for (let i = 1; i < n; i++) {
    const id = `token-${i.toString()}`;
    const token: Token = {
      id,
      name: id,
      group: 'color',
      value: { type: 'reference', tokenId: prevId },
      tags: [],
    };
    state.tokens.set(id, token);
    state.edges.set(id, []);
    state.reverseEdges.set(id, []);
    state.edges.set(prevId, [...(state.edges.get(prevId) ?? []), id]);
    state.reverseEdges.set(id, [prevId]);
    state.edgeMeta.set(`${prevId}→${id}`, 'reference');
    prevId = id;
  }

  // Contrast-pair: white (bg) → last alias (fg)
  const lastId = prevId;
  state.edges.set('white', [lastId]);
  state.reverseEdges.set(lastId, [...(state.reverseEdges.get(lastId) ?? []), 'white']);
  state.edgeMeta.set(`white→${lastId}`, 'contrast-pair');

  // Initial propagation
  propagate(state, 'base');
  propagate(state, 'white');

  return state;
}

describe('propagation pass performance', () => {
  // Pre-build states outside bench loops
  const state200 = buildSystem(200);
  const state500 = buildSystem(500);
  const state1000 = buildSystem(1000);

  bench('200 tokens — change base color', () => {
    state200.tokens.set('base', {
      id: 'base',
      name: 'base',
      group: 'color',
      value: { type: 'hex', value: state200.resolvedValues.get('base')?.hex === '#888888' ? '#000000' : '#888888' },
      tags: [],
    });
    propagate(state200, 'base');
  });

  bench('500 tokens — change base color', () => {
    state500.tokens.set('base', {
      id: 'base',
      name: 'base',
      group: 'color',
      value: { type: 'hex', value: state500.resolvedValues.get('base')?.hex === '#888888' ? '#000000' : '#888888' },
      tags: [],
    });
    propagate(state500, 'base');
  });

  bench('import simulation — 1000 tokens full propagation from root', () => {
    state1000.resolvedValues.clear();
    state1000.violations.clear();
    propagate(state1000, 'base');
    propagate(state1000, 'white');
  });
});
