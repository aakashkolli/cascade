import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Layout } from '../../../src/components/layout/Layout.tsx';
import { TokenSystemProvider } from '../../../src/TokenSystemProvider.tsx';

function wrap(ui: React.ReactElement) {
  return render(<TokenSystemProvider>{ui}</TokenSystemProvider>);
}

describe('Layout responsive', () => {
  it('renders app header', () => {
    const { getByTestId } = wrap(
      <Layout onImportClick={() => {}} importOpen={false} onImportClose={() => {}} />
    );
    expect(getByTestId('app-header')).toBeInTheDocument();
  });

  it('all three tab buttons are present', () => {
    const { getByTestId } = wrap(
      <Layout onImportClick={() => {}} importOpen={false} onImportClose={() => {}} />
    );
    expect(getByTestId('tab-tokens')).toBeInTheDocument();
    expect(getByTestId('tab-graph')).toBeInTheDocument();
    expect(getByTestId('tab-audit')).toBeInTheDocument();
  });

  it('main content area exists', () => {
    const { container } = wrap(
      <Layout onImportClick={() => {}} importOpen={false} onImportClose={() => {}} />
    );
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
