<script lang="ts">
  import { globalState } from "./state.svelte";
  import { CursorTool } from "./tools/CursorTool";
  import { BrushTool } from "./tools/BrushTool.svelte";
  import { EyedropperTool } from "./tools/EyedropperTool";
  import Cell from "./Cell.svelte";

  const { palette } = globalState;
</script>

<div class="toolbox">
  <div class="section status-section">
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
  </div>

  <div class="section tool-section">
    <h3>Tools</h3>
    <div class="tool-list">
      <button
        onclick={() => (globalState.tool = new CursorTool())}
        class={{
          "tool-button": true,
          active: globalState.tool.name === "cursor",
        }}
      >
        Cursor
      </button>
      <button
        onclick={() => (globalState.tool = new BrushTool())}
        class={{
          "tool-button": true,
          active: globalState.tool.name === "brush",
        }}
      >
        Brush
      </button>
      <button
        onclick={() => (globalState.tool = new EyedropperTool())}
        class={{
          "tool-button": true,
          active: globalState.tool.name === "eyedropper",
        }}
      >
        Eyedropper
      </button>
    </div>
  </div>

  <div class="section options-section">
    <h3>Tool Options</h3>
    <div class="options-content">
      {#if globalState.tool.optionsComponent}
        <globalState.tool.optionsComponent tool={globalState.tool} />
      {:else}
        <div class="no-options">No options available</div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .toolbox {
    grid-area: toolbox;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    height: 100%;
    box-sizing: border-box;
    border-right: 1px solid var(--color-8);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .section {
    border: 1px solid #555;
    padding: 0.5rem;
  }

  .status-section {
    display: flex;
    gap: 1rem;
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

  .char-preview {
    font-size: 2rem;
    line-height: 1;
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

  .color-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .label {
    width: 20px;
    font-size: 0.8rem;
  }

  .palette-mini {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 1px;
  }

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tool-button {
    text-align: left;
    padding: 0.5rem;
    background: var(--default-bg);
    border: 1px solid var(--color-8);
    cursor: pointer;

    &:hover {
      background: var(--color-4);
    }

    &.active {
      background: var(--color-12);
      border-color: var(--default-fg);
      color: var(--default-fg);
    }
  }

  .options-content {
    min-height: 50px;
  }
</style>
