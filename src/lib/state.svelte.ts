import {
  makeEmptyScreenBuffer,
} from "./screenbuffer";
import {
  DEFAULT_PALETTE,
} from "./constants";
import type { GlobalState } from "./types";
import { CursorTool } from "./tools/CursorTool";

export let globalState: GlobalState = $state({
  buffer: makeEmptyScreenBuffer(80, 40),
  tool: new CursorTool(),
  palette: DEFAULT_PALETTE,
  charSize: [10, 18],
  caret: null,
  fg: 0,
  bg: 0,
  char: null,
});
