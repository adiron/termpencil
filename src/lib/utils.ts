import type { GlobalState } from "./types";

export function mapRange(value: number, low1: number, high1: number, low2: number, high2: number) {
  return low2 + (high2 - low2) * ((value - low1) / (high1 - low1));
}

export function concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const c of chunks) {
    totalLength += c.length;
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const c of chunks) {
    result.set(c, offset);
    offset += c.length;
  }

  return result;
}

export function randBetween(start: number, end: number): number {
  if (start > end) {
    [start, end] = [end, start];
  }

  return Math.random() * (end - start) + start;
}

export function setCharHelper(event: KeyboardEvent, state: GlobalState): void {
    if (
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      event.key.length === 1
    ) {
      state.char = event.key.codePointAt(0) || null;
      event.preventDefault();
    }
}
