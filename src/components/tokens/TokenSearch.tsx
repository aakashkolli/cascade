interface TokenSearchProps {
  query: string;
  onChange: (q: string) => void;
}

export function TokenSearch({ query, onChange }: TokenSearchProps) {
  return (
    <input
      type="search"
      value={query}
      onChange={e => onChange(e.target.value)}
      placeholder="Search tokens…"
      aria-label="Search tokens"
      data-testid="token-search"
    />
  );
}
