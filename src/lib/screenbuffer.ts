export const DEFAULT_CHAR: StyledChar = { codepoint: null, fg: undefined, bg: undefined };

// Color refers to the index of the color in the palette (0-255)
export type Color = number;

export interface StyledChar {
  codepoint: number | null;
  fg: Color | undefined;
  bg: Color | undefined;
}

export interface ScreenBuffer<T = StyledChar> {
  chars: T[];
  width: number;
  delay?: number;  // animation frame delay in ms
}

export function getRowCount(buffer: ScreenBuffer<any>): number {
  if (buffer.width === 0) return 0;
  return Math.ceil(buffer.chars.length / buffer.width);
}

// Generates a pure string (just the text, disregarding color)
export function screenBufferToString(buffer: ScreenBuffer<StyledChar>): string {
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

export function getCharAt<T>(buffer: ScreenBuffer<T>, x: number, y: number): T {
  if (x < 0 || x >= buffer.width || y < 0) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  const idx = x + (y * buffer.width);

  if (idx >= buffer.chars.length) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  return buffer.chars[idx];
}

export function setCharAt<T>(buffer: ScreenBuffer<T>, x: number, y: number, char: T): void {
  if (x < 0 || x >= buffer.width || y < 0) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  const idx = x + (y * buffer.width);

  if (idx >= buffer.chars.length) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }

  buffer.chars[idx] = char;
}

export function setCharsAt<T>(buffer: ScreenBuffer<T>, x: number, y: number, chars: T[]): void {
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

    if (lastFg !== char.fg) {
      if (char.fg === undefined) {
        output += "\x1b[39m";
      } else {
        output += colorToAnsi(char.fg, false);
      }
      lastFg = char.fg;
    }

    if (lastBg !== char.bg) {
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

export function makeEmptyScreenBuffer<T>(width: number, height: number, initialValue: T): ScreenBuffer<T> {
  return {
    chars: Array.from({ length: width * height }, () => (
      // This is here because objects must be cloned to prevent
      // referencing the same object in all cells.
      (typeof initialValue === "object" && initialValue !== null)
        ? { ...initialValue }
        : initialValue
    )),
    width: width
  };
}

export function mergeScreenBuffersInPlace<T>(
  base: ScreenBuffer<T>,
  overlay: ScreenBuffer<T | undefined>
): void {
  if (base.width !== overlay.width) {
    throw new Error(`Buffer widths do not match: ${base.width} vs ${overlay.width}`);
  }
  if (base.chars.length !== overlay.chars.length) {
    throw new Error(`Buffer lengths do not match: ${base.chars.length} vs ${overlay.chars.length}`);
  }

  for (let i = 0; i < base.chars.length; i++) {
    // If overlay[i] is NOT undefined, it strictly replaces base[i]
    base.chars[i] = overlay.chars[i] ?? base.chars[i];
  }
}

export function copyScreenBuffer<T>( buffer: ScreenBuffer<T>) : ScreenBuffer<T> {
  return {
    width: buffer.width,
    chars: [ ...buffer.chars ],
  };
}

export function resizeScreenBuffer<T>(buffer: ScreenBuffer<T>, width: number, height: number, initialValue: T): ScreenBuffer<T> {
  // No resizing needed
  if (width === buffer.width &&
    height === Math.ceil(buffer.chars.length / width)) {
    return buffer;
  }

  const newbuf = makeEmptyScreenBuffer(width, height, initialValue);

  const minWidth = Math.min(buffer.width, width);
  const minHeight = Math.min(getRowCount(buffer), height);

  for (let y = 0; y < minHeight; y++) {
    for (let x = 0; x < minWidth; x++) {
      const char = getCharAt(buffer, x, y);
      setCharAt(newbuf, x, y, char);
    }
  }

  return newbuf;
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

