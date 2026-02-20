<script lang="ts">
  import Button from "./Button.svelte";
  import { copyScreenBuffer } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  let mouseIsDown = $state(false);

  $effect(() => {
    const handler = () => { mouseIsDown = false; };
    document.addEventListener('mouseup', handler);
    return () => document.removeEventListener('mouseup', handler);
  });

  function addFrame() {
    const lastFrameCopy = copyScreenBuffer(
      globalState.buffer[globalState.buffer.length - 1],
    );
    globalState.buffer.push(lastFrameCopy);
    globalState.currentFrame = globalState.buffer.length - 1;
  }
</script>

<div class="frames" onmouseleave={() => { mouseIsDown = false; }}>
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
    </button>
  {/each}
  <Button onclick={addFrame} size="s" text="add" />
</div>

<style lang="scss">
  .frames {
    display: flex;
  }

  .frame {
    width: 24px;
    height: 24px;
    cursor: pointer;
    border: 1px solid var(--default-fg);
    box-sizing: border-box;

    &--active {
      background-color: var(--default-fg);
    }
  }
</style>
