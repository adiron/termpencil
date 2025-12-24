<script lang="ts">
    import Button from "./Button.svelte";
  import Modal from "./Modal.svelte";
  import { generateShellScript } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  interface Props {
    open: boolean;
    onclose: () => any;
  }

  let { open, onclose }: Props = $props();

  const script = $derived(generateShellScript(globalState.buffer));

  const downloadScript = () => {
    const blob = new Blob([script], { type: "application/x-sh" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "artwork.sh";
    a.click();
    URL.revokeObjectURL(url);
  };
</script>

{#if open}
  <Modal title="Yes" {onclose}>
    <div class="container">
      <div class="text">
        Save and run the following script in the terminal of your choice:
        <Button text="Download .sh file" onclick={downloadScript} />
      </div>
      <pre class="pre">{script}</pre>
    </div>
  </Modal>
{/if}

<style lang="scss">
  .pre {
    word-break: break-all;
    white-space: pre-wrap;
  }
</style>
