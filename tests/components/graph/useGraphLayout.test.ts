import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphLayout } from '../../../src/components/graph/useGraphLayout.ts';
import type { GraphNode, GraphLink, WorkerOutMessage } from '../../../src/components/graph/types.ts';
import type { WorkerLike } from '../../../src/components/graph/useGraphLayout.ts';

// Minimal Worker mock
class MockWorker implements WorkerLike {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage(data: unknown) {
    // Simulate worker responding immediately with done positions
    const msg = data as { nodes: { id: string }[] };
    const positions = msg.nodes.map((n, i) => ({ id: n.id, x: i * 50, y: 0 }));
    const out: WorkerOutMessage = { type: 'done', positions };
    setTimeout(() => {
      this.onmessage?.({ data: out } as MessageEvent);
    }, 0);
  }
  terminate() {}
}

const mockFactory = () => new MockWorker();

describe('useGraphLayout', () => {
  const nodes: GraphNode[] = [
    { id: 'a', label: 'a' },
    { id: 'b', label: 'b' },
  ];
  const links: GraphLink[] = [{ source: 'a', target: 'b' }];

  it('starts with isLoading=true and empty positions', () => {
    const { result } = renderHook(() =>
      useGraphLayout(nodes, links, 800, 600, mockFactory)
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.positions.size).toBe(0);
  });

  it('populates positions after worker responds', async () => {
    const { result } = renderHook(() =>
      useGraphLayout(nodes, links, 800, 600, mockFactory)
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.positions.has('a')).toBe(true);
    expect(result.current.positions.has('b')).toBe(true);
  });

  it('returns empty positions when nodes array is empty', async () => {
    const { result } = renderHook(() =>
      useGraphLayout([], [], 800, 600, mockFactory)
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.positions.size).toBe(0);
  });
});
