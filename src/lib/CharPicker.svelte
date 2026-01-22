<script lang="ts">
  import Cell from "./Cell.svelte";
  import CharPickerRangeView from "./CharPickerRangeView.svelte";
  import { globalState } from "./state.svelte";

  const toggleButton = () => (globalState.showPicker = !globalState.showPicker);
</script>

<div class="char-picker" class:char-picker--collapsed={!globalState.showPicker}>
  {#if globalState.showPicker}
    <div class="h3">
      Chars <button onclick={toggleButton}>Less</button>
    </div>
    {:else}
    <button class="more" onclick={toggleButton}>More</button>
  {/if}
  <div class="chars">
  {#each globalState.pickerRanges as range}
    <CharPickerRangeView {range} thin={!globalState.showPicker} />
  {/each}
  </div>
</div>

<style lang="scss">
  .char-picker {
    width: 300px;
    grid-area: charpicker;
    height: calc(100vh - 40px - 40px);
    box-sizing: border-box;
    border-left: 1px solid var(--color-8);
    padding: 0.5rem;

    &--collapsed {
      width: calc(3rem);
    }
  }

  .chars {
  max-height: 100%;
    overflow-y: auto;
  }

  .h3 {
    position: sticky;
    top: 0;
    display: flex;
  }

  .more {
    transform: rotate(90deg);
    border: 1px solid var(--default-fg);
  }
</style>
