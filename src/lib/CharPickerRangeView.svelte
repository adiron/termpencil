<script lang="ts">
  import Cell from "./Cell.svelte";
  import { globalState } from "./state.svelte";
  import type { PickerRange } from "./types";

  interface Props {
    range: PickerRange;
    thin: boolean;
  }

  const { range, thin }: Props = $props();

  let expanded = $state(true);

  const chars = $derived.by(() => {
    const chars: number[] = [];
    const [_, start, end] = range;
    for (let i = start; i <= end; i++) {
      chars.push(i);
    }
    return chars;
  });
</script>

{#if !thin}
  <div
    class="title"
    role="button"
    onclick={() => (expanded = !expanded)}
    onkeydown={(e) => {
      if (e.key === "Enter") {
        expanded = !expanded;
      }
    }}
    tabindex="0"
  >
    <span class="name">{expanded ? "\u25bc" : "\u25ba"} {range[0]}</span>
    <span class="range">
      0x{range[1].toString(16)} - 0x{range[2].toString(16)}
    </span>
  </div>
{/if}

{#if expanded || thin}
  <div class="char-grid" class:thin>
    {#each chars as char}
      <Cell
        fg={undefined}
        bg={undefined}
        onclick={() => (globalState.char = char)}
        title={char.toString(16).toUpperCase().padStart(4, "0")}
        {char}
        selected={char === globalState.char}
        size="lg"
      />
    {/each}
  </div>
{/if}

<style lang="scss">
  .char-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(24px, 1fr));
    gap: 4px;
    padding: 0.5rem;

    &.thin {
      padding-top: 3rem;
    }
  }

  .title {
    align-items: first baseline;
    gap: 8px;
    display: flex;
    user-select: none;
    cursor: pointer;
    padding: 4px;

    &:hover {
      background-color: var(--color-4);
    }
  }

  .name {
    flex-grow: 1;
  }

  .range {
    font-size: 0.75rem;
    color: var(--color-7);
  }
</style>
