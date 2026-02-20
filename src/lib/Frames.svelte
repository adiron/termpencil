<script lang="ts">
  import Button from "./Button.svelte";
  import { copyScreenBuffer } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  let mouseIsDown = $state(false);

  $effect(() => {
    const handler = () => {
      mouseIsDown = false;
    };
    document.addEventListener("mouseup", handler);
    return () => document.removeEventListener("mouseup", handler);
  });

  function addFrame() {
    const lastFrameCopy = copyScreenBuffer(
      globalState.buffer[globalState.buffer.length - 1],
    );
    globalState.buffer.push(lastFrameCopy);
    globalState.currentFrame = globalState.buffer.length - 1;
  }

  function removeFrame() {
    globalState.buffer.splice(globalState.currentFrame, 1);
    globalState.currentFrame = Math.max(0, globalState.currentFrame - 1);
  }

  function duplicateFrame() {
    const copy = copyScreenBuffer(globalState.buffer[globalState.currentFrame]);
    globalState.buffer.splice(globalState.currentFrame + 1, 0, copy);
    globalState.currentFrame = globalState.currentFrame + 1;
  }
</script>

<div class="wrapper">
  <h3>Frames</h3>
  <div
    class="frames"
    role="toolbar"
    tabindex="-1"
    onmouseleave={() => {
      mouseIsDown = false;
    }}
  >
    {#if globalState.buffer.length > 1}
      {#each globalState.buffer as _frame, i}
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        <button
          class="frame"
          class:frame--active={i === globalState.currentFrame}
          onclick={() => (globalState.currentFrame = i)}
          aria-label={`Switch to frame ${i}`}
          onmousedown={() => {
            mouseIsDown = true;
            globalState.currentFrame = i;
          }}
          onmouseover={() => {
            if (!mouseIsDown) return;
            globalState.currentFrame = i;
          }}
          onmouseup={() => {
            mouseIsDown = false;
          }}
        >
          {i}
        </button>
      {/each}
      <button
        class="frame frame--button"
        onclick={addFrame}
        title="Add animation frame">+</button
      >
    {:else}
      <Button onclick={addFrame} size="s" text="Add frame" />
    {/if}
  </div>

  {#if globalState.buffer.length > 1}
    <div class="utils">
      <button onclick={duplicateFrame} title="Duplicate frame">Dup</button>
      <button onclick={removeFrame} title="Delete frame">Del</button>
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    border-top: 1px solid var(--color-8);
    display: flex;
    gap: 16px;
    height: 40px;
    align-items: center;
    box-sizing: border-box;
    padding: 0 16px;
  }

  h3 {
    border-bottom: none;
    display: inline-block;
    margin: 0;
    padding: 0;
  }

  .frames {
    display: flex;
    flex-grow: 1;
  }

  .frame {
    width: 24px;
    height: 24px;
    cursor: pointer;
    border: 1px solid var(--default-fg);
    box-sizing: border-box;
    color: var(--default-fg);

    &--active {
      background-color: var(--default-fg);
    color: var(--default-bg);
    }

    &--button {
      border-color: var(--color-8);
      &:hover {
        border-color: var(--default-fg);
      }
    }
  }
</style>
