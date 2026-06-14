import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GraphView } from '../../../src/components/graph/GraphView.tsx';
import { TokenSystemProvider } from '../../../src/TokenSystemProvider.tsx';

function renderWithProvider(ui: React.ReactElement) {
  return render(<TokenSystemProvider>{ui}</TokenSystemProvider>);
}

describe('GraphView', () => {
  it('renders without crashing', () => {
    const { getByTestId } = renderWithProvider(
      <GraphView selectedId={null} onSelectToken={vi.fn()} />
    );
    expect(getByTestId('graph-view')).toBeInTheDocument();
  });

  it('shows empty state when no tokens are loaded', () => {
    const { getByText } = renderWithProvider(
      <GraphView selectedId={null} onSelectToken={vi.fn()} />
    );
    expect(getByText(/no token system/i)).toBeInTheDocument();
  });

  it('renders controls panel', () => {
    const { getByTestId } = renderWithProvider(
      <GraphView selectedId={null} onSelectToken={vi.fn()} />
    );
    expect(getByTestId('graph-controls')).toBeInTheDocument();
  });

  it('renders the accessible tree', () => {
    const { getByRole } = renderWithProvider(
      <GraphView selectedId={null} onSelectToken={vi.fn()} />
    );
    expect(getByRole('tree')).toBeInTheDocument();
  });
});
