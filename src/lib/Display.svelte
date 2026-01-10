<script lang="ts">
  import Cell from "./Cell.svelte";
  import OverlayImage from "./OverlayImage.svelte";
  import {
    getCharAt,
    getRowCount,
    mergeScreenBuffers,
    type StyledChar,
  } from "./screenbuffer";
  import type { ScreenBuffer } from "./screenbuffer";
  import type { DisplayImage } from "./types";

  interface Props {
    buffer: ScreenBuffer<StyledChar | undefined>;
    editBuffer?: ScreenBuffer<StyledChar | undefined>;
    charSize: [number, number];
    caret?: number | null;
    showSelection?: boolean;
    image?: DisplayImage;
    onCellOver?: (e: MouseEvent, idx: number) => void;
    onCellDown?: (e: MouseEvent, idx: number) => void;
    onCellUp?: (e: MouseEvent, idx: number) => void;
  }

  let {
    buffer,
    editBuffer = undefined,
    charSize,
    caret = null,
    showSelection = false,
    image = undefined,
    onCellOver,
    onCellDown,
    onCellUp,
  }: Props = $props();
</script>

<div class="display" style:--width={charSize[0]} style:--height={charSize[1]}>
  {#if image && image.data}
    <OverlayImage {...image} />
  {/if}
  {#each { length: getRowCount(buffer) }, rowI}
    <div class="row">
      {#each { length: buffer.width }, colI}
        {@const idx = colI + rowI * buffer.width}
        {#if idx <= buffer.chars.length}
          {@const baseChar = getCharAt(buffer, colI, rowI)}
          {@const editChar = editBuffer
            ? getCharAt(editBuffer, colI, rowI)
            : undefined}
          {@const styledChar = editChar ?? baseChar}

          {#if styledChar === undefined}
            <div class="cell cell--transparent"></div>
          {:else}
            <Cell
              fg={styledChar.fg}
              bg={styledChar.bg}
              selected={showSelection && idx === caret}
              onmouseover={onCellOver ? (e) => onCellOver(e, idx) : undefined}
              onmousedown={onCellDown ? (e) => onCellDown(e, idx) : undefined}
              onmouseup={onCellUp ? (e) => onCellUp(e, idx) : undefined}
              char={styledChar.codepoint}
            />
          {/if}
        {/if}
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  .display {
    outline: 1px solid var(--color-14);
    display: inline-block;
    position: relative;
    user-select: none;
    overflow: hidden;
  }

  .row {
    display: table-row;
    height: calc(var(--height) * 1px);
  }

  .cell--transparent {
    display: table-cell;
    width: calc(var(--width) * 1px);
    height: calc(var(--height) * 1px);
    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 10px 10px;
    background-position:
      0 0,
      0 5px,
      5px -5px,
      -5px 0px;
  }
</style>
