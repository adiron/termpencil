// This extension is required because of the CLI tool
import { type Color, type ScreenBuffer, type StyledChar } from "./screenbuffer.js";
import { concatUint8Arrays } from "./utils.js";

interface ReaderPair {
  writeBinary: (buffer: ScreenBuffer[]) => Uint8Array;
  readBinary: (binary: Uint8Array) => ScreenBuffer[];
}

// TODO: Support multi-frame save
const formatReaders: Record<number, ReaderPair> = {
  0: {
    // Binary format v0:
    //
    // File structure:
    // 01234|n
    // headr|char[]
    //
    // headr:
    // 0|1234|5678
    // v|wdth|leng
    // 
    // v = version (starts at 0 for this version)
    // wdth = width encoded as Uint32
    // leng = length of all chars
    //
    // char:
    // 0123|4|5|6
    // codp|l|f|b
    // 
    // codp = Uint32 of codepoint. If 0 then assume `null`.
    // l = flags. last 2 bytes control whether the FG and BG are undefined.
    //     If 0b00000000 both are undefined.
    //     If 0b00000001 bg undefined, fg is defined.
    //     If 0b00000010 bg is defined, fg undefined.
    //     If 0b00000011 both are defined

    readBinary(data) {
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      let offset = 0;

      const version = dv.getUint8(offset);
      offset += 1;

      if (version !== 0) {
        throw new Error(`Unsupported version: ${version}`);
      }

      const width = dv.getUint32(offset, true);
      offset += 4;

      const length = dv.getUint32(offset, true);
      offset += 4;

      const chars: StyledChar[] = [];

      while (offset < data.byteLength) {
        if (chars.length >= length) {
          throw new Error(`Found more chars than declared in header (expected ${length})`);
        }

        const codepointRaw = dv.getUint32(offset, true);
        offset += 4;

        const flags = dv.getUint8(offset);
        offset += 1;

        let fg: Color | undefined = undefined;
        if (flags & 0b01) {
          fg = dv.getUint8(offset);
          offset += 1;
        }

        let bg: Color | undefined = undefined;
        if (flags & 0b10) {
          bg = dv.getUint8(offset);
          offset += 1;
        }

        chars.push({
          codepoint: codepointRaw === 0 ? null : codepointRaw,
          fg,
          bg,
        });
      }

      if (chars.length !== length) {
        throw new Error(`Found fewer chars than declared in header (expected ${length}, got ${chars.length})`);
      }

      return [{
        chars,
        width,
      }];
    },

    writeBinary(buffer) {
      function encodeHeader(buffer: ScreenBuffer) {
        const output = new ArrayBuffer(9);
        const dv = new DataView(output)

        dv.setUint8(0, 0);
        dv.setUint32(1, buffer.width, true);
        dv.setUint32(5, buffer.chars.length, true);

        return new Uint8Array(output);
      }

      function encodeChar(char: StyledChar): Uint8Array {
        const hasFg = char.fg !== undefined;
        const hasBg = char.bg !== undefined;

        const size = 5 + (hasFg ? 1 : 0) + (hasBg ? 1 : 0);

        const output = new ArrayBuffer(size);
        const dv = new DataView(output)

        dv.setUint32(0, char.codepoint ?? 0, true);

        let flags = 0;
        if (hasFg) flags |= 0b01;
        if (hasBg) flags |= 0b10;
        dv.setUint8(4, flags);

        let offset = 5;

        if (hasFg) {
          dv.setUint8(offset++, char.fg!);
        }

        if (hasBg) {
          dv.setUint8(offset++, char.bg!);
        }

        return new Uint8Array(output);
      }

      const header = encodeHeader(buffer[0]);
      const encodedChars = buffer[0].chars.map(encodeChar);
      const chars = concatUint8Arrays(encodedChars);
      return concatUint8Arrays([header, chars]);
    },
  },

  1: {
    // Binary format v1:
    //
    // File structure:
    // 0123456789abcd|n
    // header        |frame[]
    //
    // headr:
    // 0|1234|5678|9abc|d
    // v|wdth|leng|fram|r
    // 
    // v = version (starts at 1 for this version)
    // wdth = width encoded as Uint32
    // leng = length of all chars in a SINGLE buffer
    // fram = number of frames
    // r = reserved (1 byte, currently unused, set to 0)
    //
    // The rest of the binary contains animations frames 
    // (screenbuffers) one after the other:
    // frame:
    // 0123|n
    // dely|char[]
    //
    // dely = delay of the frame, or 0 if undefined on the frame
    // The char[] portion ends when leng has been reached.
    //
    // Individual chars:
    // (same as v0:)
    // char:
    // 0123|4|5|6
    // codp|l|f|b
    // 
    // codp = Uint32 of codepoint. If 0 then assume `null`.
    // l = flags. last 2 bytes control whether the FG and BG are undefined.
    //     If 0b00000000 both are undefined.
    //     If 0b00000001 bg undefined, fg is defined.
    //     If 0b00000010 bg is defined, fg undefined.
    //     If 0b00000011 both are defined
    // (This is handled the same way as in v0)

    readBinary(data) {
      const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
      let offset = 0;

      const version = dv.getUint8(offset);
      offset += 1;

      if (version !== 1) {
        throw new Error(`Unsupported version: ${version}`);
      }

      const width = dv.getUint32(offset, true);
      offset += 4;

      const length = dv.getUint32(offset, true);
      offset += 4;

      const frameCount = dv.getUint32(offset, true);
      offset += 4;

      // Skip reserved byte
      offset += 1;

      const frames: ScreenBuffer[] = [];

      for (let frameIdx = 0; frameIdx < frameCount; frameIdx++) {
        // Read frame delay
        const delay = dv.getUint32(offset, true);
        offset += 4;

        const chars: StyledChar[] = [];

        for (let charIdx = 0; charIdx < length; charIdx++) {
          if (offset >= data.byteLength) {
            throw new Error(`Truncated data: expected ${length} chars per frame, ${frameCount} frames`);
          }

          const codepointRaw = dv.getUint32(offset, true);
          offset += 4;

          const flags = dv.getUint8(offset);
          offset += 1;

          let fg: Color | undefined = undefined;
          if (flags & 0b01) {
            fg = dv.getUint8(offset);
            offset += 1;
          }

          let bg: Color | undefined = undefined;
          if (flags & 0b10) {
            bg = dv.getUint8(offset);
            offset += 1;
          }

          chars.push({
            codepoint: codepointRaw === 0 ? null : codepointRaw,
            fg,
            bg,
          });
        }

        frames.push({ chars, width, delay });
      }

      if (offset < data.byteLength) {
        throw new Error(`Extra data found: expected ${offset} bytes, got ${data.byteLength}`);
      }

      return frames;
    },

    writeBinary(buffers) {
      if (buffers.length === 0) {
        throw new Error("Cannot write empty buffer array");
      }

      const width = buffers[0].width;
      const length = buffers[0].chars.length;
      const frameCount = buffers.length;

      // Helper to encode a single char (same as v0)
      function encodeChar(char: StyledChar): Uint8Array {
        const hasFg = char.fg !== undefined;
        const hasBg = char.bg !== undefined;

        const size = 5 + (hasFg ? 1 : 0) + (hasBg ? 1 : 0);

        const output = new ArrayBuffer(size);
        const dv = new DataView(output);

        dv.setUint32(0, char.codepoint ?? 0, true);

        let flags = 0;
        if (hasFg) flags |= 0b01;
        if (hasBg) flags |= 0b10;
        dv.setUint8(4, flags);

        let offset = 5;

        if (hasFg) {
          dv.setUint8(offset++, char.fg!);
        }

        if (hasBg) {
          dv.setUint8(offset++, char.bg!);
        }

        return new Uint8Array(output);
      }

      // Build header (14 bytes)
      const header = new ArrayBuffer(14);
      const headerDv = new DataView(header);
      headerDv.setUint8(0, 1); // version
      headerDv.setUint32(1, width, true);
      headerDv.setUint32(5, length, true);
      headerDv.setUint32(9, frameCount, true);
      headerDv.setUint8(13, 0); // reserved

      // Build all frame data
      const allFrameData: Uint8Array[] = [new Uint8Array(header)];

      for (const buffer of buffers) {
        if (buffer.width !== width) {
          throw new Error(`Frame width mismatch: expected ${width}, got ${buffer.width}`);
        }
        if (buffer.chars.length !== length) {
          throw new Error(`Frame length mismatch: expected ${length}, got ${buffer.chars.length}`);
        }

        // Frame delay (0 = undefined for now)
        const delayBuffer = new ArrayBuffer(4);
        const delayDv = new DataView(delayBuffer);
        delayDv.setUint32(0, 0, true);
        allFrameData.push(new Uint8Array(delayBuffer));

        // Encode all chars
        const encodedChars = buffer.chars.map(encodeChar);
        allFrameData.push(...encodedChars);
      }

      return concatUint8Arrays(allFrameData);
    },
  },
}

export function animatedBufferToBinary(buffer: ScreenBuffer[], version?: number): Uint8Array {
  if (version === undefined) {
    const versions = Object.keys(formatReaders).map(e => parseInt(e));
    versions.sort();
    return formatReaders[versions[versions.length - 1]].writeBinary(buffer);
  }
  if (formatReaders[version] === undefined) {
    throw new Error(`Unknown version ${version}`);
  }

  return formatReaders[version].writeBinary(buffer);
}

export function binaryToAnimatedBuffer(data: Uint8Array): ScreenBuffer[] {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const version = dv.getUint8(0);

  if (formatReaders[version] === undefined) {
    throw new Error(`Unknown version ${version}`);
  }

  return formatReaders[version].readBinary(data);
}
