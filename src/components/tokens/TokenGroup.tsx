interface TokenGroupProps {
  name: string;
  children: React.ReactNode;
}

export function TokenGroup({ name, children }: TokenGroupProps) {
  return (
    <details open>
      <summary
        style={{
          padding: '0.375rem 0.75rem',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          listStyle: 'none',
          userSelect: 'none',
        }}
      >
        {name}
      </summary>
      {children}
    </details>
  );
}
