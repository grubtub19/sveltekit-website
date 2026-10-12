<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children: Snippet;
  }

  let { class: className = '', children, ...restProps }: Props = $props();
</script>

<div class="card-grid {className}" {...restProps}>
  {@render children()}
</div>

<style>
  .card-grid {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
  }
</style>
