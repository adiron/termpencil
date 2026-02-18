<script lang="ts">
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import { DEFAULT_CHAR, makeEmptyScreenBuffer, resizeScreenBuffer } from "./screenbuffer";
  import { flushEditBuffer, globalState } from "./state.svelte";

  interface Props {
    open: boolean;
    onclose: () => any;
  }

  let { open, onclose }: Props = $props();

  let newWidth = $state(globalState.buffer[globalState.currentFrame].width);
  let newHeight = $state(
    Math.ceil(globalState.buffer[globalState.currentFrame].chars.length / globalState.buffer[globalState.currentFrame].width),
  );
</script>

{#if open}
  <Modal title="Resize Artwork" {onclose}>
    Current size is {globalState.buffer[globalState.currentFrame].width} &mult; {Math.ceil(
      globalState.buffer[globalState.currentFrame].chars.length / globalState.buffer[globalState.currentFrame].width,
    )}
    <input type="number" bind:value={newWidth} />
    <input type="number" bind:value={newHeight} />
    <Button
      onclick={() => {
        flushEditBuffer(globalState);
        globalState.buffer = globalState.buffer.map((frame) =>
          resizeScreenBuffer(
            frame,
            newWidth,
            newHeight,
            DEFAULT_CHAR,
          ),
        );
        globalState.editBuffer = makeEmptyScreenBuffer(newWidth, newHeight, undefined);
        onclose();
      }}
      text="Resize"
    />
  </Modal>
{/if}
