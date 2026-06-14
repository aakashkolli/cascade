import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GraphTree } from '../../../src/components/graph/GraphTree.tsx';
import type { TokenId } from '../../../src/engine/types.ts';

const nodes = [
  { id: 'color/brand/500' as TokenId, label: 'brand-500' },
  { id: 'semantic/primary' as TokenId, label: 'primary' },
  { id: 'component/button-bg' as TokenId, label: 'button-bg' },
];

describe('GraphTree', () => {
  it('renders with role="tree"', () => {
    const { getByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    expect(getByRole('tree')).toBeInTheDocument();
  });

  it('renders all nodes as treeitems', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    expect(getAllByRole('treeitem')).toHaveLength(3);
  });

  it('only one treeitem has tabindex=0 at a time (roving tabindex)', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    const items = getAllByRole('treeitem');
    const tabZeroItems = items.filter(el => el.getAttribute('tabindex') === '0');
    expect(tabZeroItems).toHaveLength(1);
  });

  it('first item has tabindex=0 initially', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    const items = getAllByRole('treeitem');
    expect(items[0]).toHaveAttribute('tabindex', '0');
    expect(items[1]).toHaveAttribute('tabindex', '-1');
    expect(items[2]).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowDown moves focus to next item', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    const items = getAllByRole('treeitem');
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(items[1]).toHaveAttribute('tabindex', '0');
    expect(items[0]).toHaveAttribute('tabindex', '-1');
  });

  it('ArrowUp moves focus to previous item', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    const items = getAllByRole('treeitem');
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    fireEvent.keyDown(items[1], { key: 'ArrowUp' });
    expect(items[0]).toHaveAttribute('tabindex', '0');
  });

  it('ArrowDown wraps from last to first', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={vi.fn()} />
    );
    const items = getAllByRole('treeitem');
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    fireEvent.keyDown(items[1], { key: 'ArrowDown' });
    fireEvent.keyDown(items[2], { key: 'ArrowDown' });
    expect(items[0]).toHaveAttribute('tabindex', '0');
  });

  it('Enter key calls onSelect with the token id', () => {
    const onSelect = vi.fn();
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={null} onSelect={onSelect} />
    );
    const items = getAllByRole('treeitem');
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('color/brand/500');
  });

  it('marks the selected item with aria-selected="true"', () => {
    const { getAllByRole } = render(
      <GraphTree nodes={nodes} selectedId={'semantic/primary' as TokenId} onSelect={vi.fn()} />
    );
    const items = getAllByRole('treeitem');
    expect(items[1]).toHaveAttribute('aria-selected', 'true');
    expect(items[0]).toHaveAttribute('aria-selected', 'false');
  });
});
