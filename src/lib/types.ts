import type { ScreenBuffer, Color } from './screenbuffer';

import type { ComponentType } from 'svelte';

export interface Tool {
    name: string;
    optionsComponent?: ComponentType;
    onClick(index: number, state: GlobalState): void;
    onDrag(index: number, state: GlobalState): void;
    onKeyDown(event: KeyboardEvent, state: GlobalState): void;
}

export interface GlobalState {
    buffer: ScreenBuffer;
    tool: Tool;
    palette: string[];
    charSize: [number, number];
    caret: number | null;
    fg: Color | undefined;
    bg: Color | undefined;
    char: number | null;
}
