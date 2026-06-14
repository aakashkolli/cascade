import type { TokenId, TokenSystemState } from './types.ts';
import { computeContrastResult } from './contrast.ts';

export function violationKey(fgId: TokenId, bgId: TokenId): string {
  return `${fgId}∥${bgId}`;
}

/**
 * Update the violation index for all contrast-pair edges whose fg or bg token
 * appears in `affectedIds`.
 * Edge convention: from=background, to=foreground (edgeMeta[key] = 'contrast-pair').
 */
export function updateViolations(
  state: TokenSystemState,
  affectedIds: Iterable<TokenId>
): void {
  const affected = new Set(affectedIds);

  for (const [from, tos] of state.edges) {
    for (const to of tos) {
      if (state.edgeMeta.get(`${from}→${to}`) !== 'contrast-pair') continue;
      // from = bg, to = fg
      if (!affected.has(from) && !affected.has(to)) continue;
      recomputePair(state, to, from);
    }
  }
}

function recomputePair(
  state: TokenSystemState,
  fgId: TokenId,
  bgId: TokenId
): void {
  const fg = state.resolvedValues.get(fgId);
  const bg = state.resolvedValues.get(bgId);
  if (!fg || !bg) return;
  const result = computeContrastResult(
    fgId,
    bgId,
    fg.rgb,
    bg.rgb
  );
  state.violations.set(violationKey(fgId, bgId), result);
}
