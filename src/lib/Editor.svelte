<script lang="ts">
  import {
    getCharAt,
    getRowCount,
    setCharAt,
    type ScreenBuffer,
  } from "./screenbuffer";

  type Tool = "cursor" | "brush";

  interface Props {
    buffer: ScreenBuffer;
    charSize: [number, number];
    palette: string[];
  }

  const tool : Tool = $state("cursor");

  const { buffer = $bindable(), charSize, palette }: Props = $props();

  const styleString: string = $derived.by(() => {
    let r = "";
    palette.forEach((c, i) => (r += `--color-${i}: ${c};`));
    return r;
  });

  let caret: number | null = $state(null);
  let hoverTarget: number | null = $state(null);

  const charUnderCaret = $derived(caret === null ? null : buffer.chars[caret]);
  const [caretX, caretY] = $derived(
    caret === null
      ? [null, null]
      : [caret % buffer.width, Math.floor(caret / buffer.width)],
  );

  function moveSelect(n: number) {
    caret = (caret! + n) % buffer.chars.length;
    if (caret < 0) {
      caret = buffer.chars.length + caret;
    }
  }

  function shiftColor(which: "fg" | "bg", by: number) {
    if (!charUnderCaret) {
      return;
    }
    const curCol = charUnderCaret[which];
    if (typeof curCol === "number") {
      charUnderCaret[which] = (curCol + by) % palette.length;
    }
    if (curCol === undefined) {
      charUnderCaret[which] = 0;
    }
  }

  function cellMouseOver(idx: number) {
    hoverTarget = idx;
  }

  function cellMouseClick(idx: number) {
    switch (tool) {
      case "cursor":
        caret = idx;
        break;
      case "brush":
        // TODO: Implement
        break;
    }
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      caret = null;
      return;
    }

    if (caret && e.getModifierState("Shift")) {
      if (e.key === "ArrowUp") {
        shiftColor("fg", 1);
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown") {
        shiftColor("fg", -1);
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowRight") {
        shiftColor("bg", 1);
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowLeft") {
        shiftColor("bg", -1);
        e.preventDefault();
        return;
      }
    }

    if (e.key === "ArrowRight") {
      moveSelect(1);
      return;
    }
    if (e.key === "ArrowLeft") {
      moveSelect(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      moveSelect(buffer.width);
      return;
    }
    if (e.key === "ArrowUp") {
      moveSelect(-buffer.width);
      return;
    }

    // Crude way to show that character is "typeable"
    if (
      !e.getModifierState("Control") &&
      !e.getModifierState("Alt") &&
      !e.getModifierState("Meta") &&
      e.key.length === 1 &&
      charUnderCaret !== null
    ) {
      charUnderCaret.codepoint = e.key.codePointAt(0) || null;
      moveSelect(1);
      e.preventDefault();
      return;
    }
  }

  $effect(() => {
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  });
</script>

<div
  style:--width={charSize[0]}
  style:--height={charSize[1]}
  style={styleString}
  class="wrapper"
>
  <div class="display-wrapper">
    <div class="display">
      {#each { length: getRowCount(buffer) }, rowI}
        <div class="row">
          {#each { length: buffer.width }, colI}
            {@const idx = colI + rowI * buffer.width}
            {#if idx <= buffer.chars.length}
              {@const styledChar = getCharAt(buffer, colI, rowI)}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <!-- svelte-ignore a11y_mouse_events_have_key_events -->
              <div
                class={{
                  cell: true,
                  "cell--selected": idx === caret,
                  [`cell--fg-${styledChar.fg}`]:
                    typeof styledChar.fg === "number",
                  [`cell--bg-${styledChar.bg}`]:
                    typeof styledChar.bg === "number",
                }}
                onmouseover={() => cellMouseOver(idx)}
                onmousedown={() => cellMouseClick(idx)}
              >
                {#if styledChar.codepoint !== null}
                  {String.fromCodePoint(styledChar.codepoint)}
                {:else}
                  &nbsp;
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <div class="tools">
    <div class="palette-preview palette-preview--fg">
      {#each { length: palette.length }, i}
        <button
          aria-label={`Set foreground to ${i}`}
          class={{
            cell: true,
            [`cell--fg-${i}`]: true,
            "cell--selected": charUnderCaret && charUnderCaret.fg === i,
          }}
          onclick={() => {
            if (caret !== null) {
              buffer.chars[caret].fg = i;
            }
          }}
        >
          @
        </button>
      {/each}
    </div>

    <div class="palette-preview palette-preview--bg">
      {#each { length: palette.length }, i}
        <button
          aria-label={`Set background to ${i}`}
          class={{
            cell: true,
            [`cell--bg-${i}`]: true,
            "cell--selected": charUnderCaret && charUnderCaret.bg === i,
          }}
          onclick={() => {
            if (caret !== null) {
              buffer.chars[caret].bg = i;
            }
          }}
        >
          &nbsp;
        </button>
      {/each}
    </div>
  </div>
  <div class="status">
    {#if caret !== null}
      <span class="state state__select">
        caret: {caretX},{caretY} ({caret})
      </span>
    {:else}
      <span class="state state__select state__select--empty">
        (no selection)
      </span>
    {/if}
    {#if hoverTarget !== null}
      <span class="state">
        (hovering: {hoverTarget % buffer.width},{Math.floor(
          hoverTarget / buffer.width,
        )} ({hoverTarget}))
      </span>
    {/if}
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: grid;
    grid-template-areas:
      "display tools"
      "status status";
    grid-template-columns: 1fr 300px;
  }
  .display-wrapper {
    grid-area: display;
    padding: 2rem;
  }
  .display {
    outline: 1px solid aliceblue;
    display: inline-block;
  }
  .tools {
    grid-area: tools;
  }
  .status {
    grid-area: status;
  }
  .row {
    display: table-row;
    height: calc(var(--height) * 1px);
  }
  .cell {
    vertical-align: middle;
    outline-width: 1px;
    outline-style: solid;
    outline-color: transparent;
    display: table-cell;
    height: calc(var(--height) * 1px);
    width: calc(var(--width) * 1px);
    line-height: calc(var(--width) * 1px);
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
