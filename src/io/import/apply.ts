import { makeTokenSystemState } from '../../engine/types.ts';
import type { TokenId, TokenSystemState } from '../../engine/types.ts';
import { topologicalOrder } from '../../engine/graph.ts';
import { resolveToken } from '../../engine/resolve.ts';
import { updateViolations } from '../../engine/violations.ts';
import type { ImportResult } from './types.ts';

export function applyImportResult(result: ImportResult): TokenSystemState {
  if (!result.ok) throw new Error('Cannot apply failed import result');
  const state = makeTokenSystemState();

  // Populate tokens
  for (const token of result.tokens) {
    state.tokens.set(token.id, token);
    state.edges.set(token.id, []);
    state.reverseEdges.set(token.id, []);
  }

  // Validate and populate edges
  for (const edge of result.edges) {
    if (!state.tokens.has(edge.from) || !state.tokens.has(edge.to)) {
      throw new Error(`Edge references unknown token: ${edge.from} → ${edge.to}`);
    }
    const fwd = state.edges.get(edge.from) ?? [];
    if (!fwd.includes(edge.to)) state.edges.set(edge.from, [...fwd, edge.to]);
    const rev = state.reverseEdges.get(edge.to) ?? [];
    if (!rev.includes(edge.from)) state.reverseEdges.set(edge.to, [...rev, edge.from]);
    state.edgeMeta.set(`${edge.from}→${edge.to}`, edge.type);
  }

  // Full topological propagation — resolves all tokens in dependency order
  const graphView = {
    nodes: new Set(state.tokens.keys()),
    edges: state.edges,
    reverseEdges: state.reverseEdges,
    edgeMeta: state.edgeMeta,
  };
  const order = topologicalOrder(graphView, [...state.tokens.keys()]);

  // Cycle detection: Kahn's algorithm silently drops nodes in cycles
  if (order.length !== state.tokens.size) {
    const inCycle = [...state.tokens.keys()].filter((id) => !order.includes(id));
    throw new Error(`Import contains circular dependency involving: ${inCycle.join(', ')}`);
  }

  const updatedIds: TokenId[] = [];
  for (const id of order) {
    const token = state.tokens.get(id);
    if (!token) continue;
    const resolved = resolveToken(token, state.resolvedValues);
    if (resolved !== null) {
      state.resolvedValues.set(id, resolved);
      updatedIds.push(id);
    }
  }
  updateViolations(state, updatedIds);

  return state;
}
