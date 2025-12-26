import type { Tool, GlobalState } from '../types';
import OverlayOptions from "./OverlayOptions.svelte";

export class OverlayTool implements Tool {
  name = "overlay";
  showSelection = false;

  lastMousePos: [number,number] = [0,0];

  optionsComponent = OverlayOptions;

  onClick(_index: number, _state: GlobalState, x: number, y: number): void {
    this.lastMousePos = [x,y];
  }

  onDrag(_index: number, state: GlobalState, x: number, y: number): void {
    // Implement dragging to reposition
    const delta = [this.lastMousePos[0] - x, this.lastMousePos[1] - y];
    state.image.x -= delta[0];
    state.image.y -= delta[1];
    this.lastMousePos = [x,y];
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    if (event.key === "ArrowRight") {
      state.image.x++;
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowLeft") {
      state.image.x--;
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      state.image.y--;
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown") {
      state.image.y++;
      event.preventDefault();
      return;
    }
  }
}

