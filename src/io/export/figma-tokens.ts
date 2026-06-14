import type { TokenId, TokenSystemState } from '../../engine/types.ts';

type FTTree = Record<string, unknown>;

function setNested(obj: FTTree, segments: string[], leaf: unknown): void {
  let cur: FTTree = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i] as string;
    if (!(key in cur) || typeof cur[key] !== 'object' || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key] as FTTree;
  }
  const last = segments[segments.length - 1];
  if (last !== undefined) cur[last] = leaf;
}

function tokenIdToDotPath(id: TokenId): string {
  return id.replace(/\//g, '.');
}

export function exportFigmaTokens(state: TokenSystemState): string {
  const inner: FTTree = {};

  for (const [, token] of state.tokens) {
    const segments = token.id.split('/');
    let $value: string;

    switch (token.value.type) {
      case 'hex':
        $value = token.value.value;
        break;
      case 'reference':
        $value = `{${tokenIdToDotPath(token.value.tokenId)}}`;
        break;
      case 'computed': {
        const resolved = state.resolvedValues.get(token.id);
        $value = resolved?.hex ?? '#000000';
        break;
      }
    }

    setNested(inner, segments, { $value, $type: 'color' });
  }

  return JSON.stringify({ global: inner }, null, 2);
}
