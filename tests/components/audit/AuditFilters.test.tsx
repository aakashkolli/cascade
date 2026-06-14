import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { AuditFilters, DEFAULT_AUDIT_FILTER } from '../../../src/components/audit/AuditFilters.tsx';

describe('AuditFilters', () => {
  it('renders all three checkboxes', () => {
    const { getByLabelText } = render(
      <AuditFilters filter={DEFAULT_AUDIT_FILTER} onFilterChange={vi.fn()} totalCount={10} visibleCount={10} />
    );
    expect(getByLabelText(/fail/i)).toBeInTheDocument();
    expect(getByLabelText(/aa/i)).toBeInTheDocument();
    expect(getByLabelText(/aaa/i)).toBeInTheDocument();
  });

  it('shows pair counts', () => {
    const { getByText } = render(
      <AuditFilters filter={DEFAULT_AUDIT_FILTER} onFilterChange={vi.fn()} totalCount={20} visibleCount={15} />
    );
    expect(getByText(/15.*20/)).toBeInTheDocument();
  });

  it('calls onFilterChange when fail checkbox toggled', () => {
    const onFilterChange = vi.fn();
    const { getByLabelText } = render(
      <AuditFilters filter={DEFAULT_AUDIT_FILTER} onFilterChange={onFilterChange} totalCount={5} visibleCount={5} />
    );
    fireEvent.click(getByLabelText(/fail/i));
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ showFail: false }));
  });

  it('renders data-testid', () => {
    const { getByTestId } = render(
      <AuditFilters filter={DEFAULT_AUDIT_FILTER} onFilterChange={vi.fn()} totalCount={0} visibleCount={0} />
    );
    expect(getByTestId('audit-filters')).toBeInTheDocument();
  });
});
