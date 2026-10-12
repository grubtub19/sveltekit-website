<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes, HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLElement> {
    href?: string;
    class?: string;
    children: Snippet;
  }

  let { href, class: className = '', children, ...restProps }: Props = $props();
</script>

{#if href}
  <a {href} class="card {className}" {...restProps as HTMLAnchorAttributes}>
    {@render children()}
  </a>
{:else}
  <div class="card {className}" {...restProps}>
    {@render children()}
  </div>
{/if}

<style>
  .card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    border: green 2px solid;
    flex-grow: 0;
    text-decoration: none;
    color: inherit;
  }

  :global(.card > img),
  :global(.card > video),
  :global(.card > .immich-photo),
  :global(.card > .immich-video) {
    display: block;
    width: 300px;
    max-width: 300px;
    height: auto;
    object-fit: cover;
    aspect-ratio: 1;
  }

  :global(.card > .placeholder) {
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111;
    color: #666;
  }

  :global(.card > .card-text) {
    padding: 1rem;
    margin: 0;
    width: 100%;
    box-sizing: border-box;
  }

  :global(.card > .card-text h3) {
    margin: 0 0 0.5rem 0;
  }

  :global(.card > .card-text time) {
    color: #888;
    font-size: 0.8rem;
  }
</style>
