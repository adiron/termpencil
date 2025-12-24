<script lang="ts">
  import Cell from "./Cell.svelte";
  import OverlayImage from "./OverlayImage.svelte";
  import { getCharAt, getRowCount } from "./screenbuffer";
  import { globalState } from "./state.svelte";
  import { shiftColor } from "./utils.svelte";

  let hoverTarget: number | null = $state(null);
  let isMouseDown = $state(false);

  const [caretX, caretY] = $derived(
    globalState.caret === null
      ? [null, null]
      : [
          globalState.caret % globalState.buffer.width,
          Math.floor(globalState.caret / globalState.buffer.width),
        ],
  );

  function cellMouseOver(event: MouseEvent, idx: number) {
    hoverTarget = idx;
    if (isMouseDown) {
      globalState.tool.onDrag(idx, globalState, event.clientX, event.clientY);
    }
  }

  function cellMouseClick(event: MouseEvent, idx: number) {
    globalState.tool.onClick(idx, globalState, event.clientX, event.clientY);
  }

  function handleKey(e: KeyboardEvent) {
    if (!globalState.editorHasKeyboard) return;

    if (e.getModifierState("Shift")) {
      if (e.key === "ArrowRight") {
        shiftColor("fg", 1);
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowUp") {
        shiftColor("bg", 1);
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowLeft") {
        shiftColor("fg", -1);
        e.preventDefault();
        return;
      }

      if (e.key === "ArrowDown") {
        shiftColor("bg", -1);
        e.preventDefault();
        return;
      }
    }
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

<div class="wrapper">
  <div class="editor-area">
    <div class="editor-container">
      <div class="display-wrapper">
        <div class="display">
          {#if globalState.image.data}
            <OverlayImage />
          {/if}
          {#each { length: getRowCount(globalState.buffer) }, rowI}
            <div class="row">
              {#each { length: globalState.buffer.width }, colI}
                {@const idx = colI + rowI * globalState.buffer.width}
                {#if idx <= globalState.buffer.chars.length}
                  {@const styledChar = getCharAt(
                    globalState.buffer,
                    colI,
                    rowI,
                  )}
                  <Cell
                    fg={styledChar.fg}
                    bg={styledChar.bg}
                    selected={globalState.tool.showSelection &&
                      idx === globalState.caret}
                    onmouseover={(e) => cellMouseOver(e, idx)}
                    onmousedown={(e) => cellMouseClick(e, idx)}
                    char={styledChar.codepoint}
                  />
                {/if}
              {/each}
            </div>
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
            (hovering: {hoverTarget % globalState.buffer.width},{Math.floor(
              hoverTarget / globalState.buffer.width,
            )} ({hoverTarget}))
          </span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .wrapper {
    grid-area: editor;
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .editor-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  .editor-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    overflow: auto;
    padding: 1rem;
    box-sizing: border-box;
  }

  .display-wrapper {
    margin-bottom: 1rem;
  }

  .display {
    outline: 1px solid var(--color-14);
    display: inline-block;
    position: relative;
    user-select: none;
    overflow: hidden;
  }

  .status {
    width: 100%;
    text-align: center;
    color: var(--color-8);
    font-size: 0.8rem;
  }

  .row {
    display: table-row;
    height: calc(var(--height) * 1px);
  }
</style>
