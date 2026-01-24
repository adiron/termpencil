import SprayOptions from "./SprayOptions.svelte";
import { setCharAt } from "../screenbuffer";
import { flushEditBuffer } from "../state.svelte";
import type { GlobalState, Tool } from "../types";
import { randBetween, setCharHelper } from "../utils";

interface SprayState {
  radius: number;
  strength: number;
}

export class SprayTool implements Tool {
  name = "spray";
  showSelection = false;
  optionsComponent = SprayOptions;

  toolState: SprayState = $state({
    radius: 4,
    strength: 3,
  });

  onClick(index: number, state: GlobalState, x: number, y: number): void {
    this.paint(index, state);
  }

  onMouseUp(index: number, state: GlobalState, x: number, y: number): void {
    flushEditBuffer(state);
  }

  onDrag(index: number, state: GlobalState, x: number, y: number): void {
    this.paint(index, state);
  }
  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    setCharHelper(event, state);
  }

  private paint(index: number, state: GlobalState) {
    const baseX = index % state.buffer.width;
    const baseY = Math.floor(index / state.buffer.width);
    const bufferHeight = Math.ceil(state.buffer.chars.length / state.buffer.width);

    for (let i = 0; i < this.toolState.strength; i++) {
      const theta = randBetween(0, Math.PI * 2);
      const radius = Math.round(randBetween(0, this.toolState.radius));

      const x = Math.round((Math.sin(theta) * radius) + baseX);
      const y = Math.round((Math.cos(theta) * radius) + baseY);
      if (x < 0 || y < 0 || x >= state.buffer.width || y >= bufferHeight) continue;

      setCharAt(state.buffer, x, y, {
        codepoint: state.char, fg: state.fg, bg: state.bg,
      });
    }
  }
}
