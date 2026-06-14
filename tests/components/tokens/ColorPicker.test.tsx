import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ColorPicker } from '../../../src/components/tokens/ColorPicker';

describe('ColorPicker', () => {
  it('renders with correct slider values for a given hex', () => {
    render(<ColorPicker hex="#FF0000" onChange={() => {}} />);
    const hueSlider = screen.getByRole('slider', { name: 'Hue' });
    // #FF0000 is hue=0
    expect(hueSlider.getAttribute('aria-valuenow')).toBe('0');
  });

  it('ArrowRight on Hue slider increments hue by 1 and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker hex="#FF0000" onChange={onChange} />);
    const hueSlider = screen.getByRole('slider', { name: 'Hue' });
    hueSlider.focus();
    await user.keyboard('[ArrowRight]');
    expect(onChange).toHaveBeenCalledOnce();
    // hue incremented by 1, saturation=100%, lightness=50% → should produce a reddish color
    const newHex = onChange.mock.calls[0]![0] as string;
    expect(newHex).toMatch(/^#[0-9A-Fa-f]{6}$/i);
  });

  it('Shift+ArrowRight on Hue slider increments by 10', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker hex="#FF0000" onChange={onChange} />);
    const hueSlider = screen.getByRole('slider', { name: 'Hue' });
    hueSlider.focus();
    await user.keyboard('{Shift>}[ArrowRight]{/Shift}');
    expect(onChange).toHaveBeenCalledOnce();
    // Hue went from 0 → 10
    const newHex = onChange.mock.calls[0]![0] as string;
    expect(newHex).toMatch(/^#[0-9A-Fa-f]{6}$/i);
    // Verify the slider now shows 10
    expect(hueSlider.getAttribute('aria-valuenow')).toBe('10');
  });

  it('Home key on Hue slider sets hue to 0', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker hex="#00FF00" onChange={onChange} />); // hue=120
    const hueSlider = screen.getByRole('slider', { name: 'Hue' });
    hueSlider.focus();
    await user.keyboard('[Home]');
    expect(hueSlider.getAttribute('aria-valuenow')).toBe('0');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('typing a valid hex into the hex input calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker hex="#FF0000" onChange={onChange} />);
    const hexInput = screen.getByLabelText('Hex');
    await user.clear(hexInput);
    await user.type(hexInput, '#0000FF');
    // onChange called when valid 7-char hex entered
    expect(onChange).toHaveBeenCalled();
  });

  it('OKLCH display shows non-empty values', () => {
    render(<ColorPicker hex="#4F46E5" onChange={() => {}} />);
    const oklchDisplay = screen.getByTestId('oklch-display');
    expect(oklchDisplay.textContent).not.toBe('');
    expect(oklchDisplay.textContent).toContain('L:');
  });
});
