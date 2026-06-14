import { useState, useCallback, useMemo } from 'react';
import type { ContrastResult } from '../../engine/types.ts';
import { useViolations, useResolvedValues, useStoreActions } from '../../store/selectors.ts';
import { AuditTable } from './AuditTable.tsx';
import { AuditFilters, DEFAULT_AUDIT_FILTER, matchesFilter } from './AuditFilters.tsx';
import type { AuditFilterState } from './AuditFilters.tsx';

type CsvState = 'idle' | 'exporting' | 'done' | 'error';

export function AuditView() {
  const violations = useViolations();
  const resolvedValues = useResolvedValues();
  const actions = useStoreActions();

  const [filter, setFilter] = useState<AuditFilterState>(DEFAULT_AUDIT_FILTER);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [csvState, setCsvState] = useState<CsvState>('idle');

  const allRows = useMemo((): ContrastResult[] =>
    [...violations.values()].sort((a, b) => a.ratio - b.ratio),
    [violations],
  );

  const visibleRows = useMemo(
    () => allRows.filter(r => matchesFilter(r.level, filter)),
    [allRows, filter],
  );

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  function handleDownloadCSV() {
    setCsvState('exporting');
    try {
      const csv = actions.exportCSVData();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cascade-audit.csv';
      link.click();
      URL.revokeObjectURL(url);
      setCsvState('done');
      setTimeout(() => setCsvState('idle'), 1500);
    } catch {
      setCsvState('error');
    }
  }

  const csvLabel =
    csvState === 'exporting' ? 'Exporting…' :
    csvState === 'done'      ? 'Exported ✓' :
    csvState === 'error'     ? 'Export failed — retry' :
                               'Download CSV';

  const isEmpty = violations.size === 0;

  return (
    <div data-testid="audit-view" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        flexShrink: 0,
      }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Contrast Audit</h2>
        <button
          onClick={handleDownloadCSV}
          disabled={csvState === 'exporting'}
          aria-label="Download CSV audit report"
          style={{
            padding: '0.375rem 0.75rem',
            borderRadius: 4,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            cursor: csvState === 'exporting' ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {csvLabel}
        </button>
      </div>

      {isEmpty ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
        }}>
          <span style={{ fontSize: '3rem' }} aria-hidden="true">✓</span>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            No contrast violations found — your system is WCAG AA compliant.
          </p>
        </div>
      ) : (
        <>
          <AuditFilters
            filter={filter}
            onFilterChange={setFilter}
            totalCount={allRows.length}
            visibleCount={visibleRows.length}
          />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AuditTable
              rows={visibleRows}
              resolvedValues={resolvedValues}
              expandedKeys={expandedKeys}
              onToggleExpand={toggleExpand}
            />
          </div>
        </>
      )}
    </div>
  );
}
