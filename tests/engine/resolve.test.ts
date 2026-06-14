import { describe, it, expect, assert } from 'vitest';
import { resolveToken } from '../../src/engine/resolve.ts';
import type { Token } from '../../src/engine/types.ts';

function hexToken(id: string, hex: string): Token {
  return { id, name: id, group: 'color', value: { type: 'hex', value: hex }, tags: [] };
}


describe('resolveToken', () => {
  it('resolves a hex token to a ResolvedColor with correct hex and rgb', () => {
    const token = hexToken('a', '#FF0000');
    const result = resolveToken(token, new Map());
    expect(result).not.toBeNull();
    assert(result !== null);
    expect(result.hex).toBe('#FF0000');
    expect(result.rgb).toEqual([255, 0, 0]);
  });

  it('populates luminance for a hex token', () => {
    const white = hexToken('w', '#ffffff');
    const black = hexToken('b', '#000000');
    const whiteResult = resolveToken(white, new Map());
    const blackResult = resolveToken(black, new Map());
    assert(whiteResult !== null);
    assert(blackResult !== null);
    expect(whiteResult.luminance).toBeCloseTo(1, 2);
    expect(blackResult.luminance).toBeCloseTo(0, 2);
  });

  it('resolves a reference token by copying the dependency resolved value', () => {
    const base = hexToken('base', '#FF0000');
    const baseResolved = resolveToken(base, new Map());
    assert(baseResolved !== null);
    const refToken: Token = {
      id: 'alias',
      name: 'alias',
      group: 'color',
      value: { type: 'reference', tokenId: 'base' },
      tags: [],
    };
    const result = resolveToken(refToken, new Map([['base', baseResolved]]));
    expect(result).not.toBeNull();
    assert(result !== null);
    expect(result.hex).toBe('#FF0000');
    expect(result.tokenId).toBe('alias');
  });

  it('returns null if a reference target is not yet resolved', () => {
    const refToken: Token = {
      id: 'alias',
      name: 'alias',
      group: 'color',
      value: { type: 'reference', tokenId: 'missing' },
      tags: [],
    };
    expect(resolveToken(refToken, new Map())).toBeNull();
  });

  it('resolves a lighten computed token', () => {
    const base = hexToken('base', '#808080');
    const baseResolved = resolveToken(base, new Map());
    assert(baseResolved !== null);
    const computedToken: Token = {
      id: 'lighter',
      name: 'lighter',
      group: 'color',
      value: {
        type: 'computed',
        fn: 'lighten',
        args: [
          { type: 'tokenRef', tokenId: 'base' },
          { type: 'number', value: 10 },
        ],
      },
      tags: [],
    };
    const result = resolveToken(computedToken, new Map([['base', baseResolved]]));
    expect(result).not.toBeNull();
    assert(result !== null);
    expect(result.hsl[2]).toBeGreaterThan(baseResolved.hsl[2]);
  });

  it('resolves a darken computed token', () => {
    const base = hexToken('base', '#808080');
    const baseResolved = resolveToken(base, new Map());
    assert(baseResolved !== null);
    const computedToken: Token = {
      id: 'darker',
      name: 'darker',
      group: 'color',
      value: {
        type: 'computed',
        fn: 'darken',
        args: [
          { type: 'tokenRef', tokenId: 'base' },
          { type: 'number', value: 10 },
        ],
      },
      tags: [],
    };
    const result = resolveToken(computedToken, new Map([['base', baseResolved]]));
    expect(result).not.toBeNull();
    assert(result !== null);
    expect(result.hsl[2]).toBeLessThan(baseResolved.hsl[2]);
  });

  it('resolves an alpha computed token', () => {
    const base = hexToken('base', '#000000');
    const baseResolved = resolveToken(base, new Map());
    assert(baseResolved !== null);
    const computedToken: Token = {
      id: 'faded',
      name: 'faded',
      group: 'color',
      value: {
        type: 'computed',
        fn: 'alpha',
        args: [
          { type: 'tokenRef', tokenId: 'base' },
          { type: 'number', value: 50 },
        ],
      },
      tags: [],
    };
    const result = resolveToken(computedToken, new Map([['base', baseResolved]]));
    expect(result).not.toBeNull();
    assert(result !== null);
    // 50% alpha of black on white ≈ rgb(128, 128, 128)
    expect(result.rgb[0]).toBeCloseTo(128, 0);
  });

  it('returns null if a computed token dependency is missing', () => {
    const computedToken: Token = {
      id: 'computed',
      name: 'computed',
      group: 'color',
      value: {
        type: 'computed',
        fn: 'lighten',
        args: [
          { type: 'tokenRef', tokenId: 'missing' },
          { type: 'number', value: 10 },
        ],
      },
      tags: [],
    };
    expect(resolveToken(computedToken, new Map())).toBeNull();
  });
});
