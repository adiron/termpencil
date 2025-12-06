<script lang="ts">
    import { generateShellScript } from "./screenbuffer";
    import { globalState } from "./state.svelte";


</script>

<div class="menu">
    <button class="menu__button" onclick={() => console.log("Clear")}
        >Clear</button
    >
    <button class="menu__button" onclick={() => console.log(generateShellScript(globalState.buffer))}
        >Shell Preview</button
    >
</div>

<style>
    .menu {
        display: flex;
        gap: 1em;
    }
    .menu__button {
        padding: 0.5em 1em;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .menu__button:hover {
    }
</style>
