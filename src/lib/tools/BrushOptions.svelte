<script lang="ts">
  import Button from "../Button.svelte";
    import Slider from "../Slider.svelte";
  import type { BrushTool } from "./BrushTool.svelte";

  let { tool }: { tool: BrushTool } = $props();
</script>

<div class="tool-options">
  Paint Mode
  <div class="mode-selector">
    <Button
      onclick={() => (tool.brushState.paintMode = "both")}
      active={tool.brushState.paintMode === "both"}
      text="Both"
    />
    <Button
      onclick={() => (tool.brushState.paintMode = "color")}
      active={tool.brushState.paintMode === "color"}
      text="Color"
    />
    <Button
      onclick={() => (tool.brushState.paintMode = "char")}
      active={tool.brushState.paintMode === "char"}
      text="Char"
    />
  </div>
  <Slider bind:value={tool.brushState.size} min={1} max={5} step={1} />
</div>

<style lang="scss">
  .mode-selector {
    display: flex;
    flex-direction: row;
  }
</style>
