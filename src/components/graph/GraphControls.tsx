import type { FilterState } from './types.ts';

interface GraphControlsProps {
  filter: FilterState;
  onFilterChange: (filter: FilterState) => void;
  onZoomReset: () => void;
}

export function GraphControls({ filter, onFilterChange, onZoomReset }: GraphControlsProps) {
  function toggle(key: keyof FilterState) {
    onFilterChange({ ...filter, [key]: !filter[key] });
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: 'var(--text-sm)',
    cursor: 'pointer',
  };

  return (
    <div
      data-testid="graph-controls"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0.75rem',
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        minWidth: '160px',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.25rem' }}>
        Filter
      </span>

      {(
        [
          ['showBase', 'Base tokens'],
          ['showSemantic', 'Semantic aliases'],
          ['showComponent', 'Component tokens'],
        ] as [keyof FilterState, string][]
      ).map(([key, label]) => (
        <label key={key} style={labelStyle}>
          <input
            type="checkbox"
            checked={filter[key] as boolean}
            onChange={() => toggle(key)}
          />
          {label}
        </label>
      ))}

      <label style={{ ...labelStyle, marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
        <input
          type="checkbox"
          checked={filter.violationsOnly}
          onChange={() => toggle('violationsOnly')}
        />
        Violations only
      </label>

      <button
        className="btn btn-ghost"
        onClick={onZoomReset}
        aria-label="Reset zoom"
        style={{
          marginTop: '0.75rem',
          width: '100%',
          justifyContent: 'center',
          fontSize: 'var(--text-sm)',
        }}
      >
        Reset zoom
      </button>
    </div>
  );
}
