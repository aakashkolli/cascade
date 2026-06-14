import type { Edge, Token, TokenId } from '../../engine/types.ts';
import type { ImportResult, ParseError } from './types.ts';

const REFERENCE_RE = /^\{([^}]+)\}$/;
type FTNode = Record<string, unknown>;

function isColorLeaf(node: unknown): boolean {
  if (typeof node !== 'object' || node === null) return false;
  const n = node as FTNode;
  const type = n['type'] ?? n['$type'];
  const val = n['value'] ?? n['$value'];
  return type === 'color' && typeof val === 'string';
}

function makeToken(
  id: TokenId,
  name: string,
  group: string,
  value: Token['value'],
  description: string | undefined,
): Token {
  return description !== undefined
    ? { id, name, group, value, tags: [], description }
    : { id, name, group, value, tags: [] };
}

function traverse(
  node: unknown,
  path: string[],
  tokens: Token[],
  pendingEdges: Array<{ from: string; to: string }>,
): void {
  if (typeof node !== 'object' || node === null) return;
  const n = node as FTNode;

  if (isColorLeaf(node)) {
    const rawValue = (n['value'] ?? n['$value']) as string;
    const description = typeof n['description'] === 'string' ? n['description'] : undefined;
    const id: TokenId = path.join('/');
    const name = path[path.length - 1] ?? id;
    const group = path.slice(0, -1).join('/');
    const refMatch = REFERENCE_RE.exec(rawValue);
    if (refMatch !== null) {
      const refId: TokenId = refMatch[1].replace(/\./g, '/');
      tokens.push(makeToken(id, name, group, { type: 'reference', tokenId: refId }, description));
      pendingEdges.push({ from: refId, to: id });
    } else {
      tokens.push(makeToken(id, name, group, { type: 'hex', value: rawValue }, description));
    }
    return;
  }

  for (const [key, child] of Object.entries(n)) {
    if (key.startsWith('$')) continue;
    traverse(child, [...path, key], tokens, pendingEdges);
  }
}

export function parseFigmaTokens(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch (e) {
    return { ok: false, errors: [{ line: 1, message: `Invalid JSON: ${String(e)}` }] };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, errors: [{ line: 1, message: 'Expected a JSON object' }] };
  }

  const tokens: Token[] = [];
  const pendingEdges: Array<{ from: string; to: string }> = [];

  // Each top-level non-$ key is a token set; traverse its contents (set name not included in token ID)
  for (const [key, setContent] of Object.entries(parsed as FTNode)) {
    if (key.startsWith('$')) continue;
    traverse(setContent, [], tokens, pendingEdges);
  }

  const tokenIds = new Set(tokens.map((t) => t.id));
  const edges: Edge[] = [];
  const errors: ParseError[] = [];
  for (const { from, to } of pendingEdges) {
    if (!tokenIds.has(from)) {
      errors.push({
        line: 1,
        message: `Reference to unknown token "${from.replace(/\//g, '.')}" in "${to.replace(/\//g, '.')}"`,
        suggestion: `Define "${from.replace(/\//g, '.')}" before referencing it`,
      });
      continue;
    }
    edges.push({ from, to, type: 'reference' });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, tokens, edges };
}
