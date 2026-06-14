import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { parseColor, hslToRgb, rgbToHex } from '../../engine/color';
import type { HSL } from '../../engine/types';

// ─── Slider ───────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  background: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, unit, background, onChange }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function clampRound(v: number): number {
    return Math.round(Math.min(max, Math.max(min, v)));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const step = e.shiftKey ? 10 : 1;
    let next: number | null = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = clampRound(value + step);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = clampRound(value - step);
        break;
      case 'Home':
        next = min;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    if (next !== null) onChange(next);
  }

  const computeValueFromX = useCallback(
    (clientX: number): number => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0) return value;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return clampRound(min + ratio * (max - min));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, value]
  );

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    onChange(computeValueFromX(e.clientX));

    function onMouseMove(ev: MouseEvent) {
      onChange(computeValueFromX(ev.clientX));
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  const thumbPercent = ((value - min) / (max - min)) * 100 + '%';

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={`${Math.round(value)}${unit}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        height: '16px',
        borderRadius: '8px',
        background,
        cursor: 'pointer',
        outline: 'none',
        userSelect: 'none',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: thumbPercent,
          transform: 'translate(-50%, -50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#fff',
          border: '2px solid rgba(0,0,0,0.3)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── ColorPicker ──────────────────────────────────────────────────────────────

interface ColorPickerProps {
  hex: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ hex, onChange }: ColorPickerProps) {
  const [hsl, setHsl] = useState<HSL>(() => parseColor(hex)?.hsl ?? [0, 0, 50]);
  // Local hex editing state so partial input (e.g. "#FF") doesn't snap back
  const [localHex, setLocalHex] = useState(hex.toUpperCase());

  useEffect(() => {
    // Sync controlled prop to local editing state — intentional sync setState
    const parsed = parseColor(hex);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (parsed) setHsl(parsed.hsl);
    setLocalHex(hex.toUpperCase());
  }, [hex]);

  function updateHsl(newHsl: HSL) {
    setHsl(newHsl);
    const rgb = hslToRgb(newHsl);
    onChange(rgbToHex(rgb));
  }

  const [h, s, l] = hsl;
  const parsed = parseColor(hex);
  const oklch = parsed?.oklch ?? [0, 0, 0];

  return (
    <div data-testid="color-picker" aria-label="Color picker">
      {/* Hue slider */}
      <Slider
        label="Hue"
        value={h}
        min={0}
        max={360}
        unit="°"
        background={`linear-gradient(to right,
          hsl(0,100%,50%), hsl(30,100%,50%), hsl(60,100%,50%),
          hsl(90,100%,50%), hsl(120,100%,50%), hsl(150,100%,50%),
          hsl(180,100%,50%), hsl(210,100%,50%), hsl(240,100%,50%),
          hsl(270,100%,50%), hsl(300,100%,50%), hsl(330,100%,50%),
          hsl(360,100%,50%))`}
        onChange={v => updateHsl([v, s, l])}
      />

      {/* Saturation slider */}
      <Slider
        label="Saturation"
        value={s}
        min={0}
        max={100}
        unit="%"
        background={`linear-gradient(to right, hsl(${Math.round(h)},0%,${Math.round(l)}%), hsl(${Math.round(h)},100%,${Math.round(l)}%))`}
        onChange={v => updateHsl([h, v, l])}
      />

      {/* Lightness slider */}
      <Slider
        label="Lightness"
        value={l}
        min={0}
        max={100}
        unit="%"
        background={`linear-gradient(to right, hsl(${Math.round(h)},${Math.round(s)}%,0%), hsl(${Math.round(h)},${Math.round(s)}%,50%), hsl(${Math.round(h)},${Math.round(s)}%,100%))`}
        onChange={v => updateHsl([h, s, v])}
      />

      {/* Hex input */}
      <div>
        <label htmlFor="color-picker-hex">Hex</label>
        <input
          id="color-picker-hex"
          aria-label="Hex"
          type="text"
          value={localHex}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            setLocalHex(v);
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) onChange(v);
          }}
        />
      </div>

      {/* OKLCH display (read-only) */}
      <div aria-label="OKLCH values" data-testid="oklch-display">
        <span>L: {oklch[0].toFixed(2)}</span>
        <span>C: {oklch[1].toFixed(3)}</span>
        <span>H: {oklch[2].toFixed(1)}</span>
      </div>
    </div>
  );
}
