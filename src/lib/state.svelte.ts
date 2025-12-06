import {
  makeEmptyScreenBuffer,
  type ScreenBuffer,
} from "./screenbuffer";
import {
  DEFAULT_PALETTE,
  type Tool,
} from "./constants";

interface GlobalState {
  buffer: ScreenBuffer,
  tool: Tool,
  palette: string[],
  charSize: [number,number]
};

export let globalState: GlobalState = $state({
  buffer: makeEmptyScreenBuffer(80, 40),
  tool: "cursor",
  palette: DEFAULT_PALETTE,
  charSize: [10, 18],
});
