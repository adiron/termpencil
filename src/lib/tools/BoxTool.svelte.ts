import { setCharAt, setCharsAt, type Color } from '../screenbuffer';
import type { Tool, GlobalState, TupLen } from '../types';
import BoxOptions from './BoxOptions.svelte';
import { BG, BOX_PRESETS, FG, type BoxPreset, type FrameOptions, type FrameOptionsExpanded } from './boxPresets';


interface BoxState {
  currentPreset: BoxPreset<Symbol> | null;
  presets: BoxPreset<Symbol>[];
  mouseDown: boolean;
  p1: [number, number] | undefined;
  p2: [number, number] | undefined;
}

export function makeResolver(
  fg: Color | undefined,
  bg: Color | undefined,
) {
  const walk = (v: unknown): unknown => {
    if (typeof v === "symbol") {
      if (v === FG) return fg;
      if (v === BG) return bg;
      throw new Error(`Unknown symbol placeholder: ${String(v)}`);
    }

    if (v === null || v === undefined) return v;
    if (typeof v !== "object") return v;

    if (Array.isArray(v)) return v.map(walk);

    // Plain object needs to be walked through
    const out: Record<PropertyKey, unknown> = {};
    for (const k of Reflect.ownKeys(v)) {
      out[k] = walk((v as any)[k]);
    }
    return out;
  };

  return (preset: BoxPreset<Symbol>): BoxPreset<undefined> =>
    walk(preset) as BoxPreset<undefined>
}

function fourTimes<T>(o: T): TupLen<4, T> {
  return [o, o, o, o];
}

function expandFrameOptions(options: FrameOptions): FrameOptionsExpanded {
  if ('all' in options) {
    return {
      edge: fourTimes(options.all),
      corner: fourTimes(options.all),
    }
  }

  return {
    edge: !Array.isArray(options.edge) ? fourTimes(options.edge) : options.edge,
    corner: !Array.isArray(options.corner) ? fourTimes(options.corner) : options.corner,
  }
}

export class BoxTool implements Tool {
  name = "brush";
  showSelection = false;
  optionsComponent = BoxOptions;

  boxState: BoxState = {
    presets: BOX_PRESETS,
    currentPreset: null,
    mouseDown: false,
    p1: undefined,
    p2: undefined,
  }

  onClick(index: number, state: GlobalState): void {
    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);
    this.boxState.p1 = [x, y];
    this.boxState.p2 = undefined;
  }

  onMouseUp(index: number, state: GlobalState): void {
    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);
    this.boxState.p2 = [x, y];
    this.paint(state);
  }

  onDrag(index: number, state: GlobalState): void {
    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);
    this.boxState.p2 = [x, y];
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
  }

  private paint(state: GlobalState): void {
    if (this.boxState.p1 === undefined || this.boxState.p2 === undefined) return;
    if (this.boxState.currentPreset === null) {
      console.log("No preset")
      return;
    }

    const resolvedPreset = makeResolver(state.fg, state.bg)(this.boxState.currentPreset);

    const origin = [
      Math.min(this.boxState.p1[0], this.boxState.p2[0]),
      Math.min(this.boxState.p1[1], this.boxState.p2[1]),
    ];
    const size = [
      Math.abs(this.boxState.p1[0] - this.boxState.p2[0]) + 1,
      Math.abs(this.boxState.p1[1] - this.boxState.p2[1]) + 1,
    ];

    if (resolvedPreset.shadow) {
      const { offset, color } = resolvedPreset.shadow;
      if (color) {
        for (let y = 0; y < size[1]; y++) {
          setCharsAt(
            state.buffer,
            origin[0] + offset[0],
            origin[1] + offset[1] + y,
            Array.from({ length: size[0] }, () => color)
          );
        }
      }
    }

    // Fill
    if (resolvedPreset.color) {
      const fillChar = resolvedPreset.color;
      const hasFrame = !!resolvedPreset.frame;

      const yStart = hasFrame ? 1 : 0;
      const yEnd = hasFrame ? size[1] - 1 : size[1];
      const xOffset = hasFrame ? 1 : 0;
      const drawWidth = hasFrame ? size[0] - 2 : size[0];

      if (drawWidth > 0) {
        for (let y = yStart; y < yEnd; y++) {
          setCharsAt(
            state.buffer,
            origin[0] + xOffset,
            origin[1] + y,
            Array.from({ length: drawWidth }, () => fillChar)
          );
        }
      }
    }

    if (resolvedPreset.frame) {
      const frameOptions = expandFrameOptions(resolvedPreset.frame)

      if (frameOptions.corner) {
        // Top-left corner
        if (frameOptions.corner[0] !== null) {
          setCharAt(
            state.buffer,
            origin[0],
            origin[1],
            frameOptions.corner[0],
          )
        }
        // Top-right corner
        if (frameOptions.corner[1] !== null) {
          setCharAt(
            state.buffer,
            origin[0] + size[0] - 1,
            origin[1],
            frameOptions.corner[1],
          )
        }
        // Bottom-right corner
        if (frameOptions.corner[2] !== null) {
          setCharAt(
            state.buffer,
            origin[0] + size[0] - 1,
            origin[1] + size[1] - 1,
            frameOptions.corner[2],
          )
        }
        // Bottom-left corner
        if (frameOptions.corner[3] !== null) {
          setCharAt(
            state.buffer,
            origin[0],
            origin[1] + size[1] - 1,
            frameOptions.corner[3],
          )
        }
      }

      if (frameOptions.edge) {
        // Top border
        if (frameOptions.edge[0] !== null) {
          setCharsAt(
            state.buffer,
            origin[0] + 1,
            origin[1],
            Array.from({ length: size[0] - 2 }, () => frameOptions.edge[0]!)
          );
        }
        // Right border
        if (frameOptions.edge[1] !== null) {
          for (let i = 1; i < size[1] - 1; i++) {
            setCharAt(
              state.buffer,
              origin[0] + size[0] - 1,
              origin[1] + i,
              frameOptions.edge[1]!
            );
          }
        }
        // Bottom border
        if (frameOptions.edge[2] !== null) {
          setCharsAt(
            state.buffer,
            origin[0] + 1,
            origin[1] + size[1] - 1,
            Array.from({ length: size[0] - 2 }, () => frameOptions.edge[2]!)
          );
        }
        // Left border
        if (frameOptions.edge[3] !== null) {
          for (let i = 1; i < size[1] - 1; i++) {
            setCharAt(
              state.buffer,
              origin[0],
              origin[1] + i,
              frameOptions.edge[3]!
            );
          }
        }
      }

    }
  }
}
