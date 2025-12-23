import { concatUint8Arrays } from "./utils";

// Color is either a number (index in palette) or an RGB tuple
export type Color = number;

export interface StyledChar {
  codepoint: number | null;
  fg: Color | undefined;
  bg: Color | undefined;
}

export interface ScreenBuffer {
  chars: StyledChar[];
  width: number;
}

export function getRowCount(buffer: ScreenBuffer): number {
  if (buffer.width === 0) return 0;
  return Math.ceil(buffer.chars.length / buffer.width);
}

// Generates a pure string (just the text, disregarding color)
export function screenBufferToString(buffer: ScreenBuffer): string {
  let output = "";
  for (let i = 0; i < buffer.chars.length; i++) {
    if (i > 0 && i % buffer.width === 0) {
      output += "\n";
    }
    const cp = buffer.chars[i].codepoint
    if (cp !== null) {
      output += String.fromCodePoint(cp);
    } else {
      output += " ";
    }
  }
  return output;
}

export function getCharAt(buffer: ScreenBuffer, x: number, y: number): StyledChar {
  if (x < 0 || x >= buffer.width || y < 0) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  const idx = x + (y * buffer.width);

  if (idx >= buffer.chars.length) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  return buffer.chars[idx];
}

export function setCharAt(buffer: ScreenBuffer, x: number, y: number, char: StyledChar): void {
  if (x < 0 || x >= buffer.width || y < 0) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  const idx = x + (y * buffer.width);

  if (idx >= buffer.chars.length) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  buffer.chars[idx] = char;
}

export function setCharsAt(buffer: ScreenBuffer, x: number, y: number, chars: StyledChar[]): void {
  let currentX = x;
  let currentY = y;

  for (const char of chars) {
    try {
      setCharAt(buffer, currentX, currentY, char);
    } catch (e) {
      // Stop if we go out of bounds
      break;
    }

    currentX++;
    if (currentX >= buffer.width) {
      currentX = 0;
      currentY++;
    }
  }
}

function colorToAnsi(color: Color, isBg: boolean): string {
  const prefix = isBg ? 48 : 38;
  return `\x1b[${prefix};5;${color}m`;
}

function colorsEqual(a: Color | undefined, b: Color | undefined): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b;
  }
  if (a === b) return true;
  return false;
}

export function renderToTerminal(buffer: ScreenBuffer): string {
  let output = "";
  let lastFg: Color | undefined = undefined;
  let lastBg: Color | undefined = undefined;

  for (let i = 0; i < buffer.chars.length; i++) {
    if (i > 0 && i % buffer.width === 0) {
      output += "\x1b[0m\n";
      lastFg = undefined;
      lastBg = undefined;
    }

    const char = buffer.chars[i];

    if (!colorsEqual(lastFg, char.fg)) {
      if (char.fg === undefined) {
        output += "\x1b[39m";
      } else {
        output += colorToAnsi(char.fg, false);
      }
      lastFg = char.fg;
    }

    if (!colorsEqual(lastBg, char.bg)) {
      if (char.bg === undefined) {
        output += "\x1b[49m";
      } else {
        output += colorToAnsi(char.bg, true);
      }
      lastBg = char.bg;
    }

    if (char.codepoint !== null) {
      output += String.fromCodePoint(char.codepoint);
    } else {
      output += " ";
    }
  }

  output += "\x1b[0m";
  return output;
}

export function makeEmptyScreenBuffer(width: number, height: number): ScreenBuffer {
  return {
    chars: Array.from({ length: width * height }, () => ({ codepoint: null, fg: undefined, bg: undefined })),
    width: width
  };
}


export function generateShellScript(buffer: ScreenBuffer): string {
  const ansiContent = renderToTerminal(buffer);

  const escaped = ansiContent
    .replace(/\\/g, "\\\\\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x00/g, "\\0")
    .replace(/\x1b/g, "\\x1b");

  return `#!/bin/zsh
print -n $'${escaped}'
`;
}


// Binary format:
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

export function screenBufferToBinary(buffer: ScreenBuffer): Uint8Array {
  const header = encodeHeader(buffer);
  const encodedChars = buffer.chars.map(encodeChar);
  const chars = concatUint8Arrays(encodedChars);
  return concatUint8Arrays([header, chars]);
}

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

export function screenBufferFromBinary(data: Uint8Array): ScreenBuffer {
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

  return {
    chars,
    width,
  };
}
