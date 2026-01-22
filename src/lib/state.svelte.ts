import {
  makeEmptyScreenBuffer,
  mergeScreenBuffers,
  getRowCount,
  type StyledChar,
  DEFAULT_CHAR,
} from "./screenbuffer";
import {
  DEFAULT_BG,
  DEFAULT_FG,
  DEFAULT_PALETTE,
  DEFAULT_PICKER_RANGES,
} from "./constants";
import type { GlobalState } from "./types";
import { CursorTool } from "./tools/CursorTool";

export let globalState: GlobalState = $state({
  buffer: makeEmptyScreenBuffer(80, 40, DEFAULT_CHAR),
  tool: new CursorTool(),
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
  font: "Courier New"
});

export function flushEditBuffer(state: GlobalState) {
  state.buffer = mergeScreenBuffers(state.buffer, state.editBuffer);
  // Reset
  state.editBuffer = makeEmptyScreenBuffer(state.buffer.width, getRowCount(state.buffer), undefined);
}
