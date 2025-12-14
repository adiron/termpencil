import {
  makeEmptyScreenBuffer,
} from "./screenbuffer";
import {
    DEFAULT_BG,
  DEFAULT_FG,
  DEFAULT_PALETTE,
} from "./constants";
import type { GlobalState } from "./types";
import { CursorTool } from "./tools/CursorTool";

export let globalState: GlobalState = $state({
  buffer: makeEmptyScreenBuffer(80, 40),
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
});
