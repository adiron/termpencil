/// <reference types="node" />
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { animatedBufferToBinary, binaryToAnimatedBuffer } from './binary';
import {
  makeEmptyScreenBuffer,
  renderToTerminal,
  type StyledChar,
  DEFAULT_CHAR
} from './screenbuffer';


describe('screenbuffer binary v0 (single frame)', () => {
  it('should encode and decode a simple buffer', () => {
    const buffer = makeEmptyScreenBuffer<StyledChar>(3, 2, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 }; // 'A'
    buffer.chars[1] = { codepoint: null, fg: undefined, bg: undefined };
    buffer.chars[2] = { codepoint: 97, fg: undefined, bg: 5 }; // 'a'
    buffer.chars[4] = { codepoint: 0x1F600, fg: 10, bg: undefined }; // 😀

    const binary = animatedBufferToBinary([buffer], 0);
    const decoded = binaryToAnimatedBuffer(binary);

    expect(decoded.length).toBe(1);
    expect(decoded[0].width).toBe(buffer.width);
    expect(decoded[0].chars.length).toBe(buffer.chars.length);
    expect(decoded[0].chars[0]).toEqual(buffer.chars[0]);
    expect(decoded[0].chars[1]).toEqual(buffer.chars[1]);
  });

  it('should have correct header size (9 bytes)', () => {
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    const binary = animatedBufferToBinary([buffer], 0);
    // Header 9 bytes + 1 char (5 + 1 + 1 = 7 bytes) = 16 bytes
    expect(binary.length).toBe(16);
    expect(binary[0]).toBe(0); // version 0
  });

  it('should throw on wrong version', () => {
    const buffer = new Uint8Array(10);
    const dv = new DataView(buffer.buffer);
    dv.setUint8(0, 5); // Version 5
    expect(() => binaryToAnimatedBuffer(buffer)).toThrow(/version/);
  });
});

