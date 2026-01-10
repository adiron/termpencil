<script lang="ts">
  import type { BoxTool } from "./BoxTool.svelte";

  let { tool }: { tool: BoxTool } = $props();

</script>

<div class="tool-options">
  Presets:
  {#each tool.boxState.presets as preset, i}
    <button onclick={() => tool.boxState.currentPreset = preset}>
      Preset {i}
    </button>
  {/each}
</div>

<style lang="scss">
</style>
