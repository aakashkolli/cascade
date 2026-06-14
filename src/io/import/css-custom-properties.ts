import type { Edge, Token, TokenId } from '../../engine/types.ts';
import type { ImportResult, ParseError } from './types.ts';

const PROP_RE = /^\s*--([^:]+):\s*(.+?)\s*(?:\/\*.*?\*\/)?\s*;?\s*$/;
const VAR_RE = /^var\(--([^)]+)\)$/;
const COLOR_PREFIXES = ['#', 'var(', 'hsl(', 'oklch(', 'rgb('];

function isColorValue(v: string): boolean {
  return COLOR_PREFIXES.some((p) => v.startsWith(p));
}

function stripInlineComment(value: string): string {
  const commentIdx = value.indexOf('/*');
  return commentIdx >= 0 ? value.slice(0, commentIdx).trim() : value.trim();
}

function makeToken(id: TokenId, value: Token['value']): Token {
  return { id, name: id, group: '', value, tags: [] };
}

export function parseCSSCustomProperties(css: string): ImportResult {
  const lines = css.split('\n');
  const tokens: Token[] = [];
  const pendingEdges: Array<{ from: string; to: string; line: number }> = [];
  const errors: ParseError[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNum = i + 1;
    const stripped = line.replace(/\/\*.*?\*\//g, '').trim();
    if (!stripped || stripped.startsWith('/*')) continue;

    // Remove :root { and } from the line to handle single-line CSS
    const cleaned = stripped.replace(/^\s*:root\s*\{\s*/, '').replace(/\s*\}\s*$/, '');
    if (!cleaned) continue;

    // Split by semicolon if there are multiple props on one line
    const propertyLines = cleaned.split(';').filter((s) => s.trim());

    for (const propLine of propertyLines) {
      const match = PROP_RE.exec(propLine.trim());
      if (!match) continue;

      const propName = match[1]?.trim();
      const rawValue = stripInlineComment(match[2]?.trim() ?? '');

      if (!propName || !rawValue || !isColorValue(rawValue)) continue;

      const id = propName as TokenId;
      const varMatch = VAR_RE.exec(rawValue);
      if (varMatch !== null) {
        const refId = varMatch[1] ?? '';
        tokens.push(makeToken(id, { type: 'reference', tokenId: refId as TokenId }));
        pendingEdges.push({ from: refId, to: id, line: lineNum });
      } else {
        tokens.push(makeToken(id, { type: 'hex', value: rawValue }));
      }
    }
  }

  const tokenIds = new Set(tokens.map((t) => t.id));
  const edges: Edge[] = [];
  for (const { from, to, line } of pendingEdges) {
    if (!tokenIds.has(from as TokenId)) {
      errors.push({
        line,
        message: `Reference to unknown custom property "--${from}" in "--${to}"`,
        suggestion: `Define "--${from}" before referencing it`,
      });
      continue;
    }
    edges.push({ from: from as TokenId, to: to as TokenId, type: 'reference' });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, tokens, edges };
}
