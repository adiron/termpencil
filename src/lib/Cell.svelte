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
    title?: string;
    onclick?: (e: MouseEvent) => void;
    selected?: boolean;
    size?: "lg" | undefined;
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
    title,
    size,
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
  {title}
  class={{
    cell: true,
    [`cell--fg-${fg}`]: fg,
    [`cell--bg-${bg}`]: bg,
    [`cell--selected`]: selected,
    [`cell--${size}`]: size !== undefined,
  }}
>
  {renderedChar}
</svelte:element>

<style lang="scss">
  .cell {
    display: table-cell;
    vertical-align: middle;
    outline-width: 1px;
    outline-style: solid;
    outline-color: transparent;
    height: calc(var(--height) * 1px);
    width: calc(var(--width) * 1px);
    line-height: 100%;
    font-size: 1rem;

    &--lg {
      font-size: 1.5rem;
      height: calc(var(--height) * 2px);
      width: calc(var(--width) * 2px);
      line-height: 1.5rem;
    }

    &:hover {
      outline-color: var(--color-6);
    }

    &--selected {
      animation: glow 1000ms infinite;
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
      outline-color: var(--color-14);
    }
    50% {
      outline-color: var(--color-15);
    }
    100% {
      outline-color: var(--color-14);
    }
  }
</style>
