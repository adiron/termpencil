<script lang="ts">
  import Button from "../Button.svelte";
  import type { LineTool } from "./LineTool.svelte";
  import { LINE_STYLES } from "./lineStyles";

  let { tool }: { tool: LineTool } = $props();
</script>

<div class="tool-options">
  <div>
    Line Style
    <div class="style-selector">
      <Button
        onclick={() => {
          tool.lineState.currentStyleId = null;
        }}
        active={tool.lineState.currentStyleId === null}
        text="<Use Character>"
        size="s"
      />
      {#each LINE_STYLES as style}
        <Button
          onclick={() => {
            tool.lineState.currentStyleId = style.id;
          }}
          active={tool.lineState.currentStyleId === style.id}
          text={style.name}
          size="s"
        />
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .tool-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .style-selector {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
</style>
