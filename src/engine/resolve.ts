import type { Token, ResolvedColor, TokenId } from './types.ts';
import { parseColor, lighten, darken, alphaBlend, rgbToHex, rgbToHsl, rgbToOklch } from './color.ts';
import { relativeLuminance } from './contrast.ts';

type ResolvedMap = ReadonlyMap<TokenId, ResolvedColor>;

function fromRgb(tokenId: TokenId, rgb: [number, number, number]): ResolvedColor {
  const [r, g, b] = rgb;
  return {
    tokenId,
    hex: rgbToHex([r, g, b]),
    rgb: [r, g, b],
    hsl: rgbToHsl([r, g, b]),
    oklch: rgbToOklch([r, g, b]),
    luminance: relativeLuminance(r, g, b),
  };
}

/**
 * Resolve one token given the map of already-resolved tokens.
 * Returns null if a dependency is missing — caller must visit nodes in topological order
 * so this should never happen during a propagation pass.
 */
export function resolveToken(
  token: Token,
  resolved: ResolvedMap
): ResolvedColor | null {
  const { value, id } = token;

  switch (value.type) {
    case 'hex': {
      const parsed = parseColor(value.value);
      if (!parsed) return null;
      return { tokenId: id, hex: parsed.hex, rgb: parsed.rgb, hsl: parsed.hsl, oklch: parsed.oklch, luminance: parsed.luminance };
    }

    case 'reference': {
      const dep = resolved.get(value.tokenId);
      if (!dep) return null;
      return { ...dep, tokenId: id };
    }

    case 'computed': {
      const tokenRefArg = value.args.find((a) => a.type === 'tokenRef');
      const numberArg = value.args.find((a) => a.type === 'number');
      if (!tokenRefArg) return null;
      const dep = resolved.get(tokenRefArg.tokenId);
      if (!dep) return null;
      const amount = numberArg?.type === 'number' ? numberArg.value : 10;
      const rgb = dep.rgb as [number, number, number];

      switch (value.fn) {
        case 'lighten': return fromRgb(id, lighten(rgb, amount));
        case 'darken':  return fromRgb(id, darken(rgb, amount));
        case 'alpha':   return fromRgb(id, alphaBlend(rgb, amount));
        default: {
          const _exhaustive: never = value.fn;
          return _exhaustive;
        }
      }
    }

    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}
