import { describe, it, expect } from 'vitest';
import {
  makeEmptyScreenBuffer,
  setCharsAt,
  resizeScreenBuffer,
  setCharAt,
  mergeScreenBuffersInPlace,
  type StyledChar,
  DEFAULT_CHAR
} from './screenbuffer';


describe('screenbuffer resize', () => {
  it('should return buffer as-is if same width and height', () => {
    const buffer = makeEmptyScreenBuffer(10, 10, DEFAULT_CHAR);
    setCharsAt(buffer, 0, 0, [
      { codepoint: 97, fg: 2, bg: 3 },
      { codepoint: 98, fg: 2, bg: 5 },
      { codepoint: 99, fg: 3, bg: 4 },
    ]);
    const resized = resizeScreenBuffer(buffer, 10, 10, DEFAULT_CHAR);
    expect(buffer).toEqual(resized);
  });

  it('should keep content and fill extra with undefined', () => {
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    const char = { codepoint: 97, fg: 5, bg: 0 };
    setCharAt(buffer, 0, 0, char);
    const resized = resizeScreenBuffer(buffer, 20, 20, DEFAULT_CHAR);

    expect(resized.chars[0]).toEqual(char);
    expect(resized.chars.slice(1)).toEqual(
      Array.from({ length: 20 * 20 - 1 }, () => DEFAULT_CHAR)
    )
  });

  it('should crop content when resizing smaller', () => {
    const buffer = makeEmptyScreenBuffer(5, 5, DEFAULT_CHAR);
    setCharsAt(buffer, 0, 0, [
      { codepoint: 65, fg: 1, bg: 2 },
      { codepoint: 66, fg: 1, bg: 2 },
      { codepoint: 67, fg: 1, bg: 2 },
      { codepoint: 68, fg: 1, bg: 2 },
      { codepoint: 69, fg: 1, bg: 2 },
    ]);
    const resized = resizeScreenBuffer(buffer, 3, 3, DEFAULT_CHAR);
    expect(resized.width).toBe(3);
    expect(resized.chars.length).toBe(9); // 3x3
    expect(resized.chars[0].codepoint).toBe(65);
    expect(resized.chars[1].codepoint).toBe(66);
    expect(resized.chars[2].codepoint).toBe(67);

    // Verify the next row starts correctly (should be nulls, not shifted data from previous row)
    expect(resized.chars[3].codepoint).toBeNull();
    expect(resized.chars[4].codepoint).toBeNull();
    expect(resized.chars[5].codepoint).toBeNull();
  });

  it('should handle mixed resize (width increase, height decrease)', () => {
    const buffer = makeEmptyScreenBuffer(2, 4, DEFAULT_CHAR);
    // Row 0: A B
    setCharsAt(buffer, 0, 0, [
      { codepoint: 65, fg: 1, bg: 2 },
      { codepoint: 66, fg: 1, bg: 2 },
    ]);

    const resized = resizeScreenBuffer(buffer, 4, 2, DEFAULT_CHAR);
    // Width became 4, Height became 2.
    // Row 0 should be: A B . . (where . is empty)

    expect(resized.width).toBe(4);
    expect(resized.chars.length).toBe(8); // 4x2

    expect(resized.chars[0].codepoint).toBe(65);
    expect(resized.chars[1].codepoint).toBe(66);
    expect(resized.chars[2].codepoint).toBeNull();
    expect(resized.chars[3].codepoint).toBeNull();
  });
});

describe('generic screenbuffer features', () => {
  it('makeEmptyScreenBuffer should initialize with primitive values', () => {
    const buffer = makeEmptyScreenBuffer(2, 2, 42);
    expect(buffer.chars).toEqual([42, 42, 42, 42]);
  });

  it('makeEmptyScreenBuffer should initialize with independent object copies', () => {
    const initVal = { val: 1 };
    const buffer = makeEmptyScreenBuffer(2, 1, initVal);

    expect(buffer.chars[0]).toEqual({ val: 1 });
    expect(buffer.chars[1]).toEqual({ val: 1 });

    // Modify one
    buffer.chars[0].val = 99;

    // Check independence
    expect(buffer.chars[0].val).toBe(99);
    expect(buffer.chars[1].val).toBe(1);
  });

  it('mergeScreenBuffers should merge overlay on top of base', () => {
    const baseChar = { codepoint: 65, fg: 1, bg: 2 };
    const overlayChar = { codepoint: 66, fg: 3, bg: 4 };

    const base = makeEmptyScreenBuffer(2, 1, baseChar);
    const overlay = makeEmptyScreenBuffer<StyledChar | undefined>(2, 1, undefined);

    // Set overlay at index 1
    overlay.chars[1] = overlayChar;

    mergeScreenBuffersInPlace(base, overlay);

    // index 0 should be base (since overlay undefined)
    expect(base.chars[0]).toEqual(baseChar);
    // index 1 should be overlay (strict replacement)
    expect(base.chars[1]).toEqual(overlayChar);
  });

  it('mergeScreenBuffers should throw if dimensions mismatch', () => {
    const base = makeEmptyScreenBuffer(2, 2, {});
    const overlay = makeEmptyScreenBuffer(3, 2, undefined);

    expect(() => mergeScreenBuffersInPlace(base as any, overlay as any)).toThrow(/width/);
  });
});
