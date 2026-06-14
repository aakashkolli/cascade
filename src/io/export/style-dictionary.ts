import type { TokenId, TokenSystemState } from '../../engine/types.ts';

type SDTree = Record<string, unknown>;

function setNested(obj: SDTree, segments: string[], leaf: unknown): void {
  let cur: SDTree = obj;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i] as string;
    if (!(key in cur) || typeof cur[key] !== 'object' || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key] as SDTree;
  }
  const last = segments[segments.length - 1];
  if (last !== undefined) cur[last] = leaf;
}

function tokenIdToDotPath(id: TokenId): string {
  return id.replace(/\//g, '.');
}

export function exportStyleDictionary(state: TokenSystemState): string {
  const root: SDTree = {};

  for (const [, token] of state.tokens) {
    const segments = token.id.split('/');
    let sdValue: string;

    switch (token.value.type) {
      case 'hex':
        sdValue = token.value.value;
        break;
      case 'reference':
        sdValue = `{${tokenIdToDotPath(token.value.tokenId)}}`;
        break;
      case 'computed': {
        const resolved = state.resolvedValues.get(token.id);
        sdValue = resolved?.hex ?? '#000000';
        break;
      }
    }

    setNested(root, segments, { value: sdValue, type: 'color' });
  }

  return JSON.stringify(root, null, 2);
}
