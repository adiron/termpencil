import { describe, it, expect } from 'vitest';
import { FG, BG } from './boxPresets';
import { makeResolver, paintBox } from './BoxTool.svelte';
import { makeEmptyScreenBuffer, getCharAt } from '../screenbuffer';

describe('makeResolver', () => {
  it('flattens symbols correctly', () => {
    const mockFg = { name: 'mock-fg' } as any;
    const mockBg = { name: 'mock-bg' } as any;

    const resolver = makeResolver(mockFg, mockBg);

    const input = {
      someProp: 'value',
      nested: {
        fg: FG,
        bg: BG,
        other: 'static'
      },
      list: [FG, BG, 'text'],
      mixed: [
        { color: FG },
        { color: BG }
      ]
    };

    const expected = {
      someProp: 'value',
      nested: {
        fg: mockFg,
        bg: mockBg,
        other: 'static'
      },
      list: [mockFg, mockBg, 'text'],
      mixed: [
        { color: mockFg },
        { color: mockBg }
      ]
    };

    const result = resolver(input as any);

    expect(result).toEqual(expected);
  });

  it('handles deep nesting', () => {
    const mockFg = 'fg-val' as any;
    const mockBg = 'bg-val' as any;
    const resolver = makeResolver(mockFg, mockBg);

    const input = {
      level1: {
        level2: {
          level3: {
            val: FG
          }
        }
      }
    };

    const expected = {
      level1: {
        level2: {
          level3: {
            val: mockFg
          }
        }
      }
    };

    expect(resolver(input as any)).toEqual(expected);
  });

  it('throws on unknown symbols', () => {
    const resolver = makeResolver('fg' as any, 'bg' as any);
    const UnknownSym = Symbol('unknown');
    const input = { val: UnknownSym };

    expect(() => resolver(input as any)).toThrow(/Unknown symbol/);
  });
});

describe('paintBox', () => {
  it('draws a box correctly', () => {
    const buffer = makeEmptyScreenBuffer(10, 10);
    const p1: [number, number] = [2, 2];
    const p2: [number, number] = [6, 6];
    const fg = 1;
    const bg = 2;

    const preset = {
      frame: {
        all: {
          codepoint: 35, // '#'
          fg: FG,
          bg: BG
        }
      },
      color: {
        codepoint: 46, // '.'
        fg: FG,
        bg: BG
      }
    };

    paintBox(buffer, p1, p2, preset as any, fg, bg);

    // Check corners
    const topLeft = getCharAt(buffer, 2, 2);
    expect(topLeft.codepoint).toBe(35);
    expect(topLeft.fg).toBe(fg);
    expect(topLeft.bg).toBe(bg);

    const bottomRight = getCharAt(buffer, 6, 6);
    expect(bottomRight.codepoint).toBe(35);

    // Check fill
    const mid = getCharAt(buffer, 4, 4);
    expect(mid.codepoint).toBe(46);
    expect(mid.fg).toBe(fg);
    expect(mid.bg).toBe(bg);

    // Check outside
    const outside = getCharAt(buffer, 1, 1);
    expect(outside.codepoint).toBe(null);
  });
});
