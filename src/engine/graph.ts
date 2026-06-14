import type { TokenId, EdgeType } from './types.ts';

export interface TokenGraph {
  readonly nodes: Set<TokenId>;
  readonly edges: Map<TokenId, TokenId[]>;        // outgoing
  readonly reverseEdges: Map<TokenId, TokenId[]>; // incoming
  readonly edgeMeta: Map<string, EdgeType>;        // `${from}→${to}` → type
}

export function makeGraph(): TokenGraph {
  return {
    nodes: new Set(),
    edges: new Map(),
    reverseEdges: new Map(),
    edgeMeta: new Map(),
  };
}

export function addToken(g: TokenGraph, id: TokenId): TokenGraph {
  const nodes = new Set(g.nodes);
  nodes.add(id);
  const edges = new Map(g.edges);
  if (!edges.has(id)) edges.set(id, []);
  const reverseEdges = new Map(g.reverseEdges);
  if (!reverseEdges.has(id)) reverseEdges.set(id, []);
  return { nodes, edges, reverseEdges, edgeMeta: g.edgeMeta };
}

export function removeToken(g: TokenGraph, id: TokenId): TokenGraph {
  const nodes = new Set(g.nodes);
  nodes.delete(id);
  const edges = new Map(g.edges);
  edges.delete(id);
  const reverseEdges = new Map(g.reverseEdges);
  reverseEdges.delete(id);
  const edgeMeta = new Map(g.edgeMeta);

  for (const [from, tos] of edges) {
    const filtered = tos.filter((t) => t !== id);
    if (filtered.length !== tos.length) {
      edges.set(from, filtered);
      edgeMeta.delete(`${from}→${id}`);
    }
  }
  for (const [to, froms] of reverseEdges) {
    const filtered = froms.filter((f) => f !== id);
    if (filtered.length !== froms.length) reverseEdges.set(to, filtered);
  }
  return { nodes, edges, reverseEdges, edgeMeta };
}

export interface AddEdgeResult {
  graph: TokenGraph;
  cycle: TokenId[] | null;
}

export function addEdge(
  g: TokenGraph,
  from: TokenId,
  to: TokenId,
  type: EdgeType
): AddEdgeResult {
  const cycle = detectCyclePath(g, from, to);
  if (cycle !== null) return { graph: g, cycle };

  const edges = new Map(g.edges);
  edges.set(from, [...(edges.get(from) ?? []), to]);
  const reverseEdges = new Map(g.reverseEdges);
  reverseEdges.set(to, [...(reverseEdges.get(to) ?? []), from]);
  const edgeMeta = new Map(g.edgeMeta);
  edgeMeta.set(`${from}→${to}`, type);
  return {
    graph: { nodes: g.nodes, edges, reverseEdges, edgeMeta },
    cycle: null,
  };
}

export function removeEdge(g: TokenGraph, from: TokenId, to: TokenId): TokenGraph {
  const edges = new Map(g.edges);
  edges.set(from, (edges.get(from) ?? []).filter((t) => t !== to));
  const reverseEdges = new Map(g.reverseEdges);
  reverseEdges.set(to, (reverseEdges.get(to) ?? []).filter((f) => f !== from));
  const edgeMeta = new Map(g.edgeMeta);
  edgeMeta.delete(`${from}→${to}`);
  return { nodes: g.nodes, edges, reverseEdges, edgeMeta };
}

export function getReachable(g: TokenGraph, from: TokenId): Set<TokenId> {
  const visited = new Set<TokenId>([from]);
  const queue = [from];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === undefined) break;
    for (const neighbor of g.edges.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited;
}

export function topologicalOrder(g: TokenGraph, nodes: TokenId[]): TokenId[] {
  const nodeSet = new Set(nodes);
  const inDegree = new Map<TokenId, number>(nodes.map((n) => [n, 0]));
  for (const from of nodes) {
    for (const to of g.edges.get(from) ?? []) {
      if (nodeSet.has(to)) inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
    }
  }
  const queue = nodes.filter((n) => (inDegree.get(n) ?? 0) === 0);
  const result: TokenId[] = [];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === undefined) break;
    result.push(node);
    for (const to of g.edges.get(node) ?? []) {
      if (!nodeSet.has(to)) continue;
      const deg = (inDegree.get(to) ?? 0) - 1;
      inDegree.set(to, deg);
      if (deg === 0) queue.push(to);
    }
  }
  return result;
}

function detectCyclePath(
  g: TokenGraph,
  newFrom: TokenId,
  newTo: TokenId
): TokenId[] | null {
  if (newFrom === newTo) return [newFrom, newTo];
  // If newFrom is reachable from newTo via existing edges, adding newFrom→newTo creates a cycle
  const path: TokenId[] = [newTo];
  const visited = new Set<TokenId>([newTo]);

  function dfs(node: TokenId): boolean {
    for (const neighbor of g.edges.get(node) ?? []) {
      if (neighbor === newFrom) {
        path.push(neighbor);
        path.push(newTo);
        return true;
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        if (dfs(neighbor)) return true;
        path.pop();
      }
    }
    return false;
  }

  return dfs(newTo) ? path : null;
}
