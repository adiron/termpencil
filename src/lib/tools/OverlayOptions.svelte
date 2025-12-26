<script lang="ts">
  import Button from "../Button.svelte";
  import IncrementInput from "../IncrementInput.svelte";
  import OverlayModal from "../OverlayModal.svelte";
  import Slider from "../Slider.svelte";
  import { globalState } from "../state.svelte";
  import type { OverlayTool } from "./OverlayTool.svelte";

  let { tool: _tool }: { tool: OverlayTool } = $props();
  let open = $state(false);

  const sliderFormat = (n: number) => (n * 100).toFixed(0) + "%";
</script>

<OverlayModal {open} onclose={() => (open = false)} />

<div class="tool-options">
  <Button text="Set overlay image" onclick={() => (open = true)} />
  {#if globalState.image.data}
    <Button
      text="Clear overlay"
      onclick={() => (globalState.image.data = null)}
    />
    Scale
    <IncrementInput
      min={0.01}
      max={10}
      bind:value={globalState.image.scale}
      increments={0.1}
    />
    Opacity
    <Slider
      formatFunction={sliderFormat}
      min={0}
      max={1}
      bind:value={globalState.image.opacity}
    />
  {/if}
</div>
