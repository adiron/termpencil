import type { Tool, GlobalState } from '../types';
import BrushOptions from './BrushOptions.svelte';
import { flushEditBuffer } from '../state.svelte';
import { setCharHelper } from '../utils';

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

  onClick(index: number, state: GlobalState, x: number, y: number, _shiftKey?: boolean): void {
    this.paint(index, state);
  }

  onDrag(index: number, state: GlobalState, x: number, y: number, _shiftKey?: boolean): void {
    this.paint(index, state);
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    setCharHelper(event, state);
  }

  onMouseUp(index: number, state: GlobalState, x: number, y: number, _shiftKey?: boolean): void {
    flushEditBuffer(state);
  }

  private paint(index: number, state: GlobalState): void {
    if (index < 0 || index >= state.buffer[state.currentFrame].chars.length) return;

    const x = index % state.buffer[state.currentFrame].width;
    const y = Math.floor(index / state.buffer[state.currentFrame].width);

    // Seeded with initial index because that's always true
    let indices = [index];

    if (this.brushState.size > 1) {
      const bufferWidth = state.buffer[state.currentFrame].width;
      const bufferHeight = Math.ceil(state.buffer[state.currentFrame].chars.length / state.buffer[state.currentFrame].width);

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
          coord[0] + (coord[1] * state.buffer[state.currentFrame].width)
        );
      });

      indices = indices.filter(e => e < state.buffer[state.currentFrame].chars.length);
    }

    for (let i = 0; i < indices.length; i++) {
      const baseChar = state.buffer[state.currentFrame].chars[indices[i]];
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
