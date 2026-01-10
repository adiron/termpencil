<script lang="ts">
  import Display from "../Display.svelte";
  import { makeEmptyScreenBuffer, type ScreenBuffer } from "../screenbuffer";
  import { globalState } from "../state.svelte";
  import { paintBox, type BoxTool } from "./BoxTool.svelte";

  let { tool }: { tool: BoxTool } = $props();

  let buffers: ScreenBuffer[] = $derived.by(() => {
    return tool.boxState.presets.map((preset) => {
      const buff = makeEmptyScreenBuffer(5, 5);
      paintBox(buff, [0, 0], [3, 3], preset, globalState.fg, globalState.bg);
      return buff;
    });
  });
</script>

<div class="tool-options">
  <div class="preset-list">
    {#each tool.boxState.presets as preset, i}
      <button
        class={{
          preset: true,
          "preset--selected": tool.boxState.currentPreset === preset,
        }}
        onclick={() => (tool.boxState.currentPreset = preset)}
      >
        Preset {i}
        <Display buffer={buffers[i]} charSize={[10, 10]} />
      </button>
    {/each}
  </div>
</div>

<style lang="scss">
  .preset-list {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .preset {
    display: block;
    padding: 8px;

    &.preset--selected {
      background-color: var(--color-12);
    }
  }
</style>
