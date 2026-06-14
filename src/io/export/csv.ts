import type { TokenSystemState } from '../../engine/types.ts';

const HEADER = 'foreground,background,ratio,level,aaPass,aaLargePass,aaaPass,aaaLargePass';

export function exportCSV(state: TokenSystemState): string {
  const rows = [...state.violations.values()]
    .sort((a, b) => a.ratio - b.ratio)
    .map((r) =>
      [
        r.foregroundId,
        r.backgroundId,
        r.ratio.toFixed(2),
        r.level,
        String(r.aaPass),
        String(r.aaLargePass),
        String(r.aaaPass),
        String(r.aaaLargePass),
      ].join(',')
    );

  return [HEADER, ...rows].join('\n');
}
