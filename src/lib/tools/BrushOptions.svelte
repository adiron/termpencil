<script lang="ts">
  import Button from "../Button.svelte";
  import type { BrushTool } from "./BrushTool.svelte";

  let { tool }: { tool: BrushTool } = $props();
</script>

<div class="tool-options">
  Paint Mode
  <div class="mode-selector">
    <Button
      onclick={() => (tool.paintMode = "both")}
      active={tool.paintMode === "both"}
      text="Both"
    />
    <Button
      onclick={() => (tool.paintMode = "color")}
      active={tool.paintMode === "color"}
      text="Color"
    />
    <Button
      onclick={() => (tool.paintMode = "char")}
      active={tool.paintMode === "char"}
      text="Char"
    />
  </div>
</div>

<style lang="scss">
  .mode-selector {
    display: flex;
    flex-direction: row;
  }
</style>
