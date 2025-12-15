import { globalState } from '../state.svelte';
import type { Tool, GlobalState } from '../types';
import OverlayOptions from "./OverlayOptions.svelte";

export class OverlayTool implements Tool {
  name = "overlay";
  showSelection = false;

  optionsComponent = OverlayOptions;

  onClick(index: number, state: GlobalState, x: number, y: number): void {
    // Implement dragging to reposition
  }

  onDrag(index: number, state: GlobalState, x: number, y: number): void {
    // Implement dragging to reposition
  }

  onKeyDown(event: KeyboardEvent, state: GlobalState): void {
    if (event.key === "ArrowRight") {
      globalState.image.x++;
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowLeft") {
      globalState.image.x--;
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowUp") {
      globalState.image.y--;
      event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown") {
      globalState.image.y++;
      event.preventDefault();
      return;
    }
  }
}

