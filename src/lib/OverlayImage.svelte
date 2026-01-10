<script lang="ts">
  import type { DisplayImage } from "./types";

  type Props = DisplayImage;

  let { data, x, y, scale, opacity }: Props = $props();

  const blobUri: string = $derived.by(() => {
    if (data === null) return "";
    const b = new Blob([data as unknown as BlobPart]);
    return URL.createObjectURL(b);
  });
</script>

<img
  src={blobUri}
  alt="overlaid graphic"
  style:transform={`translate(${x}px, ${y}px) scale(${scale})`}
  style:opacity
/>

<style lang="scss">
  img {
    position: absolute;
    pointer-events: none;
    top: 0;
    left: 0;
  }
</style>
