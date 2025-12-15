import type { Tool, GlobalState } from '../types';

export class CursorTool implements Tool {
    name = "cursor";
    showSelection = true;

    onClick(index: number, state: GlobalState): void {
        state.caret = index;
    }

    onDrag(_index: number, _state: GlobalState): void {
        // Cursor tool doesn't do anything on drag for now
    }

    onKeyDown(event: KeyboardEvent, state: GlobalState): void {
        if (state.caret === null) return;

        if (event.key === "ArrowRight") {
            this.moveSelect(1, state);
        } else if (event.key === "ArrowLeft") {
            this.moveSelect(-1, state);
        } else if (event.key === "ArrowDown") {
            this.moveSelect(state.buffer.width, state);
        } else if (event.key === "ArrowUp") {
            this.moveSelect(-state.buffer.width, state);
        } else if (
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey &&
            event.key.length === 1
        ) {
            const char = state.buffer.chars[state.caret];
            char.codepoint = event.key.codePointAt(0) || null;
            char.fg = state.fg;
            char.bg = state.bg;
            this.moveSelect(1, state);
            event.preventDefault();
        }
    }

    private moveSelect(n: number, state: GlobalState) {
        if (state.caret === null) return;
        state.caret = (state.caret + n) % state.buffer.chars.length;
        if (state.caret < 0) {
            state.caret = state.buffer.chars.length + state.caret;
        }
    }
}
