type View = 'tokens' | 'graph' | 'audit';

interface ViewTabsProps {
  current: View;
  onChange: (view: View) => void;
}

export function ViewTabs({ current, onChange }: ViewTabsProps) {
  const tabs: { id: View; label: string }[] = [
    { id: 'tokens', label: 'Tokens' },
    { id: 'graph', label: 'Graph' },
    { id: 'audit', label: 'Audit' },
  ];
  return (
    <div role="tablist" aria-label="Views" style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
      {tabs.map(tab => {
        const active = current === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            data-testid={`tab-${tab.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 0.75rem',
              fontSize: 'var(--text-sm)',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderBottom: active ? '2px solid var(--color-text-primary)' : '2px solid transparent',
              borderRadius: 0,
              transition: 'color 120ms, border-color 120ms',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
