import { useEffect, useRef } from 'react';
import { useTokenGraphStore } from './store/tokenGraphStore';
import { useShallow } from 'zustand/shallow';

export function TokenSystemProvider({ children }: { children: React.ReactNode }) {
  const { loadFromHash, serializeToHash } = useTokenGraphStore(
    useShallow(s => ({ loadFromHash: s.loadFromHash, serializeToHash: s.serializeToHash }))
  );
  const tokens = useTokenGraphStore(s => s.tokens);
  const initialized = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from URL hash on mount only
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const hash = window.location.hash.slice(1);
    if (hash) loadFromHash(hash);
  }, [loadFromHash]);

  // Debounced hash update when tokens change (skip first render)
  useEffect(() => {
    if (!initialized.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const hash = serializeToHash();
      if (hash) window.history.replaceState(null, '', '#' + hash);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tokens, serializeToHash]);

  return <>{children}</>;
}
