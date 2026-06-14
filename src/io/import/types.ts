import type { Edge, Token } from '../../engine/types.ts';

export interface ParseError {
  readonly line: number;
  readonly message: string;
  readonly suggestion?: string;
}

export type ImportResult =
  | { readonly ok: true; readonly tokens: readonly Token[]; readonly edges: readonly Edge[] }
  | { readonly ok: false; readonly errors: readonly ParseError[] };
