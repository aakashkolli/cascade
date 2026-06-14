import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AuditTable } from '../../../src/components/audit/AuditTable.tsx';
import type { ContrastResult } from '../../../src/engine/types.ts';

const mockResult: ContrastResult = {
  foregroundId: 'color/foreground',
  backgroundId: 'color/background',
  ratio: 2.5,
  level: 'fail',
  aaPass: false,
  aaLargePass: false,
  aaaPass: false,
  aaaLargePass: false,
};

const resolvedValues = new Map([
  ['color/foreground', { hex: '#333333' }],
  ['color/background', { hex: '#FFFFFF' }],
]);

describe('AuditTable', () => {
  it('renders a row for each result', () => {
    const { getAllByRole } = render(
      <AuditTable
        rows={[mockResult]}
        resolvedValues={resolvedValues as any}
        expandedKeys={new Set()}
        onToggleExpand={vi.fn()}
      />
    );
    expect(getAllByRole('row')).toHaveLength(2); // header + 1 data row
  });

  it('shows foreground id in row', () => {
    const { getByText } = render(
      <AuditTable
        rows={[mockResult]}
        resolvedValues={resolvedValues as any}
        expandedKeys={new Set()}
        onToggleExpand={vi.fn()}
      />
    );
    expect(getByText('foreground')).toBeInTheDocument();
  });

  it('shows contrast ratio', () => {
    const { getByText } = render(
      <AuditTable
        rows={[mockResult]}
        resolvedValues={resolvedValues as any}
        expandedKeys={new Set()}
        onToggleExpand={vi.fn()}
      />
    );
    expect(getByText('2.50:1')).toBeInTheDocument();
  });

  it('shows level badge', () => {
    const { getByText } = render(
      <AuditTable
        rows={[mockResult]}
        resolvedValues={resolvedValues as any}
        expandedKeys={new Set()}
        onToggleExpand={vi.fn()}
      />
    );
    expect(getByText(/fail/i)).toBeInTheDocument();
  });

  it('renders empty message when rows is empty', () => {
    const { getByText } = render(
      <AuditTable
        rows={[]}
        resolvedValues={new Map()}
        expandedKeys={new Set()}
        onToggleExpand={vi.fn()}
      />
    );
    expect(getByText(/no contrast pairs/i)).toBeInTheDocument();
  });
});
