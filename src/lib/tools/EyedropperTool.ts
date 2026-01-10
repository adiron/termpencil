import type { Tool, GlobalState } from '../types';

export class EyedropperTool implements Tool {
  name = "eyedropper";

  onClick(index: number, state: GlobalState): void {
    this.sample(index, state);
  }

  onDrag(index: number, state: GlobalState): void {
    this.sample(index, state);
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    // Eyedropper doesn't handle keyboard input
  }

  onMouseUp(index: number, state: GlobalState, x: number, y: number): void {
    // nothing
  }

  private sample(index: number, state: GlobalState): void {
    if (index < 0 || index >= state.buffer.chars.length) return;
    const char = state.buffer.chars[index];
    state.fg = char.fg;
    state.bg = char.bg;
    state.char = char.codepoint;
  }
}
