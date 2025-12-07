<script lang="ts">
    import type { BrushTool } from "./BrushTool.svelte";

    let { tool }: { tool: BrushTool } = $props();
</script>

<div class="tool-options">
    <label>
        <input type="checkbox" bind:checked={tool.paintChar} />
        Paint Character
    </label>
</div>

<style>
    .tool-options {
        padding: 0.5rem;
        border-bottom: 1px solid #ccc;
    }
</style>
