import { create } from 'zustand';
import {
  makeTokenSystemState,
  type Command,
  type EdgeType,
  type ResolvedColor,
  type Token,
  type TokenId,
  type TokenValue,
  type ViolationIndex,
} from '../engine/types.ts';
import {
  makeCommandHistory,
  createSetValueCommand,
  createAddTokenCommand,
  createRemoveTokenCommand,
  type CommandHistory,
} from '../engine/commands.ts';
import { propagate } from '../engine/propagate.ts';
import type { TokenSystemState } from '../engine/types.ts';
import type { ImportResult } from '../io/import/types.ts';
import { applyImportResult } from '../io/import/apply.ts';
import { exportCSSCustomProperties } from '../io/export/css-custom-properties.ts';
import { exportStyleDictionary } from '../io/export/style-dictionary.ts';
import { exportFigmaTokens } from '../io/export/figma-tokens.ts';
import { exportCSV } from '../io/export/csv.ts';
import { serialize, deserialize } from '../io/url-state.ts';

// ─── Unique id counter for store-local commands ───────────────────────────────

let _storeSeq = 0;
function storeNextId(): string { return `store-cmd-${(++_storeSeq).toString()}`; }

// ─── Local command factories for edge mutations ────────────────────────────────

function createAddEdgeCommand(from: TokenId, to: TokenId, type: EdgeType): Command {
  return {
    id: storeNextId(),
    description: `Add edge ${from} → ${to}`,
    execute(s: TokenSystemState) {
      const fwd = s.edges.get(from) ?? [];
      if (!fwd.includes(to)) s.edges.set(from, [...fwd, to]);
      const rev = s.reverseEdges.get(to) ?? [];
      if (!rev.includes(from)) s.reverseEdges.set(to, [...rev, from]);
      s.edgeMeta.set(`${from}→${to}`, type);
      propagate(s, from);
    },
    undo(s: TokenSystemState) {
      s.edges.set(from, (s.edges.get(from) ?? []).filter((t) => t !== to));
      s.reverseEdges.set(to, (s.reverseEdges.get(to) ?? []).filter((f) => f !== from));
      s.edgeMeta.delete(`${from}→${to}`);
      propagate(s, from);
    },
  };
}

function createRemoveEdgeCommandWithType(from: TokenId, to: TokenId, state: TokenSystemState): Command {
  const savedType = state.edgeMeta.get(`${from}→${to}`) ?? 'reference';
  return {
    id: storeNextId(),
    description: `Remove edge ${from} → ${to}`,
    execute(s: TokenSystemState) {
      s.edges.set(from, (s.edges.get(from) ?? []).filter((t) => t !== to));
      s.reverseEdges.set(to, (s.reverseEdges.get(to) ?? []).filter((f) => f !== from));
      s.edgeMeta.delete(`${from}→${to}`);
      propagate(s, from);
    },
    undo(s: TokenSystemState) {
      const fwd = s.edges.get(from) ?? [];
      if (!fwd.includes(to)) s.edges.set(from, [...fwd, to]);
      const rev = s.reverseEdges.get(to) ?? [];
      if (!rev.includes(from)) s.reverseEdges.set(to, [...rev, from]);
      s.edgeMeta.set(`${from}→${to}`, savedType);
      propagate(s, from);
    },
  };
}

// ─── Module-level engine state (never exposed to React) ───────────────────────

let engineState: TokenSystemState = makeTokenSystemState();
let history: CommandHistory = makeCommandHistory();

// ─── Store interface ──────────────────────────────────────────────────────────

export interface TokenGraphStore {
  // Reactive snapshots
  tokens: ReadonlyMap<TokenId, Token>;
  resolvedValues: ReadonlyMap<TokenId, ResolvedColor>;
  violations: ViolationIndex;
  edges: ReadonlyMap<TokenId, TokenId[]>;
  reverseEdges: ReadonlyMap<TokenId, TokenId[]>;
  edgeMeta: ReadonlyMap<string, EdgeType>;
  past: readonly Command[];
  future: readonly Command[];

  // Actions
  setTokenValue(id: TokenId, value: TokenValue): void;
  addToken(token: Token): void;
  removeToken(id: TokenId): void;
  addEdge(from: TokenId, to: TokenId, type: EdgeType): void;
  removeEdge(from: TokenId, to: TokenId): void;
  undo(): void;
  redo(): void;
  importSystem(result: ImportResult): void;
  reset(): void;

