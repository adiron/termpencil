<script lang="ts">
  import { globalState } from "./state.svelte";

  const blobUri: string = $derived.by(() => {
    if (globalState.image.data === null) return "";
    const b = new Blob([globalState.image.data]);
    return URL.createObjectURL(b);
  });
</script>

<img
  src={blobUri}
  alt="overlaid graphic"
  style:transform={`translate(${globalState.image.x}px, ${globalState.image.y}px) scale(${globalState.image.scale})`}
  style:opacity={globalState.image.opacity}
/>

<style lang="scss">
  img {
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0;
  }
</style>
