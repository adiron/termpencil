import { globalState } from "./state.svelte";

export function shiftColor(which: "fg" | "bg", amount: number) {
  if (amount === 0) return;

  if (globalState[which] === undefined) {
    globalState[which] = amount < 0 ? 15 : 0;
    return;
  }
  globalState[which] = (globalState[which] + amount) % 16;
  if (globalState[which] < 0) {
    globalState[which] = 15;
  }
  return;
}
