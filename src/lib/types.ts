// This extension is required because of the CLI tool
import type { ScreenBuffer, StyledChar, Color } from "./screenbuffer.js";

import type { Component } from 'svelte';

export type ScreenBufferFrames = ScreenBuffer[];

export interface Tool {
  name: string;
  optionsComponent?: Component<any>;
  onClick(index: number, state: GlobalState, x: number, y: number, shiftKey?: boolean): void;
  onMouseUp(index: number, state: GlobalState, x: number, y: number, shiftKey?: boolean): void;
  onDrag(index: number, state: GlobalState, x: number, y: number, shiftKey?: boolean): void;
  onKeyDown(event: KeyboardEvent, state: GlobalState): void;
  onDeactivate?(state: GlobalState): void;
  showSelection?: boolean;
}

export interface DisplayImage {
  data: ArrayBuffer | null;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

export type PickerRange = [string,number,number]

export interface GlobalState {
  // State
  buffer: ScreenBufferFrames;
  tool: Tool;
  previousTool: Tool | null;
  fg: Color | undefined;
  bg: Color | undefined;
  char: number | null;
  image: DisplayImage;
  editorHasKeyboard: boolean;
  editBuffer: ScreenBuffer<StyledChar | undefined>;
  caret: number | null;
  undoBuffers: ScreenBufferFrames[];
  currentFrame: number;

  // Terminal display options
  palette: string[];
  // These colors are the TERMINAL'S default.
  // They are what happens when the user has `undefined`
  // for the colors. (i.e. after reset)
  defaultFg: string;
  defaultBg: string;
  charSize: [number, number];
  // Name (for font-family)
  font: string;

  // Other UI settings
  // This is managed here because I will wnat to save this 
  // and I do not want the component itself to handle this.
  showPicker: boolean;
  // likewise:
  pickerRanges: PickerRange[];
}

// Utility to make tuple of the same type of length N.
// Example: a: TupLen<2, number>
export type TupLen<N extends number, T = any, A extends T[] = []> =
  N extends A['length'] ? A : TupLen<N, T, [T, ...A]>;
