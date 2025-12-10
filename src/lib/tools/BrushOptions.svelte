<script lang="ts">
    import type { BrushTool } from "./BrushTool.svelte";

    let { tool }: { tool: BrushTool } = $props();
</script>

<div class="tool-options">
    Paint Mode
    <button
      onclick={() => tool.paintMode = "both"}
      disabled={tool.paintMode === "both"}
    >
      Both
    </button>
    <button
      onclick={() => tool.paintMode = "color"}
      disabled={tool.paintMode === "color"}
    >
      Color
    </button>
    <button
      onclick={() => tool.paintMode = "char"}
      disabled={tool.paintMode === "char"}
    >
      Char
    </button>
      
</div>

<style lang="scss">
    button {
      &:disabled {
        color: var(--color-11)
      }
    }
</style>
