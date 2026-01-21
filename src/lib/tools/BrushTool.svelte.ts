// This is in a Svelte file because the paintChar property needs to 
// be reactive in order to be bound in the UI. This has no real 
// downside afaik so...

import type { Tool, GlobalState } from '../types';
import BrushOptions from './BrushOptions.svelte';
import { flushEditBuffer } from '../state.svelte';

type PaintMode = "both" | "char" | "color"

interface BrushState {
  paintMode: PaintMode;
  size: number;
}

export class BrushTool implements Tool {
  name = "brush";
  brushState: BrushState = $state({
    paintMode: "both",
    size: 1
  });
  showSelection = false;
  optionsComponent = BrushOptions;

  onClick(index: number, state: GlobalState, x: number, y: number): void {
    this.paint(index, state);
  }

  onDrag(index: number, state: GlobalState, x: number, y: number): void {
    this.paint(index, state);
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
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

  onMouseUp(index: number, state: GlobalState, x: number, y: number): void {
    flushEditBuffer(state);
  }

  private paint(index: number, state: GlobalState): void {
    if (index < 0 || index >= state.buffer.chars.length) return;

    const x = index % state.buffer.width;
    const y = Math.floor(index / state.buffer.width);

    // Seeded with initial index because that's always true
    let indices = [index];

    if (this.brushState.size > 1) {
      const bufferWidth = state.buffer.width;
      const bufferHeight = Math.ceil(state.buffer.chars.length / state.buffer.width);

      // These calculations are wrong:
      const offsMin = Math.ceil(this.brushState.size / -2);
      const offsMax = Math.ceil(this.brushState.size / 2);

      const coords: [number, number][] = [];

      for (let xOffset = offsMin; xOffset < offsMax; xOffset++) {
        for (let yOffset = offsMin; yOffset < offsMax; yOffset++) {
          const newCoord: [number, number] = [
            xOffset + x,
            yOffset + y,
          ];
          if (newCoord[0] < 0 ||
            newCoord[1] < 0 ||
            newCoord[0] > bufferWidth ||
            newCoord[1] >= bufferHeight) {
            continue;
          }
          coords.push(newCoord);
        }
      }

      coords.forEach((coord) => {
        indices.push(
          coord[0] + (coord[1] * state.buffer.width)
        );
      });

      indices = indices.filter(e => e < state.buffer.chars.length);
    }

    for (let i = 0; i < indices.length; i++) {
      const baseChar = state.buffer.chars[indices[i]];
      const newChar = { ...baseChar };

      if (this.brushState.paintMode === "both" || this.brushState.paintMode === "color") {
        newChar.fg = state.fg;
        newChar.bg = state.bg;
      }
      if ((this.brushState.paintMode === "both" || this.brushState.paintMode === "char")
        && state.char !== null) {
        newChar.codepoint = state.char;
      }

      // Write to editBuffer
      state.editBuffer.chars[indices[i]] = newChar;
    }

  }
}
