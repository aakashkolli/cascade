import { useEffect } from 'react';

const FOCUSABLE_SEL =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    function getFocusable(): HTMLElement[] {
      const walker = document.createTreeWalker(
        container!,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode(node) {
            const el = node as HTMLElement;
            if (
              el.matches(FOCUSABLE_SEL) &&
              !el.closest('[aria-hidden="true"]')
            ) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          },
        }
      );
      const nodes: HTMLElement[] = [];
      let node = walker.nextNode();
      while (node) {
        nodes.push(node as HTMLElement);
        node = walker.nextNode();
      }
      return nodes;
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, enabled]);
}
