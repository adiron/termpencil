<script lang="ts">
  import Button from "./Button.svelte";
  import { DEFAULT_BG, DEFAULT_FG, DEFAULT_PALETTE } from "./constants";
  import Modal from "./Modal.svelte";
  import { globalState } from "./state.svelte";

  interface Props {
    open: boolean;
    onclose: () => any;
  }

  let { open, onclose }: Props = $props();
</script>

{#if open}
  <Modal title="Terminal Config" {onclose}>
    <div>
      <label for="default-bg">Default bg</label>
      <input id="default-bg" type="color" bind:value={globalState.defaultBg} />
    </div>

    <div>
      <label for="default-fg">Default fg</label>
      <input id="default-fg" type="color" bind:value={globalState.defaultFg} />
    </div>
    {#each { length: 16 }, i}
      <div>
        <label for={`color-${i}`}>Color {i}</label>
        <input
          id={`color-${i}`}
          type="color"
          bind:value={globalState.palette[i]}
        />
      </div>
    {/each}

    <input bind:value={globalState.font} />

    <div>
      <Button text="Close" onclick={onclose} />
      <Button
        text="Reset to default"
        onclick={() => {
          globalState.palette = DEFAULT_PALETTE;
          globalState.defaultBg = DEFAULT_BG;
          globalState.defaultFg = DEFAULT_FG;
          onclose();
        }}
      />
    </div>
  </Modal>
{/if}
