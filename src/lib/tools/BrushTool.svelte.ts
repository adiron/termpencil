// This is in a Svelte file because the paintChar property needs to 
// be reactive in order to be bound in the UI. This has no real 
// downside afaik so...

import type { Tool, GlobalState } from '../types';
import BrushOptions from './BrushOptions.svelte';
import { flushEditBuffer } from '../state.svelte';

type PaintMode = "both" | "char" | "color"

export class BrushTool implements Tool {
  name = "brush";
  paintMode = $state("both" as PaintMode);
  showSelection = false;
  optionsComponent = BrushOptions;

  onClick(index: number, state: GlobalState): void {
    this.paint(index, state);
  }

  onDrag(index: number, state: GlobalState): void {
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

    // Read from existing buffer to preserve state (since overlay replaces)
    const baseChar = state.buffer.chars[index];
    const newChar = { ...baseChar };

    // Check if we already have a char in editBuffer (accumulate changes)
    const existingEditChar = state.editBuffer.chars[index];
    if (existingEditChar) {
      Object.assign(newChar, existingEditChar);
    }

    if (this.paintMode === "both" || this.paintMode === "color") {
      newChar.fg = state.fg;
      newChar.bg = state.bg;
    }
    if ((this.paintMode === "both" || this.paintMode === "char")
      && state.char !== null) {
      newChar.codepoint = state.char;
    }

    // Write to editBuffer
    state.editBuffer.chars[index] = newChar;
  }
}
