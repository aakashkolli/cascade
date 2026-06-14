import type { TokenId } from '../../engine/types';
import { useTokens } from '../../store/selectors';
import { TokenList } from './TokenList';
import { TokenDetailPanel } from './TokenDetailPanel';
import { EmptyState } from '../shared/EmptyState';

interface TokensViewProps {
  onImportClick: () => void;
  selectedId: TokenId | null;
  onSelect: (id: TokenId, el: HTMLElement) => void;
  onClose: () => void;
}

export function TokensView({ onImportClick, selectedId, onSelect, onClose }: TokensViewProps) {
  const tokens = useTokens();

  if (tokens.size === 0) {
    return <EmptyState onImportClick={onImportClick} />;
  }

  return (
    <div
      data-testid="tokens-view"
      style={{ display: 'flex', height: '100%', overflow: 'hidden' }}
    >
      <div style={{ flex: 1, borderRight: '1px solid var(--color-border)', overflowY: 'auto' }}>
        <TokenList selectedTokenId={selectedId} onSelect={onSelect} />
      </div>
      {selectedId !== null && (
        <TokenDetailPanel tokenId={selectedId} onClose={onClose} />
      )}
    </div>
  );
}
