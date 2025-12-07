<script lang="ts">
  import { getCharAt, getRowCount } from "./screenbuffer";
  import { globalState } from "./state.svelte";
  import { CursorTool } from "./tools/CursorTool";
  import { BrushTool } from "./tools/BrushTool.svelte";
  import { EyedropperTool } from "./tools/EyedropperTool";

  const { buffer, charSize, palette } = globalState;

  const styleString: string = $derived.by(() => {
    let r = "";
    palette.forEach((c, i) => (r += `--color-${i}: ${c};`));
    return r;
  });

  let hoverTarget: number | null = $state(null);
  let isMouseDown = $state(false);

  const [caretX, caretY] = $derived(
    globalState.caret === null
      ? [null, null]
      : [
          globalState.caret % buffer.width,
          Math.floor(globalState.caret / buffer.width),
        ],
  );

  function cellMouseOver(idx: number) {
    hoverTarget = idx;
    if (isMouseDown) {
      globalState.tool.onDrag(idx, globalState);
    }
  }

  function cellMouseClick(idx: number) {
    globalState.tool.onClick(idx, globalState);
  }

  function handleKey(e: KeyboardEvent) {
    globalState.tool.onKeyDown(e, globalState);
  }

  $effect(() => {
    window.addEventListener("keydown", handleKey);
    const setMouseDown = () => (isMouseDown = true);
    const setMouseUp = () => (isMouseDown = false);
    window.addEventListener("mousedown", setMouseDown);
    window.addEventListener("mouseup", setMouseUp);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("mousedown", setMouseDown);
      window.removeEventListener("mouseup", setMouseUp);
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
                  "cell--selected": idx === globalState.caret,
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
    <div class="tool-selector">
      <button
        onclick={() => (globalState.tool = new CursorTool())}
        class={{
          "tool-selector__button": true,
          "tool-selector__button--active": globalState.tool.name === "cursor",
        }}
        disabled={globalState.tool.name === "cursor"}
      >
        Cursor
      </button>
      <button
        onclick={() => (globalState.tool = new BrushTool())}
        class={{
          "tool-selector__button": true,
          "tool-selector__button--active": globalState.tool.name === "brush",
        }}
        disabled={globalState.tool.name === "brush"}
      >
        Brush
      </button>
      <button
        onclick={() => (globalState.tool = new EyedropperTool())}
        class={{
          "tool-selector__button": true,
          "tool-selector__button--active":
            globalState.tool.name === "eyedropper",
        }}
        disabled={globalState.tool.name === "eyedropper"}
      >
        Eyedropper
      </button>
    </div>

    {#if globalState.tool.optionsComponent}
      <globalState.tool.optionsComponent tool={globalState.tool} />
    {/if}

    <div class="char-preview">
      Current Char:
      <span class="char-display">
        {globalState.char ? String.fromCodePoint(globalState.char) : " "}
      </span>
      <span class="codepoint-display">
        {globalState.char
          ? `U+${globalState.char.toString(16).toUpperCase().padStart(4, "0")}`
          : "None"}
      </span>
    </div>

    <div class="palette-preview palette-preview--fg">
      {#each { length: palette.length + 1 }, i}
        {@const isUndefined = i === palette.length}
        <button
          aria-label={isUndefined
            ? "Set foreground to undefined"
            : `Set foreground to ${i}`}
          class={{
            cell: true,
            [`cell--fg-${i}`]: !isUndefined,
            "cell--selected": globalState.fg === (isUndefined ? undefined : i),
          }}
          onclick={() => {
            const val = isUndefined ? undefined : i;
            globalState.fg = val;
          }}
        >
          {isUndefined ? "/" : "@"}
        </button>
      {/each}
    </div>

    <div class="palette-preview palette-preview--bg">
      {#each { length: palette.length + 1 }, i}
        {@const isUndefined = i === palette.length}
        <button
          aria-label={isUndefined
            ? "Set background to undefined"
            : `Set background to ${i}`}
          class={{
            cell: true,
            [`cell--bg-${i}`]: !isUndefined,
            "cell--selected": globalState.bg === (isUndefined ? undefined : i),
          }}
          onclick={() => {
            const val = isUndefined ? undefined : i;
            globalState.bg = val;
          }}
        >
          {isUndefined ? "/" : "\u00A0"}
        </button>
      {/each}
    </div>
  </div>
  <div class="status">
    {#if globalState.caret !== null}
      <span class="state state__select">
        caret: {caretX},{caretY} ({globalState.caret})
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
      "tools display"
      "status status";
    grid-template-columns: 300px 1fr;
  }
  .display-wrapper {
    grid-area: display;
    padding: 2rem;
  }
  .display {
    outline: 1px solid aliceblue;
    display: inline-block;
    user-select: none;
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
