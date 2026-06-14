import { useState } from 'react';
import { useTokens, useViolations, useResolvedValues } from '../../store/selectors';
import type { TokenId } from '../../engine/types';
import { TokenSearch } from './TokenSearch';
import { TokenGroup } from './TokenGroup';
import { TokenRow } from './TokenRow';

interface TokenListProps {
  selectedTokenId: TokenId | null;
  onSelect: (id: TokenId, triggerEl: HTMLElement) => void;
}

export function TokenList({ selectedTokenId, onSelect }: TokenListProps) {
  const [query, setQuery] = useState('');
  const tokens = useTokens();
  const violations = useViolations();
  const resolvedValues = useResolvedValues();

  // Count violations per token
  function getViolationCount(tokenId: TokenId): number {
    let count = 0;
    for (const result of violations.values()) {
      if (result.foregroundId === tokenId || result.backgroundId === tokenId) count++;
    }
    return count;
  }

  // Filter by search query
  const filtered = [...tokens.values()].filter(t =>
    query === '' || t.name.toLowerCase().includes(query.toLowerCase())
  );

  // Group by token.group
  const groups = new Map<string, typeof filtered>();
  for (const token of filtered) {
    const g = token.group || 'Ungrouped';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(token);
  }

  return (
    <div data-testid="token-list" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '0.5rem' }}>
        <TokenSearch query={query} onChange={setQuery} />
      </div>
      <div
        role="listbox"
        aria-label="Tokens"
        style={{ flex: 1, overflowY: 'auto' }}
      >
        {groups.size === 0 && (
          <p style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>No tokens match your search.</p>
        )}
        {[...groups.entries()].map(([groupName, groupTokens]) => (
          <TokenGroup key={groupName} name={groupName}>
            {groupTokens.map(token => (
              <TokenRow
                key={token.id}
                token={token}
                resolved={resolvedValues.get(token.id)}
                violationCount={getViolationCount(token.id)}
                isSelected={selectedTokenId === token.id}
                onSelect={onSelect}
              />
            ))}
          </TokenGroup>
        ))}
      </div>
    </div>
  );
}
