interface EmptyStateProps {
  onImportClick: () => void;
}

export function EmptyState({ onImportClick }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '0.5rem',
      }}
    >
      <p style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
        No tokens loaded
      </p>
      <p style={{ margin: '0 0 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        Import a token system to get started
      </p>
      <button className="btn btn-solid" onClick={onImportClick}>
        Import tokens
      </button>
    </div>
  );
}
