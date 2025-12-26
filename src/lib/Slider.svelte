<script lang="ts">
    import { mapRange } from "./utils";

  interface Props {
    value: number;
    min: number;
    max: number;
    formatFunction?: (n: number) => string;
  }

  let { value = $bindable(), max, min, formatFunction }: Props = $props();
  let mouseDown = $state(false);

  $effect(() => {
    if (value < min) {
      value = min;
    }
    if (value > max) {
      value = max;
    }
  });

  const relativeValue = $derived.by(() => {
    return (value - min) / (max - min);
  });

  const handleMouse = (e: MouseEvent) => {
    if (!mouseDown) return;
    if (e.target !== e.currentTarget) return;
    const size = (e.target as HTMLDivElement).getBoundingClientRect();
    value = mapRange(e.clientX, size.left, size.right, min, max);
  };
</script>

<div
  role="slider"
  aria-valuenow={value}
  tabindex="0"
  class="container"
  onmousemove={handleMouse}
  onmousedown={e => { mouseDown = true; handleMouse(e) }}
  onmouseup={_ => mouseDown = false}
>
  <div class="filled" style:--value={relativeValue}>&nbsp;</div>
  <div class="text">
    {#if formatFunction}
      {formatFunction(value)}
    {:else}
      {value.toString()}
    {/if}
  </div>
</div>

<style lang="scss">
  .container {
    position: relative;
    border: 1px solid var(--default-fg);
    height: 1.5em;
    user-select: none;
    cursor: ew-resize;
    * {
      pointer-events: none;
    }
  }
  .filled {
    width: calc(100% * var(--value));
    background-color: var(--color-5);
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 0;
  }
  .text {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    line-height: 1.5em;
    padding-left: 8px;
    z-index: 1;
  }
</style>
