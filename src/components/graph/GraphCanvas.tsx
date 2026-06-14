import { useEffect, useRef, useCallback } from 'react';
import type { TokenId } from '../../engine/types.ts';
import {
  NODE_RADIUS,
  NODE_STROKE,
  NODE_FILL,
  LABEL_FONT,
  type NodePosition,
  type NodeStatus,
} from './types.ts';

interface GraphCanvasProps {
  positions: Map<TokenId, NodePosition>;
  nodeStatuses: Map<TokenId, NodeStatus>;
  edges: { from: TokenId; to: TokenId }[];
  selectedId: TokenId | null;
  hoveredId: TokenId | null;
  panX: number;
  panY: number;
  scale: number;
  isLoading: boolean;
  onSelect: (id: TokenId | null) => void;
  onHover: (id: TokenId | null) => void;
  onPanChange: (dx: number, dy: number) => void;
  onScaleChange: (scale: number, originX: number, originY: number) => void;
}

export function GraphCanvas({
  positions,
  nodeStatuses,
  edges,
  selectedId,
  hoveredId,
  panX,
  panY,
  scale,
  isLoading,
  onSelect,
  onHover,
  onPanChange,
  onScaleChange,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const screenToWorld = useCallback(
    (sx: number, sy: number): { x: number; y: number } => ({
      x: (sx - panX) / scale,
      y: (sy - panY) / scale,
    }),
    [panX, panY, scale],
  );

  const hitTest = useCallback(
    (screenX: number, screenY: number): TokenId | null => {
      const world = screenToWorld(screenX, screenY);
      for (const [id, pos] of positions) {
        const dx = world.x - pos.x;
        const dy = world.y - pos.y;
        if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) return id;
      }
      return null;
    },
    [positions, screenToWorld],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(scale, scale);

    // Draw edges
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1.5 / scale;
    for (const edge of edges) {
      const fromPos = positions.get(edge.from);
      const toPos = positions.get(edge.to);
      if (!fromPos || !toPos) continue;
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const [id, pos] of positions) {
      const status: NodeStatus = nodeStatuses.get(id) ?? 'none';
      const isSelected = id === selectedId;
      const isHovered = id === hoveredId;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = NODE_FILL[status];
      ctx.fill();
      ctx.strokeStyle = NODE_STROKE[status];
      ctx.lineWidth = isSelected ? 3 / scale : isHovered ? 2.5 / scale : 1.5 / scale;
      ctx.stroke();

      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_RADIUS + 4 / scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#4F46E5';
        ctx.lineWidth = 2 / scale;
        ctx.stroke();
      }

      // Label
      ctx.font = LABEL_FONT;
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const label = id.split('/').pop() ?? id;
      ctx.fillText(label, pos.x, pos.y + NODE_RADIUS + 4 / scale);
    }

    ctx.restore();
  }, [positions, nodeStatuses, edges, selectedId, hoveredId, panX, panY, scale]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
        draw();
      }
    });
    observer.observe(canvas.parentElement ?? canvas);
    return () => observer.disconnect();
  }, [draw]);

  function getCanvasCoords(e: React.MouseEvent): { x: number; y: number } {
    const rect = canvasRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    const { x, y } = getCanvasCoords(e);
    if (hitTest(x, y)) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent) {
    const { x, y } = getCanvasCoords(e);
    if (isDragging.current) {
      onPanChange(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
      dragStart.current = { x: e.clientX, y: e.clientY };
    } else {
      onHover(hitTest(x, y));
    }
  }

  function handleMouseUp() {
    isDragging.current = false;
  }

  function handleClick(e: React.MouseEvent) {
    const { x, y } = getCanvasCoords(e);
    onSelect(hitTest(x, y));
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    onScaleChange(scale * delta, x, y);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        data-testid="graph-canvas"
        style={{ display: 'block', width: '100%', height: '100%', cursor: 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        aria-hidden="true"
      />
      {isLoading && (
        <div
          data-testid="graph-canvas-spinner"
          role="status"
          aria-label="Computing layout…"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '2rem' }}>⟳</span>
          <span style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}>Computing graph layout…</span>
        </div>
      )}
    </div>
  );
}
