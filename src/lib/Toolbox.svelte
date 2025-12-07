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
    <div class="char-info">
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
    background: #333;
    height: 100%;
    box-sizing: border-box;
    border-right: 1px solid var(--color-8);
    overflow-y: auto;
    flex-shrink: 0;
  }

  .section {
    border: 1px solid #555;
    padding: 0.5rem;
    background: #2a2a2a;
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
    border: 1px solid #444;
    padding: 0.5rem;
    min-width: 60px;
  }

  .char-preview {
    font-size: 2rem;
    line-height: 1;
  }

  .codepoint {
    font-size: 0.8rem;
    color: #aaa;
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
    color: #aaa;
  }

  .palette-mini {
    display: flex;
    flex-wrap: wrap;
    gap: 1px;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #888;
    border-bottom: 1px solid #444;
    padding-bottom: 0.2rem;
  }

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tool-button {
    text-align: left;
    padding: 0.5rem;
    background: #333;
    border: 1px solid transparent;
    cursor: pointer;

    &:hover {
      background: #444;
    }

    &.active {
      background: #444;
      border-color: #666;
      color: white;
    }
  }

  .options-content {
    min-height: 50px;
  }
</style>
