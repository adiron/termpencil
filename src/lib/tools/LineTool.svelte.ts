import { setCharAt, type Color, type ScreenBuffer, makeEmptyScreenBuffer, getRowCount } from '../screenbuffer';
import type { Tool, GlobalState } from '../types';
import { flushEditBuffer } from '../state.svelte';
import { normalizeAngle, setCharHelper } from '../utils';
import LineOptions from './LineOptions.svelte';
import { LINE_STYLES, type LineStyle } from './lineStyles';

interface LineState {
  p1: [number, number] | undefined;
  p2: [number, number] | undefined;
  currentStyleId: string | null;
}

// Given p1 and p2, returns all points according to Brensham's algorithm.
export function bresenhamPoints(p1: [number, number], p2: [number, number]): Array<[number, number]> {
  let [x0, y0] = p1;
  const [x1, y1] = p2;

  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  const points: Array<[number, number]> = [];

  while (true) {
    points.push([x0, y0]);
    if (x0 === x1 && y0 === y1) {
      break;
    }

    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
}

function codepointForAngle(style: LineStyle, angle: number): number | null {
  const normalized = normalizeAngle(angle);
  const range = style.ranges.find((r) => {
    if (r.from <= r.to) {
      return normalized >= r.from && normalized < r.to;
    }
    return normalized >= r.from || normalized < r.to;
  });

  return range?.codepoint ?? null;
}

function angleForSegment(from: [number, number], to: [number, number], charSize: [number, number]): number {
  const [charWidth, charHeight] = charSize;
  const dx = (to[0] - from[0]) * charWidth;
  // In screen coordinates Y grows downward, so invert Y for geometric angle.
  const dy = -(to[1] - from[1]) * charHeight;
  return normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
}

function resolveLineCodepoint(
  style: LineStyle | null | undefined,
  angle: number,
  currentChar: number | null,
): number | null {
  if (!style) return currentChar;
  return codepointForAngle(style, angle) ?? currentChar;
}

function snapToEightDirections(
  p1: [number, number],
  p2: [number, number],
  charSize: [number, number],
): [number, number] {
  const [charWidth, charHeight] = charSize;
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];

  if (dx === 0 && dy === 0) return p2;

  const dispVisual: [number, number] = [dx * charWidth, -dy * charHeight];
  const dispMag = Math.hypot(dispVisual[0], dispVisual[1]);
  if (dispMag === 0) return p2;

  const directions: Array<[number, number]> = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];

  let bestDir = directions[0];
  let bestDot = -Infinity;

  for (const dir of directions) {
    const dirVisual: [number, number] = [dir[0] * charWidth, -dir[1] * charHeight];
    const dirMag = Math.hypot(dirVisual[0], dirVisual[1]);
    if (dirMag === 0) continue;
    const dot = (dispVisual[0] / dispMag) * (dirVisual[0] / dirMag) +
      (dispVisual[1] / dispMag) * (dirVisual[1] / dirMag);
    if (dot > bestDot) {
      bestDot = dot;
      bestDir = dir;
    }
  }

  const bestDirVisual: [number, number] = [bestDir[0] * charWidth, -bestDir[1] * charHeight];
  const denom = (bestDirVisual[0] ** 2) + (bestDirVisual[1] ** 2);
  if (denom === 0) return p2;

  const projectedSteps = Math.round(
    ((dispVisual[0] * bestDirVisual[0]) + (dispVisual[1] * bestDirVisual[1])) / denom,
  );

  return [
    p1[0] + (bestDir[0] * projectedSteps),
    p1[1] + (bestDir[1] * projectedSteps),
  ];
}

export function paintLine(
  buffer: ScreenBuffer<any>,
  p1: [number, number],
  p2: [number, number],
  style: LineStyle | null | undefined,
  currentChar: number | null,
  charSize: [number, number],
  fg: Color | undefined,
  bg: Color | undefined,
) {
  const points = bresenhamPoints(p1, p2);

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    let angle = 0;
    if (points.length > 1) {
      const a = i === points.length - 1 ? points[i - 1] : point;
      const b = i === points.length - 1 ? point : points[i + 1];
      angle = angleForSegment(a, b, charSize);
    }

    const codepoint = resolveLineCodepoint(style, angle, currentChar);
    setCharAt(buffer, point[0], point[1], { codepoint, fg, bg });
  }
}

export class LineTool implements Tool {
  name = 'line';
  showSelection = false;
  optionsComponent = LineOptions;

  lineState: LineState = $state({
    p1: undefined,
    p2: undefined,
    currentStyleId: null,
  });

  onClick(index: number, state: GlobalState, _x: number, _y: number, shiftKey?: boolean): void {
    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);
    this.lineState.p1 = [x, y];
    this.lineState.p2 = shiftKey ? [x, y] : undefined;
  }

  onDrag(index: number, state: GlobalState, _x: number, _y: number, shiftKey?: boolean): void {
    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);
    this.lineState.p2 = this.getEndpointWithConstraint([x, y], state, !!shiftKey);
    this.updatePreview(state);
  }

  onMouseUp(index: number, state: GlobalState, _x: number, _y: number, shiftKey?: boolean): void {
    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);

    if (!this.lineState.p1) return;

    this.lineState.p2 = this.getEndpointWithConstraint([x, y], state, !!shiftKey);
    this.updatePreview(state);
    flushEditBuffer(state);
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    setCharHelper(event, state);
  }

  private updatePreview(state: GlobalState): void {
    if (!this.lineState.p1 || !this.lineState.p2) return;

    const style = this.lineState.currentStyleId
      ? (LINE_STYLES.find((s) => s.id === this.lineState.currentStyleId) ?? null)
      : null;

    state.editBuffer = makeEmptyScreenBuffer(state.buffer.width, getRowCount(state.buffer), undefined);

    paintLine(
      state.editBuffer,
      this.lineState.p1,
      this.lineState.p2,
      style,
      state.char,
      state.charSize,
      state.fg,
      state.bg,
    );
  }

  private getEndpointWithConstraint(
    p2: [number, number],
    state: GlobalState,
    useConstraint: boolean,
  ): [number, number] {
    if (!useConstraint || !this.lineState.p1) return p2;

    const snapped = snapToEightDirections(this.lineState.p1, p2, state.charSize);
    const height = getRowCount(state.buffer);

    return [
      Math.max(0, Math.min(state.buffer.width - 1, snapped[0])),
      Math.max(0, Math.min(height - 1, snapped[1])),
    ];
  }
}
