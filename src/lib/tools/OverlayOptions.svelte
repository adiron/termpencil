<script lang="ts">
  import Button from "../Button.svelte";
  import OverlayModal from "../OverlayModal.svelte";
    import { globalState } from "../state.svelte";
  import type { OverlayTool } from "./OverlayTool.svelte";

  let { tool: _tool }: { tool: OverlayTool } = $props();
  let open = $state(false);
</script>

<OverlayModal {open} onclose={() => (open = false)} />

<div class="tool-options">
  <Button text="Set overlay image" onclick={() => (open = true)} />
  {#if globalState.image.data}
    <Button text="Clear overlay" onclick={() => (globalState.image.data = null)} />
  {/if}
</div>
