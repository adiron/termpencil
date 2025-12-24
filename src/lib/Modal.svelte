<script lang="ts">
  import type { Snippet } from "svelte";
    import { globalState } from "./state.svelte";

  interface Props {
    title?: string;
    children: Snippet;
    onclose: () => any;
  }

  let { title, children, onclose }: Props = $props();

  $effect(() => {
    globalState.editorHasKeyboard = false;
    return () => {
      globalState.editorHasKeyboard = true;
    };
  });
</script>

<div
  class="overlay"
  role="button"
  tabindex="0"
  onclick={(e) => {
    if (e.target === e.currentTarget) onclose();
  }}
  onkeydown={(e) => {
    if (e.key === "Escape") {
      onclose();
    }
  }}
>
  <div class="modal">
    {#if title}
      <h1 class="title">
        {title}
      </h1>
    {/if}
    {@render children()}
  </div>
</div>

<style lang="scss">
  .overlay {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background-color: color-mix(in srgb, var(--color-4) 70%, transparent);
    z-index: 100;
  }
  .modal {
    background-color: var(--default-bg);
    max-width: 90vw;
    width: 700px;
    padding: 16px;
    border: 1px solid var(--default-fg);
    max-height: 90vh;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: pre-wrap;
  }
</style>
