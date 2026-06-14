import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AuditView } from '../../../src/components/audit/AuditView.tsx';
import { TokenSystemProvider } from '../../../src/TokenSystemProvider.tsx';

function wrap(ui: React.ReactElement) {
  return render(<TokenSystemProvider>{ui}</TokenSystemProvider>);
}

describe('AuditView', () => {
  it('renders the audit view container', () => {
    const { getByTestId } = wrap(<AuditView />);
    expect(getByTestId('audit-view')).toBeInTheDocument();
  });

  it('shows compliance empty state when no violations', () => {
    const { getByText } = wrap(<AuditView />);
    expect(getByText(/no contrast violations/i)).toBeInTheDocument();
  });

  it('renders download CSV button', () => {
    const { getByRole } = wrap(<AuditView />);
    expect(getByRole('button', { name: /csv/i })).toBeInTheDocument();
  });

  it('shows Contrast Audit heading', () => {
    const { getByRole } = wrap(<AuditView />);
    expect(getByRole('heading', { name: /contrast audit/i })).toBeInTheDocument();
  });
});
