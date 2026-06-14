type ImportFormat = 'style-dictionary' | 'figma-tokens' | 'tailwind' | 'css';

interface FormatTabsProps {
  current: ImportFormat;
  onChange: (f: ImportFormat) => void;
}

const FORMATS: { id: ImportFormat; label: string }[] = [
  { id: 'style-dictionary', label: 'Style Dictionary' },
  { id: 'figma-tokens', label: 'Figma Tokens' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'css', label: 'CSS' },
];

export function FormatTabs({ current, onChange }: FormatTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Import format"
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        gap: 0,
      }}
    >
      {FORMATS.map(f => {
        const active = current === f.id;
        return (
          <button
            key={f.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.id)}
            data-testid={`format-tab-${f.id}`}
            style={{
              padding: '0.5rem 0.875rem',
              fontSize: 'var(--text-sm)',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              borderBottom: active ? '2px solid var(--color-text-primary)' : '2px solid transparent',
              marginBottom: '-1px',
              borderRadius: 0,
              transition: 'color 100ms, border-color 100ms',
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

export type { ImportFormat };
