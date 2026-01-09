<script lang="ts">
  import Button from "../Button.svelte";
  import { globalState } from "../state.svelte";
  import { getPresets } from "./boxPresets";
  import type { BoxTool } from "./BoxTool.svelte";

  let { tool }: { tool: BoxTool } = $props();

  let presets = $derived(getPresets(globalState.fg, globalState.bg));
</script>

<div class="tool-options">
  Presets:
  {#each presets as preset, i}
    <button onclick={() => tool.boxState.preset = preset}>
      Preset {i}
    </button>
  {/each}
</div>

<style lang="scss">
</style>
