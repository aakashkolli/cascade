import { useState, useRef, useCallback } from 'react';
import type { TokenId } from '../../engine/types.ts';
import type { GraphNode } from './types.ts';

interface GraphTreeProps {
  nodes: GraphNode[];
  selectedId: TokenId | null;
  onSelect: (id: TokenId) => void;
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function GraphTree({ nodes, selectedId, onSelect }: GraphTreeProps) {
  const [focusIdx, setFocusIdx] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const moveFocus = useCallback(
    (nextIdx: number) => {
      if (nodes.length === 0) return;
      const clamped = ((nextIdx % nodes.length) + nodes.length) % nodes.length;
      setFocusIdx(clamped);
      itemRefs.current[clamped]?.focus();
    },
    [nodes.length],
  );

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveFocus(idx + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveFocus(idx - 1);
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(0);
        break;
      case 'End':
        e.preventDefault();
        moveFocus(nodes.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(nodes[idx].id);
        break;
    }
  }

  return (
    <div style={SR_ONLY}>
      <ul role="tree" aria-label="Token dependency graph">
        {nodes.map((node, idx) => (
          <li
            key={node.id}
            ref={(el) => { itemRefs.current[idx] = el; }}
            role="treeitem"
            tabIndex={idx === focusIdx ? 0 : -1}
            aria-selected={node.id === selectedId}
            data-token-id={node.id}
            onClick={() => {
              setFocusIdx(idx);
              onSelect(node.id);
            }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{ listStyle: 'none', cursor: 'pointer' }}
          >
            {node.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
