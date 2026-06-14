import type { TokenId, TokenSystemState } from '../../engine/types.ts';

function toCSSProp(id: TokenId): string {
  return '--' + id.replace(/\//g, '-');
}

export function exportCSSCustomProperties(state: TokenSystemState): string {
  const entries: string[] = [];

  const sorted = [...state.tokens.values()].sort((a, b) => a.id.localeCompare(b.id));

  for (const token of sorted) {
    const prop = toCSSProp(token.id);
    let value: string;

    switch (token.value.type) {
      case 'hex':
        value = token.value.value;
        break;
      case 'reference':
        value = `var(${toCSSProp(token.value.tokenId)})`;
        break;
      case 'computed': {
        const resolved = state.resolvedValues.get(token.id);
        value = resolved?.hex ?? '#000000';
        break;
      }
    }

    entries.push(`  ${prop}: ${value};`);
  }

  return `:root {\n${entries.join('\n')}\n}`;
}