  // Export helpers
  exportCSS(): string;
  exportStyleDictionary(): string;
  exportFigmaTokens(): string;
  exportCSVData(): string;

  // URL state helpers
  serializeToHash(): string;
  loadFromHash(hash: string): boolean;
}

// ─── Snapshot helper ──────────────────────────────────────────────────────────

type SetFn = (partial: Partial<TokenGraphStore>) => void;

function snapshot(set: SetFn): void {
  set({
    tokens: new Map(engineState.tokens) as ReadonlyMap<TokenId, Token>,
    edges: new Map(engineState.edges) as ReadonlyMap<TokenId, TokenId[]>,
    reverseEdges: new Map(engineState.reverseEdges) as ReadonlyMap<TokenId, TokenId[]>,
    resolvedValues: new Map(engineState.resolvedValues) as ReadonlyMap<TokenId, ResolvedColor>,
    violations: new Map(engineState.violations),
    edgeMeta: new Map(engineState.edgeMeta) as ReadonlyMap<string, EdgeType>,
    past: [...history.past],
    future: [...history.future],
  });
}

// ─── Zustand store ────────────────────────────────────────────────────────────

export const useTokenGraphStore = create<TokenGraphStore>((set) => ({
  // Initial snapshot — all empty
  tokens: new Map() as ReadonlyMap<TokenId, Token>,
  resolvedValues: new Map() as ReadonlyMap<TokenId, ResolvedColor>,
  violations: new Map() as ViolationIndex,
  edges: new Map() as ReadonlyMap<TokenId, TokenId[]>,
  reverseEdges: new Map<TokenId, TokenId[]>() as ReadonlyMap<TokenId, TokenId[]>,
  edgeMeta: new Map() as ReadonlyMap<string, EdgeType>,
  past: [],
  future: [],

  // ── Mutations ───────────────────────────────────────────────────────────────

  setTokenValue(id: TokenId, value: TokenValue) {
    const cmd = createSetValueCommand(id, value, engineState);
    history.apply(cmd, engineState);
    snapshot(set);
  },

  addToken(token: Token) {
    const cmd = createAddTokenCommand(token);
    history.apply(cmd, engineState);
    snapshot(set);
  },

  removeToken(id: TokenId) {
    const cmd = createRemoveTokenCommand(id, engineState);
    history.apply(cmd, engineState);
    snapshot(set);
  },

  addEdge(from: TokenId, to: TokenId, type: EdgeType) {
    const cmd = createAddEdgeCommand(from, to, type);
    history.apply(cmd, engineState);
    snapshot(set);
  },

  removeEdge(from: TokenId, to: TokenId) {
    const cmd = createRemoveEdgeCommandWithType(from, to, engineState);
    history.apply(cmd, engineState);
    snapshot(set);
  },

  undo() {
    history.undo(engineState);
    snapshot(set);
  },

  redo() {
    history.redo(engineState);
    snapshot(set);
  },

  importSystem(result: ImportResult) {
    if (!result.ok) return; // caller passed a failed parse result; nothing to import
    try {
      engineState = applyImportResult(result);
    } catch {
      return; // cycle or edge error from applyImportResult; leave existing state intact
    }
    history = makeCommandHistory();
    snapshot(set);
  },

  reset() {
    engineState = makeTokenSystemState();
    history = makeCommandHistory();
    snapshot(set);
  },

  // ── Export helpers ──────────────────────────────────────────────────────────

  exportCSS(): string {
    return exportCSSCustomProperties(engineState);
  },

  exportStyleDictionary(): string {
    return exportStyleDictionary(engineState);
  },

  exportFigmaTokens(): string {
    return exportFigmaTokens(engineState);
  },

  exportCSVData(): string {
    return exportCSV(engineState);
  },

  // ── URL state ───────────────────────────────────────────────────────────────

  serializeToHash(): string {
    return serialize(engineState);
  },

  loadFromHash(hash: string): boolean {
    const state = deserialize(hash);
    if (!state) return false;
    engineState = state;
    history = makeCommandHistory();
    snapshot(set);
    return true;
  },
}));
