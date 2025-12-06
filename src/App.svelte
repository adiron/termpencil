<script lang="ts">
    import { DEFAULT_PALETTE } from "./lib/constants";
    import Editor from "./lib/Editor.svelte";
    import { makeEmptyScreenBuffer } from "./lib/screenbuffer";

  let buffer = $state(makeEmptyScreenBuffer(80, 40));
</script>

<main>
  <div>
    <Editor palette={DEFAULT_PALETTE} bind:buffer={buffer} charSize={[ 8,16 ]} />
  </div>
</main>

<style>
</style>
