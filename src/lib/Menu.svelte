<script lang="ts">
  import { generateShellScript } from "./screenbuffer";
  import { globalState } from "./state.svelte";
</script>

<div class="menu">
  <button class="menu__button">Import</button>
  <button class="menu__button">Export</button>
  <button class="menu__button">Edit</button>
  <button class="menu__button" onclick={() => console.log("Clear")}
    >Clear</button
  >
  <button
    class="menu__button"
    onclick={() => console.log(generateShellScript(globalState.buffer))}
    >Shell Preview</button
  >
</div>

<style>
  .menu {
    grid-area: menu;
    display: flex;
    gap: 0.5em;
    align-items: center;
    border-bottom: 1px solid var(--color-8);
    padding: 0.5rem;
    flex: 0 0 auto;
  }
  .menu__button {
    padding: 0.5em 1em;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    font-family: inherit;
    text-transform: uppercase;
  }
  .menu__button:hover {
    background: var(--color-4);
  }
</style>
