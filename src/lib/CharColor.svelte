<script lang="ts">
  import { globalState } from "./state.svelte";
  import Cell from "./Cell.svelte";

  const { palette } = globalState;
</script>

<div
  class="char-info"
  style:background-color={`var(--color-${globalState.bg})`}
  style:color={`var(--color-${globalState.fg})`}
>
  <div class="char-preview">
    {globalState.char ? String.fromCodePoint(globalState.char) : " "}
  </div>
  <div class="codepoint">
    {globalState.char
      ? `U+${globalState.char.toString(16).toUpperCase().padStart(4, "0")}`
      : "None"}
  </div>
</div>
<div class="colors-info">
  <div class="color-row">
    <span class="label">fg</span>
    <div class="palette-mini">
      {#each { length: palette.length + 1 }, i}
        {@const isUndefined = i === palette.length}
        <Cell
          tag="button"
          label={isUndefined
            ? "Set foreground to undefined"
            : `Set foreground to ${i}`}
          fg={i}
          bg={undefined}
          char={isUndefined ? "/" : "@"}
          selected={globalState.fg === i}
          onclick={() => {
            const val = isUndefined ? undefined : i;
            globalState.fg = val;
          }}
        />
      {/each}
    </div>
  </div>
  <div class="color-row">
    <span class="label">bg</span>
    <div class="palette-mini">
      {#each { length: palette.length + 1 }, i}
        {@const isUndefined = i === palette.length}

        <Cell
          tag="button"
          label={isUndefined
            ? "Set background to undefined"
            : `Set background to ${i}`}
          bg={i}
          fg={undefined}
          char={isUndefined ? "/" : null}
          selected={globalState.bg === i}
          onclick={() => {
            const val = isUndefined ? undefined : i;
            globalState.bg = val;
          }}
        />
      {/each}
    </div>
  </div>
</div>

<style>
  .color-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .char-preview {
    font-size: 2rem;
    line-height: 1;
  }

  .palette-mini {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 1px;
  }

  .label {
    width: 20px;
    font-size: 0.8rem;
  }

  .char-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-8);
    padding: 0.5rem;
    min-width: 60px;
  }

  .codepoint {
    font-size: 0.8rem;
  }

  .colors-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
