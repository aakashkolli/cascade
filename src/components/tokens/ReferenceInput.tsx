import type { TokenId } from '../../engine/types';

interface ReferenceInputProps {
  currentRefId: TokenId;
  allTokenIds: TokenId[];  // all available tokens to pick from (excluding self)
  onChange: (newRefId: TokenId) => void;
}

export function ReferenceInput({ currentRefId, allTokenIds, onChange }: ReferenceInputProps) {
  return (
    <div>
      <label htmlFor="reference-input">References</label>
      <select
        id="reference-input"
        aria-label="References"
        value={currentRefId}
        onChange={e => onChange(e.target.value as TokenId)}
      >
        {allTokenIds.map(id => (
          <option key={id} value={id}>{id}</option>
        ))}
      </select>
    </div>
  );
}
