import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from '../../src/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it('renders the app header', () => {
    render(<App />);
    expect(screen.getByTestId('app-header')).toBeDefined();
  });
});
