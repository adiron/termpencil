<script lang="ts">
  import Cell from "./Cell.svelte";
  import { HISTORY_MAX } from "./constants";
  import type { StyledChar } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  const history: StyledChar[] = $state([]);

  $effect(() => {
    const last = history[history.length - 1];
    if (
      last !== undefined &&
      last.fg === globalState.fg &&
      last.bg === globalState.bg &&
      globalState.char === last.codepoint
    )
      return;

    const indexOf = history.findIndex((i) => {
      return (
        i.codepoint === globalState.char &&
        i.fg === globalState.fg &&
        i.bg === globalState.bg
      );
    });

    if (indexOf === -1) {
      history.push({
        fg: globalState.fg,
        bg: globalState.bg,
        codepoint: globalState.char,
      });
    } else {
      const a = history[indexOf];
      history.splice(indexOf, 1);
      history.push(a)
    }

    if (history.length >= HISTORY_MAX) {
      history.splice(0, history.length - HISTORY_MAX);
    }
  });
</script>

<div class="history">
  {#each history.toReversed() as h}
    <Cell
      char={h.codepoint}
      fg={h.fg}
      bg={h.bg}
      onclick={() => {
        globalState.char = h.codepoint;
        globalState.fg = h.fg;
        globalState.bg = h.bg;
      }}
    />
  {/each}
</div>

<style lang="scss">
  .history {
    width: 100%;
    padding: 0.5rem 1rem;
    grid-area: history;
  }
</style>
