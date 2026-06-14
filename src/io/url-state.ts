import LZString from 'lz-string';
import { makeTokenSystemState } from '../engine/types.ts';
import type { EdgeType, Token, TokenId, TokenSystemState, TokenValue } from '../engine/types.ts';
import { topologicalOrder } from '../engine/graph.ts';
import { resolveToken } from '../engine/resolve.ts';
import { updateViolations } from '../engine/violations.ts';

interface SerializedToken {
  id: string;
  name: string;
  group: string;
  value: TokenValue;
  tags: string[];
  description?: string;
}

interface SerializedEdge {
  from: string;
  to: string;
  type: EdgeType;
}

interface SerializedSystem {
  v: 1;
  tokens: SerializedToken[];
  edges: SerializedEdge[];
}

const VERSION_PREFIX = 'v1:';

export function serialize(state: TokenSystemState): string {
  const tokens: SerializedToken[] = [];
  for (const token of state.tokens.values()) {
    const st: SerializedToken = {
      id: token.id,
      name: token.name,
      group: token.group,
      value: token.value,
      tags: [...token.tags],
    };
    if (token.description !== undefined) st.description = token.description;
    tokens.push(st);
  }

  const edges: SerializedEdge[] = [];
  for (const [key, type] of state.edgeMeta) {
    const sep = key.indexOf('→');
    if (sep < 0) continue;
    edges.push({ from: key.slice(0, sep), to: key.slice(sep + '→'.length), type });
  }

  const system: SerializedSystem = { v: 1, tokens, edges };
  const json = JSON.stringify(system);
  return VERSION_PREFIX + LZString.compressToEncodedURIComponent(json);
}

export function deserialize(hash: string): TokenSystemState | null {
  if (!hash.startsWith(VERSION_PREFIX)) return null;
  const compressed = hash.slice(VERSION_PREFIX.length);
  let json: string | null;
  try {
    json = LZString.decompressFromEncodedURIComponent(compressed);
  } catch {
    return null;
  }
  if (!json) return null;

  let system: SerializedSystem;
  try {
    system = JSON.parse(json) as SerializedSystem;
  } catch {
    return null;
  }
  if (system.v !== 1 || !Array.isArray(system.tokens) || !Array.isArray(system.edges)) return null;

  const state = makeTokenSystemState();

  for (const st of system.tokens) {
    const token: Token = st.description !== undefined
      ? { id: st.id as TokenId, name: st.name, group: st.group, value: st.value, tags: st.tags, description: st.description }
      : { id: st.id as TokenId, name: st.name, group: st.group, value: st.value, tags: st.tags };
    state.tokens.set(token.id, token);
    state.edges.set(token.id, []);
    state.reverseEdges.set(token.id, []);
  }

  for (const se of system.edges) {
    const from = se.from as TokenId;
    const to = se.to as TokenId;
    const fwd = state.edges.get(from) ?? [];
    if (!fwd.includes(to)) state.edges.set(from, [...fwd, to]);
    const rev = state.reverseEdges.get(to) ?? [];
    if (!rev.includes(from)) state.reverseEdges.set(to, [...rev, from]);
    state.edgeMeta.set(`${from}→${to}`, se.type);
  }

  const graphView = {
    nodes: new Set(state.tokens.keys()),
    edges: state.edges,
    reverseEdges: state.reverseEdges,
    edgeMeta: state.edgeMeta,
  };
  const order = topologicalOrder(graphView, [...state.tokens.keys()] as TokenId[]);
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
