import type { Tool, GlobalState } from '../types';
import type { Color } from '../screenbuffer';
import BrushOptions from './BrushOptions.svelte';

export class BrushTool implements Tool {
    name = "brush";
    paintChar = false;
    optionsComponent = BrushOptions as any;

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

    private paint(index: number, state: GlobalState): void {
        if (index < 0 || index >= state.buffer.chars.length) return;
        const char = state.buffer.chars[index];
        char.fg = state.fg;
        char.bg = state.bg;
        if (this.paintChar && state.char !== null) {
            char.codepoint = state.char;
        }
    }
}
