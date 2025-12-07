<script lang="ts">
    import CharPicker from "./lib/CharPicker.svelte";
  import Editor from "./lib/Editor.svelte";
  import Menu from "./lib/Menu.svelte";
  import { globalState } from "./lib/state.svelte";
    import Toolbox from "./lib/Toolbox.svelte";

  const styleString: string = $derived.by(() => {
    let r = "";
    globalState.palette.forEach((c, i) => (r += `--color-${i}: ${c};`));
    r += `--width: ${globalState.charSize[0]};`;
    r += `--height: ${globalState.charSize[1]};`;
    r += `--default-fg: ${globalState.defaultFg};`;
    r += `--default-bg: ${globalState.defaultBg};`;
    return r;
  });
</script>

<main style={styleString}>
  <Menu />
  <Toolbox />
  <Editor />
  <CharPicker />
</main>

<style>
  main {
    grid-template-areas: 
      "menu menu menu"
      "toolbox editor charpicker"
    ;
    grid-template-columns: 300px 1fr 300px;
    grid-template-rows: 
      40px
      1fr;
    display: grid;
    height: 100vh;
    overflow: hidden;
    background-color: var(--default-bg);
    color: var(--default-fg);
    font-family: "Courier New", Courier, monospace;
  }
</style>
