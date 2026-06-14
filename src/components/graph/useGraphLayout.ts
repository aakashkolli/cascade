import { useState, useEffect, useRef } from 'react';
import type { GraphNode, GraphLink, NodePosition, WorkerOutMessage } from './types.ts';
import type { TokenId } from '../../engine/types.ts';

/** Minimal Worker interface — allows no-arg mock constructors in tests. */
export interface WorkerLike {
  onmessage: ((e: MessageEvent) => void) | null;
  postMessage(data: unknown): void;
  terminate(): void;
}

/** Injectable factory — returns a WorkerLike. Used to inject mocks in tests. */
export type WorkerFactory = () => WorkerLike;

export function useGraphLayout(
  nodes: GraphNode[],
  links: GraphLink[],
  width: number,
  height: number,
  workerFactory?: WorkerFactory,
): { positions: Map<TokenId, NodePosition>; isLoading: boolean } {
  const [positions, setPositions] = useState<Map<TokenId, NodePosition>>(new Map());
  const [isLoading, setIsLoading] = useState(nodes.length > 0);
  const workerRef = useRef<WorkerLike | null>(null);

  const topologyKey =
    nodes.map(n => n.id).sort().join(',') +
    '|' +
    links.map(l => `${l.source}->${l.target}`).sort().join(',');

  useEffect(() => {
    // Terminate any previous worker
    workerRef.current?.terminate();
    workerRef.current = null;

    if (nodes.length === 0) {
      // Reset to idle state when graph becomes empty — intentional sync setState
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPositions(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    let worker: WorkerLike;
    try {
      worker = workerFactory
        ? workerFactory()
        : new Worker(new URL('./graphWorker.ts', import.meta.url), { type: 'module' });
    } catch {
      // Worker not available (e.g. test environment) — skip layout
      setIsLoading(false);
      return;
    }

    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
      const map = new Map<TokenId, NodePosition>();
      for (const p of e.data.positions) map.set(p.id, { x: p.x, y: p.y });
      setPositions(map);
      if (e.data.type === 'done') {
        setIsLoading(false);
      }
    };

    worker.postMessage({ nodes: nodes.map(n => ({ id: n.id })), links, width, height });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topologyKey, width, height]);

  return { positions, isLoading };
}
