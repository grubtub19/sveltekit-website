<script lang="ts">
    import { peek } from "$lib/transitions/peek-transitions";
    import { ProximityState } from "$lib/state/proximity.svelte";
    import type { Snippet } from "svelte";

    let {
        children,
        threshold = 1.5,
        transitionFn = peek,
        ...transitionParams
    }: {
        children: Snippet;
        threshold?: number;
        transitionFn?: any;
        [key: string]: any;
    } = $props();

    // svelte-ignore state_referenced_locally
    const prox = new ProximityState(threshold);

    // Propagate threshold changes
    // Using pre to ensure threshold changes have immediate effects on proximity calculations before the DOM is updated.
    $effect.pre(() => {
        prox.threshold = threshold;
    });

    // Don't interrupt the peek animation once it starts
    let isCommitted = $state(false);
    let shouldShow = $derived(prox.isActive || isCommitted);
</script>

<div style:position="relative">
    <div bind:this={prox.container} class="hitbox">
        {@render children()}
    </div>

    {#if shouldShow}
        <div
            transition:transitionFn={transitionParams}
            onintrostart={() => (isCommitted = true)}
            onintroend={() => (isCommitted = false)}
            class="peek-content"
        >
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .hitbox {
        /* Use opacity: 0 instead of visibility: hidden to ensure 
           ResizeObserver/IntersectionObserver always "see" it */
        opacity: 0;
        pointer-events: none;
        user-select: none;
    }

    .peek-content {
        /* Optimization: tells the browser this will move */
        will-change: transform;
    }
</style>
