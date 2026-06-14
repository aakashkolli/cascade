import { useRef, useEffect } from 'react';
import type { TokenId } from '../../engine/types';
import { useTokens, useResolvedValues, useViolations, useStoreActions } from '../../store/selectors';
import { ColorPicker } from './ColorPicker';
import { ReferenceInput } from './ReferenceInput';
import { ContrastPairs } from './ContrastPairs';
import { PropagationLog } from './PropagationLog';

interface TokenDetailPanelProps {
  tokenId: TokenId;
  onClose: () => void;
}

export function TokenDetailPanel({ tokenId, onClose }: TokenDetailPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tokens = useTokens();
  const resolvedValues = useResolvedValues();
  const violations = useViolations();
  const { setTokenValue } = useStoreActions();

  const token = tokens.get(tokenId);
  const resolved = resolvedValues.get(tokenId);

  // Move focus to heading when tokenId changes
  useEffect(() => {
    headingRef.current?.focus();
  }, [tokenId]);

  // Escape closes
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  }

  if (!token) return null;

  // Build list of all other token IDs for ReferenceInput
  const allTokenIds = [...tokens.keys()].filter(id => id !== tokenId);

  return (
    <aside
      data-testid="detail-panel"
      onKeyDown={handleKeyDown}
      style={{
        width: 320,
        borderLeft: '1px solid var(--color-border)',
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h2
        ref={headingRef}
        data-testid="detail-panel-heading"
        tabIndex={-1}
        style={{ margin: 0, fontSize: 'var(--text-base)', fontFamily: 'var(--font-mono)' }}
      >
        {token.name}
      </h2>

      {token.value.type === 'hex' && (
        <ColorPicker
          hex={resolved?.hex ?? token.value.value}
          onChange={newHex => setTokenValue(tokenId, { type: 'hex', value: newHex })}
        />
      )}

      {token.value.type === 'reference' && (
        <ReferenceInput
          currentRefId={token.value.tokenId}
          allTokenIds={allTokenIds}
          onChange={newRefId => setTokenValue(tokenId, { type: 'reference', tokenId: newRefId })}
        />
      )}

      <section aria-label="Contrast pairs">
        <h3 style={{ fontSize: 'var(--text-sm)', margin: '0 0 0.5rem' }}>Contrast Pairs</h3>
        <ContrastPairs tokenId={tokenId} violations={violations} />
      </section>

      <PropagationLog resolved={resolved} />
    </aside>
  );
}
