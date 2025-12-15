<script lang="ts">
  import { globalState } from "./state.svelte";
  import { CursorTool } from "./tools/CursorTool";
  import { BrushTool } from "./tools/BrushTool.svelte";
  import { EyedropperTool } from "./tools/EyedropperTool";
  import Cell from "./Cell.svelte";
  import type { Tool } from "./types";
  import Button from "./Button.svelte";
    import { OverlayTool } from "./tools/OverlayTool.svelte";

  const { palette } = globalState;

  const TOOLS: [string, Tool][] = [
    ["Cursor", new CursorTool()],
    ["Brush", new BrushTool()],
    ["Eyedropper", new EyedropperTool()],
    ["Overlay", new OverlayTool()],
  ];
</script>

{#snippet toolList()}
  {#each TOOLS as [name, tool]}
    <Button
      onclick={() => (globalState.tool = tool)}
      active={globalState.tool === tool}
      text={name}
    />
  {/each}
{/snippet}

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
      {@render toolList()}
    </div>
  </div>

  {#key globalState.tool}
  {#if globalState.tool.optionsComponent}
    <div class="section options-section">
      <h3>Tool Options</h3>
      <div class="options-content">
        <globalState.tool.optionsComponent tool={globalState.tool} />
      </div>
    </div>
  {/if}
  {/key}
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

  .options-content {
    min-height: 50px;
  }
</style>
