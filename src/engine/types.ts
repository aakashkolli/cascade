// ─── Identifiers ──────────────────────────────────────────────────────────────

export type TokenId = string; // e.g. "color/brand/500"

// ─── Token values ─────────────────────────────────────────────────────────────

export type ComputedFn = 'lighten' | 'darken' | 'alpha';

export type ComputedArg =
  | { readonly type: 'tokenRef'; readonly tokenId: TokenId }
  | { readonly type: 'number'; readonly value: number };

export type TokenValue =
  | { readonly type: 'hex'; readonly value: string }
  | { readonly type: 'reference'; readonly tokenId: TokenId }
  | { readonly type: 'computed'; readonly fn: ComputedFn; readonly args: readonly ComputedArg[] };

export interface Token {
  readonly id: TokenId;
  readonly name: string;
  readonly group: string;
  readonly value: TokenValue;
  readonly description?: string;
  readonly tags: readonly string[];
}

// ─── Graph edges ──────────────────────────────────────────────────────────────

export type EdgeType = 'reference' | 'contrast-pair' | 'computed';

export interface Edge {
  readonly from: TokenId;
  readonly to: TokenId;
  readonly type: EdgeType;
}

// ─── Resolved colors ──────────────────────────────────────────────────────────

export type RGB = readonly [number, number, number];
export type HSL = readonly [number, number, number];
export type OKLCH = readonly [number, number, number];

export interface ResolvedColor {
  readonly tokenId: TokenId;
  readonly hex: string;
  readonly rgb: RGB;
  readonly hsl: HSL;
  readonly oklch: OKLCH;
  readonly luminance: number;
}

// ─── WCAG contrast ────────────────────────────────────────────────────────────

/** Highest WCAG level achieved by a contrast pair. */
export type WCAGLevel = 'AAA' | 'AA' | 'AA-large' | 'fail';

export interface ContrastResult {
  readonly foregroundId: TokenId;
  readonly backgroundId: TokenId;
  readonly ratio: number;
  readonly level: WCAGLevel;
  readonly aaPass: boolean;       // ratio >= 4.5
  readonly aaLargePass: boolean;  // ratio >= 3.0 (also covers UI components)
  readonly aaaPass: boolean;      // ratio >= 7.0
  readonly aaaLargePass: boolean; // ratio >= 4.5
}

export type ViolationIndex = Map<string, ContrastResult>;

// ─── Engine state ─────────────────────────────────────────────────────────────

export interface TokenSystemState {
  tokens: Map<TokenId, Token>;
  /** Outgoing edges: from → list of to */
  edges: Map<TokenId, TokenId[]>;
  /** Reverse edges: to → list of from (for upstream lookups) */
  reverseEdges: Map<TokenId, TokenId[]>;
  /** Edge metadata keyed by `${from}→${to}` */
  edgeMeta: Map<string, EdgeType>;
  resolvedValues: Map<TokenId, ResolvedColor>;
  violations: ViolationIndex;
}

export function makeTokenSystemState(): TokenSystemState {
  return {
    tokens: new Map(),
    edges: new Map(),
    reverseEdges: new Map(),
    edgeMeta: new Map(),
    resolvedValues: new Map(),
    violations: new Map(),
  };
}

// ─── Commands ─────────────────────────────────────────────────────────────────

export interface Command {
  readonly id: string;
  readonly description: string;
  execute(state: TokenSystemState): void;
  undo(state: TokenSystemState): void;
}
