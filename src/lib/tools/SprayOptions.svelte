<script lang="ts">
  import Slider from "../Slider.svelte";
    import type { SprayTool } from "./SprayTool.svelte";
  let { tool }: { tool: SprayTool } = $props();
</script>

<div class="tool-options">
  <div>
    Radius
    <Slider bind:value={tool.toolState.radius} min={1} max={10} step={1} />
  </div>
  <div>
    Strength
    <Slider bind:value={tool.toolState.strength} min={1} max={10} step={1} />
  </div>
</div>

<style lang="scss">
  .mode-selector {
    display: flex;
    flex-direction: row;
  }
</style>
