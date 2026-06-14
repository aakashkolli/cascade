import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { GraphControls } from '../../../src/components/graph/GraphControls.tsx';
import { DEFAULT_FILTER } from '../../../src/components/graph/types.ts';

describe('GraphControls', () => {
  it('renders all filter checkboxes', () => {
    const { getByLabelText } = render(
      <GraphControls filter={DEFAULT_FILTER} onFilterChange={vi.fn()} onZoomReset={vi.fn()} />
    );
    expect(getByLabelText('Base tokens')).toBeInTheDocument();
    expect(getByLabelText('Semantic aliases')).toBeInTheDocument();
    expect(getByLabelText('Component tokens')).toBeInTheDocument();
    expect(getByLabelText('Violations only')).toBeInTheDocument();
  });

  it('renders zoom-reset button', () => {
    const { getByRole } = render(
      <GraphControls filter={DEFAULT_FILTER} onFilterChange={vi.fn()} onZoomReset={vi.fn()} />
    );
    expect(getByRole('button', { name: /reset zoom/i })).toBeInTheDocument();
  });

  it('calls onZoomReset when Reset Zoom clicked', () => {
    const onZoomReset = vi.fn();
    const { getByRole } = render(
      <GraphControls filter={DEFAULT_FILTER} onFilterChange={vi.fn()} onZoomReset={onZoomReset} />
    );
    fireEvent.click(getByRole('button', { name: /reset zoom/i }));
    expect(onZoomReset).toHaveBeenCalledOnce();
  });

  it('calls onFilterChange with toggled showBase when Base tokens toggled', () => {
    const onFilterChange = vi.fn();
    const { getByLabelText } = render(
      <GraphControls filter={DEFAULT_FILTER} onFilterChange={onFilterChange} onZoomReset={vi.fn()} />
    );
    fireEvent.click(getByLabelText('Base tokens'));
    expect(onFilterChange).toHaveBeenCalledWith({ ...DEFAULT_FILTER, showBase: false });
  });

  it('calls onFilterChange with toggled violationsOnly when Violations only toggled', () => {
    const onFilterChange = vi.fn();
    const { getByLabelText } = render(
      <GraphControls filter={DEFAULT_FILTER} onFilterChange={onFilterChange} onZoomReset={vi.fn()} />
    );
    fireEvent.click(getByLabelText('Violations only'));
    expect(onFilterChange).toHaveBeenCalledWith({ ...DEFAULT_FILTER, violationsOnly: true });
  });
});
