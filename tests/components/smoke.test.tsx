import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('component test environment', () => {
  it('renders a div', () => {
    render(<div>hello</div>);
    expect(screen.getByText('hello').textContent).toBe('hello');
  });
});
