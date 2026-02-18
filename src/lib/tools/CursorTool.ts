import type { StyledChar } from '../screenbuffer';
import { flushEditBuffer } from '../state.svelte';
import type { Tool, GlobalState } from '../types';

const DEBOUNCE_DELAY_MS = 500;

export class CursorTool implements Tool {
  name = "cursor";
  showSelection = true;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  onClick(index: number, state: GlobalState, _x: number, _y: number, _shiftKey?: boolean): void {
    state.caret = index;
  }

  onDrag(_index: number, _state: GlobalState, _x: number, _y: number, _shiftKey?: boolean): void {
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    if (state.caret === null) return;

    if (event.key === "ArrowRight") {
      this.moveSelect(1, state);
    } else if (event.key === "ArrowLeft") {
      this.moveSelect(-1, state);
    } else if (event.key === "ArrowDown") {
      this.moveSelect(state.buffer[state.currentFrame].width, state);
    } else if (event.key === "ArrowUp") {
      this.moveSelect(-state.buffer[state.currentFrame].width, state);
    } else if (
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      event.key.length === 1
    ) {
      const char: StyledChar = {
        codepoint: event.key.codePointAt(0) || null,
        fg: state.fg,
        bg: state.bg,
      };
      state.editBuffer.chars[state.caret] = char;
      this.scheduleFlush(state);
      this.moveSelect(1, state);
      event.preventDefault();
    }
  }

  onMouseUp(index: number, state: GlobalState, x: number, y: number, _shiftKey?: boolean): void {
  }

  onDeactivate(state: GlobalState): void {
    this.forceFlush(state);
  }

  private scheduleFlush(state: GlobalState): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => {
      flushEditBuffer(state);
      this.flushTimer = null;
    }, DEBOUNCE_DELAY_MS);
  }

  private forceFlush(state: GlobalState): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    flushEditBuffer(state);
  }

  private moveSelect(n: number, state: GlobalState) {
    if (state.caret === null) return;
    state.caret = (state.caret + n) % state.buffer[state.currentFrame].chars.length;
    if (state.caret < 0) {
      state.caret = state.buffer[state.currentFrame].chars.length + state.caret;
    }
  }
}
