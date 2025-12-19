<script lang="ts">
  interface Props {
    value: number;
    increments: number;
    min?: number;
    max?: number;
  }

  let { value = $bindable(), increments, max, min }: Props = $props();

  $effect(() => {
    if (min !== undefined && value < min) {
      value = min;
    }
    if (max !== undefined && value > max) {
      value = max;
    }
  });
</script>

<div class="increment">
  <button onclick={() => (value -= increments)}>-</button>
  <input type="number" bind:value />
  <button onclick={() => (value += increments)}>+</button>
</div>

<style lang="scss">
  .increment {
    display: flex;
  }

  input[type="number"] {
    appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
</style>
