<script lang="ts">
  import Modal from "./Modal.svelte";
  import { screenBufferToBinary, screenBufferFromBinary } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  const { open, onclose } = $props();
  let input: HTMLInputElement | undefined = $state();
  let error: null | string = $state(null);

  const handleChangeEvent = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files && t.files.length === 0) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = new Uint8Array(reader.result as ArrayBuffer);
        globalState.buffer = screenBufferFromBinary(buffer);
        onclose();
      } catch (err) {
        error = (err as Error).message;
      }
    };

    reader.onerror = () => {
      error = "An error has occurred while trying to read the file";
    };

    reader.readAsArrayBuffer(t.files![0]);
  };

  $effect(() => {
    if (!input) return;

    input.addEventListener("change", handleChangeEvent);
  });

  const getBinary = () => {
    const binary = screenBufferToBinary(globalState.buffer);
    const blob = new Blob([binary as unknown as BlobPart], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "artwork.tp";
    a.click();
    URL.revokeObjectURL(url);
  };
</script>

{#if open}
  <Modal {onclose}>
    Download binary file:

    <button onclick={getBinary}>file.tp</button>

    <hr />
    Load binary file:

    <input type="file" bind:this={input} accept="*.tp" />

    {#if error}
      {error}
    {/if}
  </Modal>
{/if}
