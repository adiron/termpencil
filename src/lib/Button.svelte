<script lang="ts">
  interface Props {
    active?: boolean;
    onclick: () => void;
    text: string;
    size?: "s" | "l";
    disabled?: boolean;
  }

  const { active, onclick, text, size, disabled }: Props = $props();
</script>

<button
  {onclick}
  {disabled}
  class={{
    active: active,
    [`size-${size}`]: size,
  }}
>
  {text}
</button>

<style lang="scss">
  button {
    text-align: left;
    padding: 0.5rem;
    background: var(--default-bg);
    border: 1px solid var(--color-8);
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
    }

    &:hover {
      background: var(--color-4);
    }

    &.active {
      background: var(--color-12);
      border-color: var(--default-fg);
      color: var(--default-fg);
    }

    &.size-s {
      padding: 0.25rem;
    }

    &.size-l {
      padding: 1rem;
    }
  }
</style>
