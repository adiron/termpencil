import {
  makeEmptyScreenBuffer,
  getRowCount,
  type StyledChar,
  DEFAULT_CHAR,
  mergeScreenBuffersInPlace,
  copyScreenBuffer,
} from "./screenbuffer";
import {
  BUFFER_HISTORY_MAX,
  DEFAULT_BG,
  DEFAULT_FG,
  DEFAULT_PALETTE,
  DEFAULT_PICKER_RANGES,
} from "./constants";
import type { GlobalState, Tool } from "./types";
import { CursorTool } from "./tools/CursorTool";

export let globalState: GlobalState = $state({
  buffer: makeEmptyScreenBuffer(80, 40, DEFAULT_CHAR),
  tool: new CursorTool(),
  previousTool: null,
  palette: DEFAULT_PALETTE,
  defaultBg: DEFAULT_BG,
  defaultFg: DEFAULT_FG,
  charSize: [10, 18],
  caret: null,
  fg: undefined,
  bg: undefined,
  char: null,
  image: {
    data: null,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0.3,
  },
  editorHasKeyboard: true,
  editBuffer: makeEmptyScreenBuffer<StyledChar | undefined>(80, 40, undefined),
  pickerRanges: DEFAULT_PICKER_RANGES,
  font: "Courier New",
  showPicker: true,
  undoBuffers: [],
});

// This is generally called on mouse up or similar.
// This will add the current `editBuffer` to the `buffer` and increase undo depth. (to a mx of BUFFER_HISTORY_MAX)
export function flushEditBuffer(state: GlobalState) {
  // Add current buffer to undo stack
  state.undoBuffers.push(copyScreenBuffer(state.buffer));
  if (state.undoBuffers.length >= BUFFER_HISTORY_MAX) {
    console.log("Flushing old undos")
    state.undoBuffers.splice(0, state.undoBuffers.length - BUFFER_HISTORY_MAX);
  }

  // Set current buffer to a composite
  mergeScreenBuffersInPlace(state.buffer, state.editBuffer);
  // Reset editBuffer to empty.
  state.editBuffer = makeEmptyScreenBuffer(state.buffer.width, getRowCount(state.buffer), undefined);
}

export function undo(state: GlobalState, depth: number = 0) {
  if (depth < 0) {
    return;
  }
  if (depth >= state.undoBuffers.length) {
    return;
  }

  const newHead = state.undoBuffers[state.undoBuffers.length - depth - 1];
  const newUndoBuffers = state.undoBuffers.slice(0, state.undoBuffers.length - depth - 1);

  state.buffer = newHead;
  state.undoBuffers = newUndoBuffers;
}

export function switchTool(state: GlobalState, newTool: Tool) {
  if (state.previousTool !== newTool) {
    if (state.previousTool?.onDeactivate) {
      state.previousTool.onDeactivate(state);
    }
    state.previousTool = state.tool;
    state.tool = newTool;
  }
}
