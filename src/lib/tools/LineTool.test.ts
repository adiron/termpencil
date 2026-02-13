import { describe, expect, it } from 'vitest';
import { bresenhamPoints, paintLine } from './LineTool.svelte';
import { makeEmptyScreenBuffer, getCharAt, DEFAULT_CHAR } from '../screenbuffer';
import { LINE_STYLES } from './lineStyles';

describe('bresenhamPoints', () => {
  it('returns contiguous points for a diagonal line', () => {
    const points = bresenhamPoints([1, 1], [4, 4]);
    expect(points).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
  });
});

describe('paintLine', () => {
  it('uses current character when style is null', () => {
    const buffer = makeEmptyScreenBuffer(8, 8, DEFAULT_CHAR);

    paintLine(
      buffer,
      [0, 0],
      [4, 0],
      null,
      64,
      [10, 18],
      1,
      2,
    );

    const c = getCharAt(buffer, 2, 0);
    expect(c.codepoint).toBe(64);
    expect(c.fg).toBe(1);
    expect(c.bg).toBe(2);
  });

  it('uses style character when style is selected', () => {
    const buffer = makeEmptyScreenBuffer(8, 8, DEFAULT_CHAR);

    paintLine(
      buffer,
      [0, 0],
      [0, 4],
      LINE_STYLES[0],
      64,
      [10, 18],
      1,
      2,
    );

    const c = getCharAt(buffer, 0, 2);
    expect(c.codepoint).toBe(124);
  });

  it('uses slash/backslash correctly with cell aspect ratio', () => {
    const buffer = makeEmptyScreenBuffer(8, 8, DEFAULT_CHAR);

    paintLine(
      buffer,
      [0, 0],
      [3, 3],
      LINE_STYLES[0],
      64,
      [10, 18],
      1,
      2,
    );

    const c = getCharAt(buffer, 2, 2);
    expect(c.codepoint).toBe(92);
  });
});
