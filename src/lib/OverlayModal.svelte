<script lang="ts">
  import Modal from "./Modal.svelte";
  import { globalState } from "./state.svelte";

  const { open, onclose } = $props();
  let input: HTMLInputElement | undefined = $state();
  let error: null|string = $state(null);

  const handleChangeEvent = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.files && t.files.length === 0) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      globalState.image.data = e.target?.result as ArrayBuffer;
      onclose();
    }

    reader.onerror = () => {
      error = "An error has occurred while trying to read the file";
    }

    reader.readAsArrayBuffer(t.files![0])

  };

  $effect(() => {
    if (!input) return;

    input.addEventListener("change", handleChangeEvent);
  });
</script>

{#if open}
  <Modal {onclose}>
    Select image please

    <input type="file" bind:this={input} accept="image/*" />

    {#if error}
      {error}
    {/if}
  </Modal>
{/if}
