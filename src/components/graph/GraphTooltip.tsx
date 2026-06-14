import type { TokenId } from '../../engine/types.ts';
import type { NodeStatus } from './types.ts';

interface GraphTooltipProps {
  tokenId: TokenId;
  resolvedHex: string;
  violationCount: number;
  dependencyCount: number;
  status: NodeStatus;
  screenX: number;
  screenY: number;
}

const STATUS_LABEL: Record<NodeStatus, string> = {
  fail: '✗ Fails AA',
  warn: '~ Passes AA, fails AAA',
  pass: '✓ Passes AAA',
  none: 'Not a contrast pair',
};

export function GraphTooltip({
  tokenId,
  resolvedHex,
  violationCount,
  dependencyCount,
  status,
  screenX,
  screenY,
}: GraphTooltipProps) {
  return (
    <div
      data-testid="graph-tooltip"
      role="tooltip"
      style={{
        position: 'fixed',
        left: screenX + 16,
        top: screenY + 8,
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: '0.5rem 0.75rem',
        pointerEvents: 'none',
        zIndex: 100,
        minWidth: '180px',
        fontSize: 'var(--text-sm)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
        {tokenId.split('/').pop()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            background: resolvedHex,
            border: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{resolvedHex}</span>
      </div>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)' }}>
        {STATUS_LABEL[status]}
      </div>
      {violationCount > 0 && (
        <div style={{ color: 'var(--color-status-fail)', fontSize: 'var(--text-xs)' }}>
          {violationCount} violation{violationCount !== 1 ? 's' : ''}
        </div>
      )}
      <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', marginTop: '0.25rem' }}>
        {dependencyCount} dep{dependencyCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
