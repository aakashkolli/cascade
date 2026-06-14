import type { Token, ResolvedColor, TokenId } from '../../engine/types';

interface TokenRowProps {
  token: Token;
  resolved: ResolvedColor | undefined;
  violationCount: number;
  isSelected: boolean;
  onSelect: (id: TokenId, triggerEl: HTMLElement) => void;
}

export function TokenRow({ token, resolved, violationCount, isSelected, onSelect }: TokenRowProps) {
  const hex = resolved?.hex ?? '#CCCCCC';

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    onSelect(token.id, e.currentTarget);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(token.id, e.currentTarget);
    }
  }

  return (
    <button
      role="option"
      aria-selected={isSelected}
      data-testid={`token-${token.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.5rem 0.75rem',
        background: isSelected ? 'var(--color-surface)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          borderRadius: 3,
          background: hex,
          border: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>
        {token.name}
      </span>
      {violationCount > 0 && (
        <span
          aria-label={`${violationCount} violations`}
          style={{ color: 'var(--color-status-fail)', fontSize: 'var(--text-xs)', fontWeight: 600 }}
        >
          ✗ {violationCount}
        </span>
      )}
    </button>
  );
}
