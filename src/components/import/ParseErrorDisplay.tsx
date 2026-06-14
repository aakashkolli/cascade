import type { ParseError } from '../../io/import/types';

interface ParseErrorDisplayProps {
  errors: ParseError[];
}

export function ParseErrorDisplay({ errors }: ParseErrorDisplayProps) {
  if (errors.length === 0) return null;
  return (
    <ul data-testid="parse-errors" aria-label="Parse errors" style={{ margin: 0, padding: '0 0 0 1rem' }}>
      {errors.map((err, i) => (
        <li key={i} style={{ color: 'var(--color-status-fail)', fontSize: 'var(--text-sm)' }}>
          <strong>Line {err.line}:</strong> {err.message}
          {err.suggestion && (
            <div style={{ color: 'var(--color-text-muted)' }}>Suggestion: {err.suggestion}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
