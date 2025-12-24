import { describe, it, expect } from 'vitest';
import {
  screenBufferFromBinary,
  screenBufferToBinary,
  makeEmptyScreenBuffer,
  type ScreenBuffer,
  type StyledChar,
  setCharsAt,
  resizeScreenBuffer,
  setCharAt
} from './screenbuffer';

describe('screenbuffer binary', () => {
  it('should encode and decode a simple buffer', () => {
    const buffer = makeEmptyScreenBuffer(3, 2);
    // Set some values
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 }; // 'A'
    buffer.chars[1] = { codepoint: null, fg: undefined, bg: undefined };
    buffer.chars[2] = { codepoint: 97, fg: undefined, bg: 5 }; // 'a'
    buffer.chars[4] = { codepoint: 0x1F600, fg: 10, bg: undefined }; // 😀

    const binary = screenBufferToBinary(buffer);
    const decoded = screenBufferFromBinary(binary);

    expect(decoded.width).toBe(buffer.width);
    expect(decoded.chars.length).toBe(buffer.chars.length);

    expect(decoded.chars[0]).toEqual(buffer.chars[0]);
    expect(decoded.chars[1]).toEqual(buffer.chars[1]);
    expect(decoded.chars[2]).toEqual(buffer.chars[2]);
    expect(decoded.chars[4]).toEqual(buffer.chars[4]);
  });

  it('scroll-test: ensure correct byte offsets', () => {
    const buffer = makeEmptyScreenBuffer(1, 1);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };

    const binary = screenBufferToBinary(buffer);
    // Header 9 bytes + 1 char (5 + 1 + 1 = 7 bytes) = 16 bytes
    expect(binary.length).toBe(16);

    const decoded = screenBufferFromBinary(binary);
    expect(decoded.chars[0]).toEqual(buffer.chars[0]);
  });

  it('should throw on wrong version', () => {
    const buffer = new Uint8Array(10);
    const dv = new DataView(buffer.buffer);
    dv.setUint8(0, 1); // Version 1

    expect(() => screenBufferFromBinary(buffer)).toThrow(/Unsupported version/);
  });

  it('should throw on truncated data', () => {
    const buffer = makeEmptyScreenBuffer(1, 1);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    const binary = screenBufferToBinary(buffer);

    // Slice off the last byte
    const truncated = binary.slice(0, binary.length - 1);

    // It might throw RangeError (if inside getUint*) or "Found fewer chars" error
    expect(() => screenBufferFromBinary(truncated)).toThrow();
  });

  it('should throw on extra data', () => {
    const buffer = makeEmptyScreenBuffer(1, 1);
    const binary = screenBufferToBinary(buffer);

    // Add bytes forming a valid char. 
    // A minimal char is 5 bytes (cp=4, flags=1).
    // Let's just add enough bytes to trigger "Found more chars" or "RangeError"
    // To trigger "Found more chars", we need to successfully parse one more char.
    // The previous test logic for "extra" was adding 1 byte to a valid file. 
    // With new logic, while loop checks offset < byteLength.
    // If we add 1 byte, loop enters. getUint32 needs 4 bytes. We have 1. 
    // It will throw RangeError from DataView.
    // But if we append a FULL char, it should throw "Found more chars".

    const extraChar = new Uint8Array(5); // 0 cp, 0 flags -> valid empty char
    const extra = new Uint8Array(binary.length + extraChar.length);
    extra.set(binary);
    extra.set(extraChar, binary.length);

    expect(() => screenBufferFromBinary(extra)).toThrow(/Found more chars than declared/);
  });
});

describe('screenbuffer resize', () => {
  it('should return buffer as-is if same width and height', () => {
    const buffer = makeEmptyScreenBuffer(10, 10);
    setCharsAt(buffer, 0, 0, [
      { codepoint: 97, fg: 2, bg: 3 },
      { codepoint: 98, fg: 2, bg: 5 },
      { codepoint: 99, fg: 3, bg: 4 },
    ]);
    const resized = resizeScreenBuffer(buffer, 10, 10);
    expect(buffer).toEqual(resized);
  });

  it('should keep content and fill extra with undefined', () => {
    const buffer = makeEmptyScreenBuffer(1, 1);
    const char = { codepoint: 97, fg: 5, bg: 0 };
    setCharAt(buffer, 0, 0, char);
    const resized = resizeScreenBuffer(buffer, 20, 20);

    expect(resized.chars[0]).toEqual(char);
    expect(resized.chars.slice(1)).toEqual(
      Array.from({ length: 20 * 20 - 1 }, () => ({ codepoint: null, fg: undefined, bg: undefined }))
    )
  });

  it('should crop content when resizing smaller', () => {
    const buffer = makeEmptyScreenBuffer(5, 5);
    setCharsAt(buffer, 0, 0, [
      { codepoint: 65, fg: 1, bg: 2 },
      { codepoint: 66, fg: 1, bg: 2 },
      { codepoint: 67, fg: 1, bg: 2 },
      { codepoint: 68, fg: 1, bg: 2 },
      { codepoint: 69, fg: 1, bg: 2 },
    ]);
    const resized = resizeScreenBuffer(buffer, 3, 3);
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
    const buffer = makeEmptyScreenBuffer(2, 4);
    // Row 0: A B
    setCharsAt(buffer, 0, 0, [
      { codepoint: 65, fg: 1, bg: 2 },
      { codepoint: 66, fg: 1, bg: 2 },
    ]);

    const resized = resizeScreenBuffer(buffer, 4, 2);
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
