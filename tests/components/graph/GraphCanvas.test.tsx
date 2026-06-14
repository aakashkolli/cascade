import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GraphCanvas } from '../../../src/components/graph/GraphCanvas.tsx';
import type { TokenId } from '../../../src/engine/types.ts';
import type { NodePosition, NodeStatus } from '../../../src/components/graph/types.ts';

const makePositions = (...ids: string[]): Map<TokenId, NodePosition> => {
  const map = new Map<TokenId, NodePosition>();
  ids.forEach((id, i) => map.set(id, { x: 50 + i * 100, y: 100 }));
  return map;
};

const makeStatuses = (...ids: string[]): Map<TokenId, NodeStatus> => {
  const map = new Map<TokenId, NodeStatus>();
  ids.forEach(id => map.set(id, 'none'));
  return map;
};

const baseProps = {
  edges: [] as { from: TokenId; to: TokenId }[],
  selectedId: null as TokenId | null,
  hoveredId: null as TokenId | null,
  panX: 0,
  panY: 0,
  scale: 1,
  isLoading: false,
  onSelect: vi.fn(),
  onHover: vi.fn(),
  onPanChange: vi.fn(),
  onScaleChange: vi.fn(),
};

describe('GraphCanvas', () => {
  it('renders a canvas element', () => {
    const { getByTestId } = render(
      <GraphCanvas
        {...baseProps}
        positions={makePositions('a')}
        nodeStatuses={makeStatuses('a')}
      />
    );
    expect(getByTestId('graph-canvas')).toBeInTheDocument();
  });

  it('shows spinner overlay when isLoading=true', () => {
    const { getByTestId } = render(
      <GraphCanvas
        {...baseProps}
        positions={new Map()}
        nodeStatuses={new Map()}
        isLoading={true}
      />
    );
    expect(getByTestId('graph-canvas-spinner')).toBeInTheDocument();
  });

  it('does not show spinner when isLoading=false', () => {
    const { queryByTestId } = render(
      <GraphCanvas
        {...baseProps}
        positions={makePositions('a')}
        nodeStatuses={makeStatuses('a')}
        isLoading={false}
      />
    );
    expect(queryByTestId('graph-canvas-spinner')).not.toBeInTheDocument();
  });

  it('calls onSelect with correct tokenId on click within node radius', () => {
    const onSelect = vi.fn();
    const positions = new Map<TokenId, NodePosition>([['a', { x: 100, y: 100 }]]);
    const { getByTestId } = render(
      <GraphCanvas
        {...baseProps}
        positions={positions}
        nodeStatuses={makeStatuses('a')}
        onSelect={onSelect}
      />
    );
    const canvas = getByTestId('graph-canvas');
    // getBoundingClientRect returns zeros in jsdom, so screenToWorld maps (100,100) -> world (100,100)
    fireEvent.click(canvas, { clientX: 100, clientY: 100 });
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('calls onSelect(null) when clicking empty space', () => {
    const onSelect = vi.fn();
    const positions = new Map<TokenId, NodePosition>([['a', { x: 100, y: 100 }]]);
    const { getByTestId } = render(
      <GraphCanvas
        {...baseProps}
        positions={positions}
        nodeStatuses={makeStatuses('a')}
        onSelect={onSelect}
      />
    );
    const canvas = getByTestId('graph-canvas');
    fireEvent.click(canvas, { clientX: 500, clientY: 500 });
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('calls onHover with tokenId when mouse moves over a node', () => {
    const onHover = vi.fn();
    const positions = new Map<TokenId, NodePosition>([['a', { x: 100, y: 100 }]]);
    const { getByTestId } = render(
      <GraphCanvas
        {...baseProps}
        positions={positions}
        nodeStatuses={makeStatuses('a')}
        onHover={onHover}
      />
    );
    const canvas = getByTestId('graph-canvas');
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    expect(onHover).toHaveBeenCalledWith('a');
  });
});
