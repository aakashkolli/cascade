import { ViewTabs } from './ViewTabs';
import { ViolationCounter } from './ViolationCounter';
import { ImportButton } from './ImportButton';
import { ExportButton } from './ExportButton';

type View = 'tokens' | 'graph' | 'audit';

interface HeaderProps {
  onImportClick: () => void;
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Header({ onImportClick, currentView, onViewChange }: HeaderProps) {
  return (
    <header
      data-testid="app-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '0 1.25rem',
        height: '48px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        flexShrink: 0,
      }}
    >
      <span style={{
        fontWeight: 700,
        fontSize: 'var(--text-base)',
        letterSpacing: '-0.02em',
        color: 'var(--color-text-primary)',
      }}>
        Cascade
      </span>

      <ViewTabs current={currentView} onChange={onViewChange} />

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ViolationCounter />
        <div style={{ width: '1px', height: '16px', background: 'var(--color-border)' }} />
        <ImportButton onClick={onImportClick} />
        <ExportButton />
      </div>
    </header>
  );
}
