import type { TokenId, TokenSystemState } from './types.ts';
import { getReachable, topologicalOrder } from './graph.ts';
import { resolveToken } from './resolve.ts';
import { updateViolations } from './violations.ts';

/**
 * Re-evaluate all tokens reachable from `dirtyId` in topological order,
 * then update the violation index for affected contrast pairs.
 * Mutates state.resolvedValues and state.violations in place.
 */
export function propagate(state: TokenSystemState, dirtyId: TokenId): void {
  // Build a compatible graph view from state maps
  const graphView = {
    nodes: new Set(state.tokens.keys()),
    edges: state.edges,
    reverseEdges: state.reverseEdges,
    edgeMeta: state.edgeMeta,
  };

  const reachable = getReachable(graphView, dirtyId);
  const order = topologicalOrder(graphView, [...reachable]);

  const updatedIds: TokenId[] = [];

  for (const id of order) {
    const token = state.tokens.get(id);
    if (!token) continue;
    const resolvedResult = resolveToken(token, state.resolvedValues);
    if (resolvedResult !== null) {
      state.resolvedValues.set(id, resolvedResult);
      updatedIds.push(id);
    }
  }

  updateViolations(state, updatedIds);
}
