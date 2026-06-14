import { useState, useRef, useCallback } from 'react';
import type { ContrastResult, WCAGLevel, ResolvedColor, TokenId } from '../../engine/types.ts';

export interface AuditTableProps {
  rows: ContrastResult[];
  resolvedValues: ReadonlyMap<TokenId, ResolvedColor>;
  expandedKeys: Set<string>;
  onToggleExpand: (key: string) => void;
}

const ROW_H = 48;

const LEVEL_BADGE: Record<WCAGLevel, { label: string; color: string; bg: string }> = {
  fail:       { label: '✗ Fail',  color: '#B91C1C', bg: '#FEF2F2' },
  'AA-large': { label: '~ AA-lg', color: '#92400E', bg: '#FFFBEB' },
  AA:         { label: '~ AA',    color: '#92400E', bg: '#FFFBEB' },
  AAA:        { label: '✓ AAA',   color: '#065F46', bg: '#ECFDF5' },
};

const COL: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '13px',
};

export function AuditTable({ rows, resolvedValues, expandedKeys, onToggleExpand }: AuditTableProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  if (rows.length === 0) {
    return (
      <div
        role="table"
        aria-label="Contrast pairs"
        style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}
      >
        <p>No contrast pairs to display.</p>
      </div>
    );
  }

  const visibleStart = Math.floor(scrollTop / ROW_H);
  const visibleEnd = Math.min(rows.length, visibleStart + Math.ceil(600 / ROW_H) + 2);
  const visibleRows = rows.slice(visibleStart, visibleEnd);

  return (
    <div
      role="table"
      aria-label="Contrast pairs"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div
        role="row"
        style={{
          display: 'flex',
          padding: '0 1rem',
          height: `${ROW_H}px`,
          alignItems: 'center',
          gap: '0.75rem',
          borderBottom: '2px solid var(--color-border)',
          background: 'var(--color-surface)',
          fontWeight: 600,
          fontSize: '12px',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 32 }} aria-hidden="true" />
        <div role="columnheader" style={COL}>Foreground</div>
        <div role="columnheader" style={COL}>Background</div>
        <div role="columnheader" style={{ width: 72, fontSize: '13px' }}>Ratio</div>
        <div role="columnheader" style={{ width: 80, fontSize: '13px' }}>Level</div>
        <div role="columnheader" style={{ width: 80, fontSize: '13px' }}>Preview</div>
      </div>

      {/* Virtualized body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
      >
        <div style={{ height: `${rows.length * ROW_H}px`, position: 'relative' }}>
          {visibleRows.map((row, idx) => {
            const rowKey = `${row.foregroundId}|${row.backgroundId}`;
            const fg = resolvedValues.get(row.foregroundId);
            const bg = resolvedValues.get(row.backgroundId);
            const badge = LEVEL_BADGE[row.level];
            const fgLabel = row.foregroundId.split('/').pop() ?? row.foregroundId;
            const bgLabel = row.backgroundId.split('/').pop() ?? row.backgroundId;

            return (
              <div
                key={rowKey}
                role="row"
                aria-selected={expandedKeys.has(rowKey)}
                style={{
                  position: 'absolute',
                  top: `${(visibleStart + idx) * ROW_H}px`,
                  left: 0,
                  right: 0,
                  height: `${ROW_H}px`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  cursor: 'pointer',
                }}
                onClick={() => onToggleExpand(rowKey)}
              >
                {/* Color swatch */}
                <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: fg?.hex ?? '#888',
                      outline: `2px solid ${bg?.hex ?? '#ccc'}`,
                    }}
                    aria-hidden="true"
                  />
                </div>

                <div role="cell" style={COL} title={row.foregroundId}>{fgLabel}</div>
                <div role="cell" style={COL} title={row.backgroundId}>{bgLabel}</div>
                <div role="cell" style={{ width: 72, fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>
                  {row.ratio.toFixed(2)}:1
                </div>
                <div role="cell" style={{ width: 80 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '11px',
                    fontWeight: 600,
                    color: badge.color,
                    background: badge.bg,
                  }}>
                    {badge.label}
                  </span>
                </div>
                <div role="cell" style={{ width: 80 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '11px',
                    background: bg?.hex ?? '#fff',
                    color: fg?.hex ?? '#000',
                  }}>
                    Aa
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
