<script lang="ts">
  import type { Color } from "./screenbuffer";

  interface Props {
    tag?: string;
    label?: string;
    fg: Color | undefined;
    bg: Color | undefined;
    char: number | string | null;
    onmouseover?: (e: MouseEvent) => void;
    onmousedown?: (e: MouseEvent) => void;
    onclick?: (e: MouseEvent) => void;
    selected?: boolean;
  }
  const {
    tag = "div",
    fg,
    label,
    bg,
    char,
    onmousedown,
    onmouseover,
    onclick,
    selected,
  }: Props = $props();

  const renderedChar = $derived.by(() => {
    if (typeof char === "number") {
      return String.fromCodePoint(char);
    }
    if (char === null) {
      return "\xa0";
    }
    return char;
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_mouse_events_have_key_events -->
<svelte:element
  this={tag}
  aria-label={label}
  {onmouseover}
  {onmousedown}
  {onclick}
  class={{
    cell: true,
    [`cell--fg-${fg}`]: typeof fg === "number",
    [`cell--bg-${bg}`]: typeof bg === "number",
    [`cell--selected`]: selected,
  }}
>
  {renderedChar}
</svelte:element>

<style lang="scss">
  .cell {
    vertical-align: middle;
    outline-width: 1px;
    outline-style: solid;
    outline-color: transparent;
    display: table-cell;
    height: calc(var(--height) * 1px);
    width: calc(var(--width) * 1px);
    line-height: 100%;
    font-size: 1rem;

    &:hover {
      outline-color: slateblue;
    }

    &--selected {
      animation: glow 1500ms infinite;
    }

    @for $i from 0 through 15 {
      &--fg-#{$i} {
        color: var(--color-#{$i});
      }
    }
    @for $i from 0 through 15 {
      &--bg-#{$i} {
        background-color: var(--color-#{$i});
      }
    }
  }

  @keyframes glow {
    0% {
      outline-color: slategray;
    }
    50% {
      outline-color: aliceblue;
    }
    100% {
      outline-color: slategray;
    }
  }
</style>
