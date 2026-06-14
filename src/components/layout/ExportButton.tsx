import { useState, useRef, useEffect } from 'react';
import { useTokenGraphStore } from '../../store/tokenGraphStore';

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  function handleOption(filename: string, fn: () => string) {
    // Get content synchronously from fresh store state at click time
    const content = fn();
    download(filename, content);
  }

  const options = [
    { label: 'CSS Custom Properties', filename: 'tokens.css', key: 'exportCSS' as const },
    { label: 'Style Dictionary', filename: 'tokens.json', key: 'exportStyleDictionary' as const },
    { label: 'Figma Tokens', filename: 'figma-tokens.json', key: 'exportFigmaTokens' as const },
    { label: 'CSV Report', filename: 'contrast-report.csv', key: 'exportCSVData' as const },
  ];

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-ghost"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        data-testid="export-button"
        style={{ gap: '0.4rem' }}
      >
        Export
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0, transition: 'transform 120ms', transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 5px)',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 50,
            minWidth: '196px',
            padding: '4px 0',
          }}
        >
          {options.map(opt => (
            <button
              key={opt.filename}
              role="menuitem"
              onClick={() => handleOption(opt.filename, useTokenGraphStore.getState()[opt.key])}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-primary)',
                background: 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget).style.background = 'var(--color-surface)'; }}
              onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
