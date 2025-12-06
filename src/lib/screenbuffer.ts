export type Color = number | [number, number, number];

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
  if (typeof color === 'number') {
    return `\x1b[${prefix};5;${color}m`;
  } else {
    const [r, g, b] = color;
    return `\x1b[${prefix};2;${r};${g};${b}m`;
  }
}

function colorsEqual(a: Color | undefined, b: Color | undefined): boolean {
  if (a === b) return true;
  if (a === undefined || b === undefined) return false;

  if (typeof a === 'number' && typeof b === 'number') {
    return a === b;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  }
  return false;
}

export function renderToTerminal(buffer: ScreenBuffer): string {
  let output = "";
  let lastFg: Color | undefined = undefined;
  let lastBg: Color | undefined = undefined;

  for (let i = 0; i < buffer.chars.length; i++) {
    if (i > 0 && i % buffer.width === 0) {
      output += "\n";
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

