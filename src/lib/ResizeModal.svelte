<script lang="ts">
  import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import { DEFAULT_CHAR, makeEmptyScreenBuffer, resizeScreenBuffer } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  interface Props {
    open: boolean;
    onclose: () => any;
  }

  let { open, onclose }: Props = $props();

  let newWidth = $state(globalState.buffer.width);
  let newHeight = $state(
    Math.ceil(globalState.buffer.chars.length / globalState.buffer.width),
  );
</script>

{#if open}
  <Modal title="Resize Artwork" {onclose}>
    Current size is {globalState.buffer.width} &mult; {Math.ceil(
      globalState.buffer.chars.length / globalState.buffer.width,
    )}
    <input type="number" bind:value={newWidth} />
    <input type="number" bind:value={newHeight} />
    <Button
      onclick={() => {
        globalState.buffer = resizeScreenBuffer(
          globalState.buffer,
          newWidth,
          newHeight,
          DEFAULT_CHAR,
        );
        globalState.editBuffer = makeEmptyScreenBuffer(newWidth, newHeight, undefined);
        onclose();
      }}
      text="Resize"
    />
  </Modal>
{/if}
