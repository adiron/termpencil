import type { ScreenBuffer, Color } from './screenbuffer';

import type { Component } from 'svelte';

export interface Tool {
  name: string;
  optionsComponent?: Component<any>;
  onClick(index: number, state: GlobalState, x: number, y: number): void;
  onDrag(index: number, state: GlobalState, x: number, y: number): void;
  onKeyDown(event: KeyboardEvent, state: GlobalState): void;
  showSelection?: boolean;
}

export interface GlobalState {
  buffer: ScreenBuffer;
  tool: Tool;
  palette: string[];

  // These colors are the TERMINAL'S default.
  // They are what happens when the user has `undefined`
  // for the colors. (i.e. after reset)
  defaultFg: string;
  defaultBg: string;

  charSize: [number, number];
  caret: number | null;
  fg: Color | undefined;
  bg: Color | undefined;
  char: number | null;

  image: {
    data: ArrayBuffer | null;
    x: number;
    y: number;
    scale: number;
    opacity: number;
  }
}
