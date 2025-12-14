<script lang="ts">
  import Modal from "./Modal.svelte";
  import { generateShellScript } from "./screenbuffer";
  import { globalState } from "./state.svelte";

  interface Props {
    open: boolean;
    onclose: () => any;
  }

  let { open, onclose }: Props = $props();

  const script = $derived(generateShellScript(globalState.buffer));
</script>

{#if open}
  <Modal title="Yes" {onclose}>
    <div>
      Save and run the following script in the terminal of your choice:
    </div>
    <pre class="pre">{script}</pre>
  </Modal>
{/if}

<style lang="scss">
  .pre {
    word-break: break-all;
  }
</style>
