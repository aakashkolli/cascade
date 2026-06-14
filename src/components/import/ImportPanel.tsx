import { useState, useRef } from 'react';
import { useFocusTrap } from '../shared/useFocusTrap';
import { announceError } from '../shared/LiveRegions';
import { useTokenGraphStore } from '../../store/tokenGraphStore';
import { parseStyleDictionary } from '../../io/import/style-dictionary';
import { parseFigmaTokens } from '../../io/import/figma-tokens';
import { parseTailwind } from '../../io/import/tailwind';
import { parseCSSCustomProperties } from '../../io/import/css-custom-properties';
import { FormatTabs } from './FormatTabs';
import type { ImportFormat } from './FormatTabs';
import { ParseErrorDisplay } from './ParseErrorDisplay';
import type { ParseError } from '../../io/import/types';

interface ImportPanelProps {
  onClose: () => void;
}

const EXAMPLES: Record<ImportFormat, string> = {
  'style-dictionary': `{
  "color": {
    "white": { "value": "#FFFFFF" },
    "black": { "value": "#111111" },
    "brand": { "value": "#0055CC" }
  },
  "semantic": {
    "background": { "value": "{color.white}" },
    "text-primary": { "value": "{color.black}" },
    "link": { "value": "{color.brand}" }
  }
}`,
  'figma-tokens': `{
  "global": {
    "white": { "value": "#FFFFFF", "type": "color" },
    "black": { "value": "#111111", "type": "color" },
    "brand": { "value": "#0055CC", "type": "color" }
  },
  "semantic": {
    "background": { "value": "{global.white}", "type": "color" },
    "text-primary": { "value": "{global.black}", "type": "color" },
    "link": { "value": "{global.brand}", "type": "color" }
  }
}`,
  'tailwind': `module.exports = {
  theme: {
    colors: {
      white: '#FFFFFF',
      black: '#111111',
      blue: {
        500: '#0055CC',
        900: '#003380'
      },
      gray: {
        100: '#F5F5F5',
        900: '#1A1A1A'
      }
    }
  }
}`,
  'css': `:root {
  --color-white: #FFFFFF;
  --color-black: #111111;
  --color-brand: #0055CC;
  --color-background: var(--color-white);
  --color-text-primary: var(--color-black);
  --color-link: var(--color-brand);
}`,
};

export function ImportPanel({ onClose }: ImportPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<ImportFormat>('style-dictionary');
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<ParseError[]>([]);
  const importSystem = useTokenGraphStore(s => s.importSystem);

  useFocusTrap(panelRef, true);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  }

  function parse(t: string, f: ImportFormat) {
    switch (f) {
      case 'style-dictionary': return parseStyleDictionary(t);
      case 'figma-tokens': return parseFigmaTokens(t);
      case 'tailwind': return parseTailwind(t);
      case 'css': return parseCSSCustomProperties(t);
    }
  }

  function handleImport() {
    const result = parse(text, format);
    if (result.ok) {
      importSystem(result);
      onClose();
    } else {
      setErrors(result.errors as ParseError[]);
      announceError(result.errors[0]?.message ?? 'Parse error');
    }
  }

  function handleFormatChange(f: ImportFormat) {
    setFormat(f);
    setErrors([]);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-panel-title"
        onKeyDown={handleKeyDown}
        data-testid="import-panel"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          width: 560,
          maxWidth: '92vw',
          maxHeight: '85vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem 1rem',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <h2 id="import-panel-title" style={{
            margin: 0,
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}>
            Import tokens
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Paste your token system below or load the example to see the expected format.
          </p>
        </div>

        {/* Format tabs */}
        <div style={{ padding: '0 1.5rem' }}>
          <FormatTabs current={format} onChange={handleFormatChange} />
        </div>

        {/* Example */}
        <div style={{ padding: '0.875rem 1.5rem 0' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.375rem',
          }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Example
            </span>
            <button
              className="btn btn-text"
              style={{ fontSize: 'var(--text-xs)', padding: '0.125rem 0.25rem' }}
              onClick={() => { setText(EXAMPLES[format]); setErrors([]); }}
            >
              Load example →
            </button>
          </div>
          <pre style={{
            margin: 0,
            padding: '0.75rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            overflowX: 'auto',
            maxHeight: '140px',
            overflowY: 'auto',
            lineHeight: 1.6,
          }}>
            {EXAMPLES[format]}
          </pre>
        </div>

        {/* Input */}
        <div style={{ padding: '0.875rem 1.5rem 0' }}>
          <label
            htmlFor="import-textarea-input"
            style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}
          >
            Your tokens
          </label>
          <textarea
            id="import-textarea-input"
            aria-label="Token system input"
            data-testid="import-textarea"
            value={text}
            onChange={e => { setText(e.target.value); setErrors([]); }}
            rows={9}
            placeholder="Paste your token system here…"
            style={{
              display: 'block',
              width: '100%',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.625rem 0.75rem',
              resize: 'vertical',
              lineHeight: 1.6,
              outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-border-focus)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border-strong)'; }}
          />
          <ParseErrorDisplay errors={errors} />
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'flex-end',
          padding: '1rem 1.5rem 1.25rem',
        }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-solid" onClick={handleImport} data-testid="import-submit">
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
