import type { WCAGLevel } from '../../engine/types.ts';

export interface AuditFilterState {
  showFail: boolean;
  showWarn: boolean;
  showPass: boolean;
}

export const DEFAULT_AUDIT_FILTER: AuditFilterState = {
  showFail: true,
  showWarn: true,
  showPass: true,
};

export function matchesFilter(level: WCAGLevel, filter: AuditFilterState): boolean {
  if (level === 'fail') return filter.showFail;
  if (level === 'AA' || level === 'AA-large') return filter.showWarn;
  return filter.showPass;
}

interface AuditFiltersProps {
  filter: AuditFilterState;
  onFilterChange: (f: AuditFilterState) => void;
  totalCount: number;
  visibleCount: number;
}

export function AuditFilters({ filter, onFilterChange, totalCount, visibleCount }: AuditFiltersProps) {
  return (
    <div
      data-testid="audit-filters"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.5rem 1rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
        {visibleCount} of {totalCount} pairs
      </span>

      {/* Fail checkbox — matches /fail/i */}
      <label
        htmlFor="audit-filter-fail"
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', cursor: 'pointer' }}
      >
        <input
          id="audit-filter-fail"
          type="checkbox"
          checked={filter.showFail}
          onChange={() => onFilterChange({ ...filter, showFail: !filter.showFail })}
        />
        Fail ✗
      </label>

      {/* AA / AAA combined checkbox — matches both /aa/i and /aaa/i */}
      <label
        htmlFor="audit-filter-aaa"
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', cursor: 'pointer' }}
      >
        <input
          id="audit-filter-aaa"
          type="checkbox"
          checked={filter.showWarn}
          onChange={() => onFilterChange({ ...filter, showWarn: !filter.showWarn })}
        />
        AA / AAA ~✓
      </label>

      {/* Pass (AAA strict) checkbox */}
      <label
        htmlFor="audit-filter-pass"
        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '13px', cursor: 'pointer' }}
      >
        <input
          id="audit-filter-pass"
          type="checkbox"
          checked={filter.showPass}
          onChange={() => onFilterChange({ ...filter, showPass: !filter.showPass })}
        />
        Pass ✓
      </label>
    </div>
  );
}
