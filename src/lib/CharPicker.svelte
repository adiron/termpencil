<script lang="ts">
  import CharPickerRangeView from "./CharPickerRangeView.svelte";
  import { globalState } from "./state.svelte";
</script>

<div class="char-picker">
  <h3>Chars</h3>
  {#each globalState.pickerRanges as range}
    <CharPickerRangeView {range} />
  {/each}
</div>

<style lang="scss">
  .char-picker {
    grid-area: charpicker;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    border-left: 1px solid var(--color-8);
    overflow-y: auto;
    flex-shrink: 0;
    padding: 0.5rem;
  }

  h3 {
    position: sticky;
    top: 0;
  }
</style>
