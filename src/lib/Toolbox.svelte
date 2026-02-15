<script lang="ts">
  import { globalState, switchTool } from "./state.svelte";
  import { CursorTool } from "./tools/CursorTool";
  import { BrushTool } from "./tools/BrushTool.svelte";
  import { EyedropperTool } from "./tools/EyedropperTool";
  import type { Tool } from "./types";
  import Button from "./Button.svelte";
  import { OverlayTool } from "./tools/OverlayTool.svelte";
  import { BoxTool } from "./tools/BoxTool.svelte";
  import { SprayTool } from "./tools/SprayTool.svelte";
  import { LineTool } from "./tools/LineTool.svelte";
  import CharColor from "./CharColor.svelte";

  const TOOLS: [string, Tool][] = [
    ["Cursor", new CursorTool()],
    ["Brush", new BrushTool()],
    ["Spray", new SprayTool()],
    ["Line", new LineTool()],
    ["Box", new BoxTool()],
    ["Eyedropper", new EyedropperTool()],
    ["Overlay", new OverlayTool()],
  ];
</script>

{#snippet toolList()}
  {#each TOOLS as [name, tool]}
    <Button
      onclick={() => switchTool(globalState, tool)}
      active={globalState.tool === tool}
      text={name}
    />
  {/each}
{/snippet}

<div class="toolbox">
  <div class="section status-section">
    <CharColor />
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
    width: 300px;
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

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .options-content {
    min-height: 50px;
  }
</style>
