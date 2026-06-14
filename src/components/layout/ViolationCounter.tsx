import { useViolationCount } from '../../store/selectors';

export function ViolationCounter() {
  const count = useViolationCount();
  return (
    <span
      data-testid="violation-count"
      style={{
        fontSize: 'var(--text-sm)',
        color: count > 0 ? 'var(--color-status-fail)' : 'var(--color-text-muted)',
        fontWeight: count > 0 ? 600 : 400,
        letterSpacing: count > 0 ? '-0.01em' : undefined,
      }}
    >
      {count > 0 ? `✗ ${count} violation${count === 1 ? '' : 's'}` : '✓ 0 violations'}
    </span>
  );
}
