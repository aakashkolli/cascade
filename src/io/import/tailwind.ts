import type { Token, TokenId } from '../../engine/types.ts';
import type { ImportResult, ParseError } from './types.ts';

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
type TWNode = Record<string, unknown>;

function makeToken(id: TokenId, name: string, group: string, value: Token['value']): Token {
  return { id, name, group, value, tags: [] };
}

function traverse(
  node: unknown,
  path: string[],
  tokens: Token[],
  errors: ParseError[],
): void {
  if (typeof node === 'string') {
    if (!HEX_RE.test(node)) {
      errors.push({
        line: 1,
        message: `Non-hex color value "${node}" at "${path.join('.')}"`,
        suggestion: 'Use #RGB or #RRGGBB hex format',
      });
      return;
    }
    const id = path.join('/');
    const name = path[path.length - 1] ?? id;
    const group = path.slice(0, -1).join('/');
    tokens.push(makeToken(id, name, group, { type: 'hex', value: node.toUpperCase() }));
    return;
  }
  if (typeof node !== 'object' || node === null) return;
  for (const [key, child] of Object.entries(node as TWNode)) {
    if (typeof child !== 'string' && (typeof child !== 'object' || child === null)) continue;
    traverse(child, [...path, key], tokens, errors);
  }
}

function unwrap(parsed: unknown): unknown {
  if (typeof parsed !== 'object' || parsed === null) return parsed;
  const p = parsed as TWNode;
  if ('theme' in p && typeof p['theme'] === 'object' && p['theme'] !== null) {
    const theme = p['theme'] as TWNode;
    if ('colors' in theme) return theme['colors'];
  }
  if ('colors' in p) return p['colors'];
  return parsed;
}

export function parseTailwind(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch (e) {
    return { ok: false, errors: [{ line: 1, message: `Invalid JSON: ${String(e)}` }] };
  }

  const tokens: Token[] = [];
  const errors: ParseError[] = [];
  traverse(unwrap(parsed), [], tokens, errors);

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, tokens, edges: [] };
}
