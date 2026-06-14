import type { TokenId, ViolationIndex } from '../../engine/types';

interface ContrastPairsProps {
  tokenId: TokenId;
  violations: ViolationIndex;
}

function levelLabel(level: string): string {
  if (level === 'AAA') return '✓ AAA';
  if (level === 'AA') return '~ AA';
  if (level === 'AA-large') return '~ AA Large';
  return '✗ fail';
}

function levelColor(level: string): string {
  if (level === 'AAA') return 'var(--color-status-pass)';
  if (level === 'AA' || level === 'AA-large') return 'var(--color-status-warn)';
  return 'var(--color-status-fail)';
}

export function ContrastPairs({ tokenId, violations }: ContrastPairsProps) {
  const pairs = [...violations.values()].filter(
    r => r.foregroundId === tokenId || r.backgroundId === tokenId
  );

  if (pairs.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>No contrast pairs for this token.</p>;
  }

  return (
    <div data-testid="contrast-pairs">
      {pairs.map(pair => (
        <div
          key={`${pair.foregroundId}-${pair.backgroundId}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            {pair.foregroundId} / {pair.backgroundId}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {pair.ratio.toFixed(2)}:1
          </span>
          <span
            aria-label={`WCAG level: ${pair.level}`}
            style={{ color: levelColor(pair.level), fontWeight: 600, minWidth: '5rem', textAlign: 'right' }}
          >
            {levelLabel(pair.level)}
          </span>
        </div>
      ))}
    </div>
  );
}
