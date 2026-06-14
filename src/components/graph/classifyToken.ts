import type { Token } from '../../engine/types.ts';
import type { TokenCategory } from './types.ts';

/**
 * Classifies a token as base / semantic / component for graph filtering.
 * Priority: group/id path prefix first, then value type as fallback.
 */
export function classifyToken(token: Token): TokenCategory {
  const group = token.group.toLowerCase();
  const id = token.id.toLowerCase();

  if (
    group.startsWith('base') ||
    group.startsWith('primitive') ||
    group.startsWith('color/base') ||
    group.startsWith('color/primitive') ||
    id.startsWith('base/') ||
    id.startsWith('primitive/')
  ) {
    return 'base';
  }

  if (
    group.startsWith('semantic') ||
    group.startsWith('alias') ||
    group.startsWith('color/semantic') ||
    group.startsWith('color/alias') ||
    id.startsWith('semantic/') ||
    id.startsWith('alias/')
  ) {
    return 'semantic';
  }

  if (
    group.startsWith('component') ||
    group.startsWith('comp/') ||
    id.startsWith('component/') ||
    id.startsWith('comp/')
  ) {
    return 'component';
  }

  // Fallback by value type
  if (token.value.type === 'hex') return 'base';
  if (token.value.type === 'reference' || token.value.type === 'computed') return 'semantic';

  return 'component';
}
