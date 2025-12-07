<script lang="ts">
  import Cell from "./Cell.svelte";
  import { globalState } from "./state.svelte";

  // Generate character ranges
  const ranges = [
    [0x20, 0x7e], // ASCII
    [0x2580, 0x259f], // Block elements
    [0x2500, 0x257f], // Box drawing
  ];

  let chars: number[] = [];
  for (const [start, end] of ranges) {
    for (let i = start; i <= end; i++) {
      chars.push(i);
    }
  }
</script>

<div class="char-picker">
  <h3>Chars</h3>
  <div class="char-grid">
    {#each chars as char}
      <Cell
        fg={undefined}
        bg={undefined}
        onclick={() => (globalState.char = char)}
        title={char.toString(16).toUpperCase().padStart(4, "0")}
        {char}
        selected={char === globalState.char}
      />
    {/each}
  </div>
</div>

<style lang="scss">
  .char-picker {
    grid-area: charpicker;
    display: flex;
    flex-direction: column;
    background: #333;
    height: 100%;
    box-sizing: border-box;
    border-left: 1px solid var(--color-8);
    overflow-y: auto;
    flex-shrink: 0;
  }

  h3 {
    margin: 0;
    padding: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #888;
    border-bottom: 1px solid #444;
    background: #2a2a2a;
    position: sticky;
    top: 0;
  }

  .char-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(24px, 1fr));
    gap: 1px;
    padding: 0.5rem;
  }
</style>
