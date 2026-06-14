import { describe, it, expect } from 'vitest';
import {
  makeGraph,
  addToken,
  removeToken,
  addEdge,
  removeEdge,
  getReachable,
  topologicalOrder,
  type TokenGraph,
} from '../../src/engine/graph.ts';

function simple3Chain(): TokenGraph {
  // a → b → c
  let g = makeGraph();
  g = addToken(g, 'a');
  g = addToken(g, 'b');
  g = addToken(g, 'c');
  g = addEdge(g, 'a', 'b', 'reference').graph;
  g = addEdge(g, 'b', 'c', 'reference').graph;
  return g;
}

describe('addEdge / cycle detection', () => {
  it('allows a valid DAG edge', () => {
    const g = simple3Chain();
    expect(g.edges.get('a')).toContain('b');
  });

  it('rejects a direct self-loop', () => {
    let g = makeGraph();
    g = addToken(g, 'a');
    const result = addEdge(g, 'a', 'a', 'reference');
    expect(result.cycle).not.toBeNull();
    expect(result.graph.edges.get('a') ?? []).not.toContain('a');
  });

  it('rejects a cycle: A→B→C→A', () => {
    const g = simple3Chain();
    const result = addEdge(g, 'c', 'a', 'reference');
    expect(result.cycle).not.toBeNull();
    expect(result.graph.edges.get('c') ?? []).not.toContain('a');
  });

  it('allows a diamond (shared ancestor, not a cycle)', () => {
    let g = makeGraph();
    ['a', 'b', 'c', 'd'].forEach((id) => { g = addToken(g, id); });
    g = addEdge(g, 'a', 'b', 'reference').graph;
    g = addEdge(g, 'a', 'c', 'reference').graph;
    g = addEdge(g, 'b', 'd', 'reference').graph;
    const result = addEdge(g, 'c', 'd', 'reference');
    expect(result.cycle).toBeNull();
  });
});

describe('getReachable', () => {
  it('returns all nodes downstream of the dirty node (inclusive)', () => {
    const g = simple3Chain();
    expect(getReachable(g, 'a')).toEqual(new Set(['a', 'b', 'c']));
    expect(getReachable(g, 'b')).toEqual(new Set(['b', 'c']));
    expect(getReachable(g, 'c')).toEqual(new Set(['c']));
  });
});

describe('topologicalOrder', () => {
  it('returns nodes in dependency-first order', () => {
    const g = simple3Chain();
    const order = topologicalOrder(g, ['a', 'b', 'c']);
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('c'));
  });

  it('handles a diamond correctly', () => {
    let g = makeGraph();
    ['a', 'b', 'c', 'd'].forEach((id) => { g = addToken(g, id); });
    g = addEdge(g, 'a', 'b', 'reference').graph;
    g = addEdge(g, 'a', 'c', 'reference').graph;
    g = addEdge(g, 'b', 'd', 'reference').graph;
    g = addEdge(g, 'c', 'd', 'reference').graph;
    const order = topologicalOrder(g, ['a', 'b', 'c', 'd']);
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'));
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'));
    expect(order.indexOf('b')).toBeLessThan(order.indexOf('d'));
    expect(order.indexOf('c')).toBeLessThan(order.indexOf('d'));
  });
});

describe('removeToken', () => {
  it('removes the token and its outgoing edges from adjacency list', () => {
    const g = simple3Chain();
    const g2 = removeToken(g, 'b');
    expect(g2.nodes.has('b')).toBe(false);
    expect(g2.edges.get('a') ?? []).not.toContain('b');
  });
});

describe('removeEdge', () => {
  it('removes the edge in both forward and reverse directions', () => {
    const g = simple3Chain();
    const g2 = removeEdge(g, 'a', 'b');
    expect(g2.edges.get('a') ?? []).not.toContain('b');
    expect(g2.reverseEdges.get('b') ?? []).not.toContain('a');
  });
});