describe('screenbuffer binary v1 (multi-frame)', () => {
  it('should encode and decode a single frame', () => {
    const buffer = makeEmptyScreenBuffer<StyledChar>(3, 2, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };

    const binary = animatedBufferToBinary([buffer], 1);
    const decoded = binaryToAnimatedBuffer(binary);

    expect(decoded.length).toBe(1);
    expect(decoded[0].width).toBe(3);
    expect(decoded[0].chars.length).toBe(6);
    expect(decoded[0].chars[0]).toEqual({ codepoint: 65, fg: 1, bg: 2 });
  });

  it('should encode and decode multiple frames', () => {
    const frame1 = makeEmptyScreenBuffer<StyledChar>(2, 1, DEFAULT_CHAR);
    frame1.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    frame1.chars[1] = { codepoint: 66, fg: 3, bg: 4 };

    const frame2 = makeEmptyScreenBuffer<StyledChar>(2, 1, DEFAULT_CHAR);
    frame2.chars[0] = { codepoint: 97, fg: 5, bg: 6 };
    frame2.chars[1] = { codepoint: 98, fg: 7, bg: 8 };

    const binary = animatedBufferToBinary([frame1, frame2], 1);
    const decoded = binaryToAnimatedBuffer(binary);

    expect(decoded.length).toBe(2);
    expect(decoded[0].chars[0]).toEqual({ codepoint: 65, fg: 1, bg: 2 });
    expect(decoded[1].chars[1]).toEqual({ codepoint: 98, fg: 7, bg: 8 });
  });

  it('should have correct header size (14 bytes) for v1', () => {
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    const binary = animatedBufferToBinary([buffer], 1);
    // Header 14 bytes + frame delay 4 bytes + 1 char (5 + 1 + 1 = 7 bytes) = 25 bytes
    expect(binary.length).toBe(25);
    expect(binary[0]).toBe(1); // version 1
  });

  it('should correctly calculate file size for multiple frames', () => {
    const buffer = makeEmptyScreenBuffer(2, 1, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    buffer.chars[1] = { codepoint: 66, fg: 3, bg: 4 };

    // 3 frames: header(14) + 3 * (delay(4) + 2 chars(14)) = 14 + 3*18 = 68
    const binary = animatedBufferToBinary([buffer, buffer, buffer], 1);
    expect(binary.length).toBe(68);
  });

  it('should throw on truncated frame data', () => {
    const buffer = makeEmptyScreenBuffer(2, 1, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    const binary = animatedBufferToBinary([buffer], 1);

    // Remove last byte to truncate
    const truncated = binary.slice(0, binary.length - 1);
    expect(() => binaryToAnimatedBuffer(truncated)).toThrow();
  });

  it('should throw on width mismatch between frames', () => {
    const frame1 = makeEmptyScreenBuffer(2, 1, DEFAULT_CHAR);
    const frame2 = makeEmptyScreenBuffer(3, 1, DEFAULT_CHAR); // different width

    expect(() => animatedBufferToBinary([frame1, frame2], 1)).toThrow(/width mismatch/);
  });

  it('should throw on length mismatch between frames', () => {
    const frame1 = makeEmptyScreenBuffer(2, 1, DEFAULT_CHAR);
    const frame2 = makeEmptyScreenBuffer(2, 2, DEFAULT_CHAR); // different length

    expect(() => animatedBufferToBinary([frame1, frame2], 1)).toThrow(/length mismatch/);
  });
});

describe('screenbuffer binary default behavior', () => {
  it('should encode and decode a simple buffer', () => {
    const buffer = makeEmptyScreenBuffer<StyledChar>(3, 2, DEFAULT_CHAR);
    // Set some values
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 }; // 'A'
    buffer.chars[1] = { codepoint: null, fg: undefined, bg: undefined };
    buffer.chars[2] = { codepoint: 97, fg: undefined, bg: 5 }; // 'a'
    buffer.chars[4] = { codepoint: 0x1F600, fg: 10, bg: undefined }; // 😀

    const binary = animatedBufferToBinary([buffer]);
    const decoded = binaryToAnimatedBuffer(binary)[0];

    expect(decoded.width).toBe(buffer.width);
    expect(decoded.chars.length).toBe(buffer.chars.length);

    expect(decoded.chars[0]).toEqual(buffer.chars[0]);
    expect(decoded.chars[1]).toEqual(buffer.chars[1]);
    expect(decoded.chars[2]).toEqual(buffer.chars[2]);
    expect(decoded.chars[4]).toEqual(buffer.chars[4]);
  });

  it('scroll-test: ensure correct byte offsets', () => {
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };

    const binary = animatedBufferToBinary([buffer]);
    // v1: Header 14 bytes + frame delay 4 bytes + 1 char (5 + 1 + 1 = 7 bytes) = 25 bytes
    expect(binary.length).toBe(25);

    const decoded = binaryToAnimatedBuffer(binary)[0];
    expect(decoded.chars[0]).toEqual(buffer.chars[0]);
  });

  it('should throw on wrong version', () => {
    // Create a minimal v1 buffer to avoid DataView offset errors
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    const binary = animatedBufferToBinary([buffer], 1);
    const dv = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);

    // Change version byte to 99 (unsupported)
    dv.setUint8(0, 99);

    expect(() => binaryToAnimatedBuffer(binary)).toThrow(/version/);
  });

  it('should throw on truncated data', () => {
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    buffer.chars[0] = { codepoint: 65, fg: 1, bg: 2 };
    const binary = animatedBufferToBinary([buffer]);

    // Slice off the last byte
    const truncated = binary.slice(0, binary.length - 1);

    // It might throw RangeError (if inside getUint*) or "Found fewer chars" error
    expect(() => binaryToAnimatedBuffer(truncated)).toThrow();
  });

  it('should throw on extra data', () => {
    const buffer = makeEmptyScreenBuffer(1, 1, DEFAULT_CHAR);
    const binary = animatedBufferToBinary([buffer]);

    // Add a full extra char (5 bytes: 4 for codepoint + 1 for flags)
    const extraChar = new Uint8Array(5);
    const extra = new Uint8Array(binary.length + extraChar.length);
    extra.set(binary);
    extra.set(extraChar, binary.length);

    expect(() => binaryToAnimatedBuffer(extra)).toThrow();
  });
});

describe('example files', () => {
  it('should decode aw_yis.tp without errors', () => {
    const fileData = readFileSync(join(process.cwd(), 'examples/aw_yis.tp'));
    const binary = new Uint8Array(fileData.buffer, fileData.byteOffset, fileData.byteLength);
    const decoded = binaryToAnimatedBuffer(binary);

    expect(decoded.length).toBeGreaterThan(0);
    expect(decoded[0].width).toBe(80);
    expect(decoded[0].chars.length).toBeGreaterThan(0);
  });

  it('should render aw_yis.tp first frame to terminal output', () => {
    const fileData = readFileSync(join(process.cwd(), 'examples/aw_yis.tp'));
    const binary = new Uint8Array(fileData.buffer, fileData.byteOffset, fileData.byteLength);
    const [firstFrame] = binaryToAnimatedBuffer(binary);
    const rendered = renderToTerminal(firstFrame);

    expect(typeof rendered).toBe('string');
    expect(rendered.length).toBeGreaterThan(0);
  });
});
