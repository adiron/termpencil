<script lang="ts">
  import Cell from "./Cell.svelte";
  import OverlayImage from "./OverlayImage.svelte";
  import { getCharAt, getRowCount } from "./screenbuffer";
  import type { ScreenBuffer } from "./screenbuffer";
  import type { DisplayImage } from "./types";

  interface Props {
    buffer: ScreenBuffer;
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
          {@const styledChar = getCharAt(buffer, colI, rowI)}
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
</style>
