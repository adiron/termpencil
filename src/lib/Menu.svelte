<script lang="ts">
  import { TERM_PENCIL } from "./constants";
  import CodeModal from "./CodeModal.svelte";
  import OpenSaveModal from "./OpenSaveModal.svelte";

  type ModalName = undefined | "code" | "importexport";

  let modal: ModalName = $state(undefined);
</script>

<CodeModal open={modal === "code"} onclose={() => (modal = undefined)} />
<OpenSaveModal
  open={modal === "importexport"}
  onclose={() => (modal = undefined)}
/>

<div class="menu">
  <div class="logo" title="termpencil">{TERM_PENCIL}</div>
  <button class="menu__button" onclick={() => (modal = "importexport")}
    >Import/Export</button
  >
  <button class="menu__button" onclick={() => (modal = "code")}
    >Terminal Preview</button
  >
</div>

<style lang="scss">
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

  .logo {
    padding: 0 0.5rem;
    color: var(--color-15);

    &:hover {
      animation: color-cycle 4s infinite;
      cursor: pointer;
    }

    @keyframes color-cycle {
      @for $i from 0 through 15 {
        #{($i * calc(100% / 16))} {
          color: var(--color-#{$i});
        }
      }
    }
  }
</style>
