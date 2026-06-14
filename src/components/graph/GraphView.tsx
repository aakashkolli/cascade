import { useState, useCallback, useMemo } from 'react';
import type { TokenId, WCAGLevel } from '../../engine/types.ts';
import { useTokens, useViolations, useEdges, useEdgeMeta, useResolvedValues } from '../../store/selectors.ts';
import { useGraphLayout } from './useGraphLayout.ts';
import { GraphCanvas } from './GraphCanvas.tsx';
import { GraphTree } from './GraphTree.tsx';
import { GraphControls } from './GraphControls.tsx';
import { GraphTooltip } from './GraphTooltip.tsx';
import { classifyToken } from './classifyToken.ts';
import {
  DEFAULT_FILTER,
  type FilterState,
  type GraphNode,
  type GraphLink,
  type NodeStatus,
} from './types.ts';

interface GraphViewProps {
  selectedId: TokenId | null;
  onSelectToken: (id: TokenId | null) => void;
}

function wcagToStatus(level: WCAGLevel): NodeStatus {
  if (level === 'fail') return 'fail';
  if (level === 'AA-large' || level === 'AA') return 'warn';
  return 'pass';
}

export function GraphView({ selectedId, onSelectToken }: GraphViewProps) {
  const tokens = useTokens();
  const violations = useViolations();
  const edges = useEdges();
  const edgeMeta = useEdgeMeta();
  const resolvedValues = useResolvedValues();

  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [hoveredId, setHoveredId] = useState<TokenId | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [scale, setScale] = useState(1);

  // Per-token worst violation status
  const nodeStatuses = useMemo((): Map<TokenId, NodeStatus> => {
    const map = new Map<TokenId, NodeStatus>();
    for (const [id] of tokens) map.set(id, 'none');
    for (const [, result] of violations) {
      const st = wcagToStatus(result.level);
      const fgCurrent = map.get(result.foregroundId) ?? 'none';
      const bgCurrent = map.get(result.backgroundId) ?? 'none';
      // Escalate: fail > warn > pass > none
      const rank: Record<NodeStatus, number> = { fail: 3, warn: 2, pass: 1, none: 0 };
      if (rank[st] > rank[fgCurrent]) map.set(result.foregroundId, st);
      if (rank[st] > rank[bgCurrent]) map.set(result.backgroundId, st);
    }
    return map;
  }, [tokens, violations]);

  // Per-token violation count (failures only)
  const violationCounts = useMemo((): Map<TokenId, number> => {
    const map = new Map<TokenId, number>();
    for (const [, result] of violations) {
      if (result.level === 'fail') {
        map.set(result.foregroundId, (map.get(result.foregroundId) ?? 0) + 1);
        map.set(result.backgroundId, (map.get(result.backgroundId) ?? 0) + 1);
      }
    }
    return map;
  }, [violations]);

  // Apply category and violations-only filter
  const visibleNodes = useMemo((): GraphNode[] => {
    const result: GraphNode[] = [];
    for (const [id, token] of tokens) {
      const category = classifyToken(token);
      if (category === 'base' && !filter.showBase) continue;
      if (category === 'semantic' && !filter.showSemantic) continue;
      if (category === 'component' && !filter.showComponent) continue;
      if (filter.violationsOnly && !violationCounts.has(id)) continue;
      result.push({ id, label: token.name });
    }
    return result;
  }, [tokens, filter, violationCounts]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map(n => n.id)),
    [visibleNodes],
  );

  // Only include reference/computed edges (not contrast-pair, which clutters the graph)
  const visibleLinks = useMemo((): GraphLink[] => {
    const links: GraphLink[] = [];
    for (const [from, toList] of edges) {
      if (!visibleIds.has(from)) continue;
      for (const to of toList) {
        if (!visibleIds.has(to)) continue;
        const meta = edgeMeta.get(`${from}→${to}`);
        if (meta === 'contrast-pair') continue;
        links.push({ source: from, target: to });
      }
    }
    return links;
  }, [edges, edgeMeta, visibleIds]);

  const { positions, isLoading } = useGraphLayout(
    visibleNodes,
    visibleLinks,
    800,
    600,
  );

  const canvasEdges = useMemo(
    () => visibleLinks.map(l => ({ from: l.source, to: l.target })),
    [visibleLinks],
  );

  const handlePanChange = useCallback((dx: number, dy: number) => {
    setPanX(p => p + dx);
    setPanY(p => p + dy);
  }, []);

  const handleScaleChange = useCallback(
    (newScale: number, originX: number, originY: number) => {
      const clamped = Math.max(0.1, Math.min(4, newScale));
      setPanX(px => originX - (originX - px) * (clamped / scale));
      setPanY(py => originY - (originY - py) * (clamped / scale));
      setScale(clamped);
    },
    [scale],
  );

  const handleZoomReset = useCallback(() => {
    setPanX(0);
    setPanY(0);
    setScale(1);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  // Empty state: no tokens loaded yet
  if (tokens.size === 0) {
    return (
      <div
        data-testid="graph-view"
        style={{ display: 'flex', height: '100%', overflow: 'hidden' }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No token system yet — import tokens to see the graph.</p>
        </div>
        <GraphControls filter={filter} onFilterChange={setFilter} onZoomReset={handleZoomReset} />
        <GraphTree nodes={[]} selectedId={null} onSelect={() => {}} />
      </div>
    );
  }

  const noMatch = visibleNodes.length === 0;
  const hoveredToken = hoveredId ? tokens.get(hoveredId) : null;

  return (
    <div
      data-testid="graph-view"
      style={{ display: 'flex', height: '100%', overflow: 'hidden' }}
      onMouseMove={handleMouseMove}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {noMatch ? (
          <div style={{ padding: '2rem', color: 'var(--color-text-muted)' }}>
            No tokens match this filter. Clear filters to see all tokens.
          </div>
        ) : (
          <GraphCanvas
            positions={positions}
            nodeStatuses={nodeStatuses}
            edges={canvasEdges}
            selectedId={selectedId}
            hoveredId={hoveredId}
            panX={panX}
            panY={panY}
            scale={scale}
            isLoading={isLoading}
            onSelect={onSelectToken}
            onHover={setHoveredId}
            onPanChange={handlePanChange}
            onScaleChange={handleScaleChange}
          />
        )}
        <GraphTree nodes={visibleNodes} selectedId={selectedId} onSelect={onSelectToken} />
      </div>
      <GraphControls filter={filter} onFilterChange={setFilter} onZoomReset={handleZoomReset} />
      {hoveredId && hoveredToken && (
        <GraphTooltip
          tokenId={hoveredId}
          resolvedHex={resolvedValues.get(hoveredId)?.hex ?? '#888'}
          violationCount={violationCounts.get(hoveredId) ?? 0}
          dependencyCount={(edges.get(hoveredId) ?? []).length}
          status={nodeStatuses.get(hoveredId) ?? 'none'}
          screenX={tooltipPos.x}
          screenY={tooltipPos.y}
        />
      )}
    </div>
  );
}
