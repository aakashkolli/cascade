// tests/components/shared/useFocusTrap.test.tsx
import { render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { describe, it, expect } from 'vitest';
import { useFocusTrap } from '../../../src/components/shared/useFocusTrap';

function Trap({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, enabled);
  return (
    <div ref={ref}>
      <button>First</button>
      <button>Second</button>
      <button>Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('wraps Tab from last to first when enabled', async () => {
    const user = userEvent.setup();
    render(<Trap enabled={true} />);
    // Focus the Last button (index 2)
    const buttons = document.querySelectorAll('button');
    act(() => buttons[2]!.focus());
    expect(document.activeElement?.textContent).toBe('Last');
    await user.tab();
    expect(document.activeElement?.textContent).toBe('First');
  });

  it('wraps Shift+Tab from first to last when enabled', async () => {
    const user = userEvent.setup();
    render(<Trap enabled={true} />);
    const buttons = document.querySelectorAll('button');
    act(() => buttons[0]!.focus());
    expect(document.activeElement?.textContent).toBe('First');
    await user.tab({ shift: true });
    expect(document.activeElement?.textContent).toBe('Last');
  });

  it('does NOT wrap Tab when enabled=false', async () => {
    const user = userEvent.setup();
    render(<Trap enabled={false} />);
    const buttons = document.querySelectorAll('button');
    act(() => buttons[2]!.focus());
    await user.tab();
    // Focus should move outside the trap (or wrap browser-natively) — NOT back to First
    expect(document.activeElement?.textContent).not.toBe('First');
  });
});
