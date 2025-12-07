<script lang="ts">
  import Cell from "./Cell.svelte";
  import { getCharAt, getRowCount } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  const { buffer } = globalState;

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

<div class="wrapper">
  <div class="editor-area">
    <div class="editor-container">
      <div class="display-wrapper">
        <div class="display">
          {#each { length: getRowCount(buffer) }, rowI}
            <div class="row">
              {#each { length: buffer.width }, colI}
                {@const idx = colI + rowI * buffer.width}
                {#if idx <= buffer.chars.length}
                  {@const styledChar = getCharAt(buffer, colI, rowI)}
                  <Cell
                    fg={styledChar.fg}
                    bg={styledChar.bg}
                    selected={idx === globalState.caret}
                    onmouseover={() => cellMouseOver(idx)}
                    onmousedown={() => cellMouseClick(idx)}
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
            (hovering: {hoverTarget % buffer.width},{Math.floor(
              hoverTarget / buffer.width,
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
    outline: 1px solid aliceblue;
    display: inline-block;
    user-select: none;
    background: black; /* Ensure background is black */
  }

  .status {
    width: 100%;
    text-align: center;
    color: #888;
    font-size: 0.8rem;
  }

  .row {
    display: table-row;
    height: calc(var(--height) * 1px);
  }
</style>
