import type { ResolvedColor } from '../../engine/types';

interface PropagationLogProps {
  resolved: ResolvedColor | undefined;
}

export function PropagationLog({ resolved }: PropagationLogProps) {
  if (!resolved) return null;
  return (
    <div data-testid="propagation-log" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
      <div>Resolved: <code>{resolved.hex}</code></div>
      <div>Luminance: {resolved.luminance.toFixed(4)}</div>
    </div>
  );
}
