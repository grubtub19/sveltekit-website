<script lang="ts">
    import { peek } from "$lib/transitions/peek-transitions";
    import { ProximityState } from "$lib/state/proximity.svelte";
    import type { EasingFunction } from "svelte/transition";

    let {
        children,
        duration = 400,
        threshold = 1.5,
        ...transitionProps
    }: {
        children: any;
        duration?: number;
        threshold?: number;
        [key: string]: any;
    } = $props();

    // svelte-ignore state_referenced_locally
    const prox = new ProximityState(threshold);

    // Propagate threshold changes
    $effect(() => {
        prox.threshold = threshold;
    });

    // Local UI state
    let lastEnteredAt = $state(0);

    // The "Smart" visibility boolean
    // It's true if the mouse is near OR if we haven't finished the intro duration
    let shouldShow = $derived.by(() => {
        if (prox.isActive) {
            // Update the timestamp whenever we become active
            // (Svelte 5 allows setting state in derived if it's not the derived value itself)
            return true;
        }

        const timeSinceEntry = Date.now() - lastEnteredAt;
        return timeSinceEntry < duration;
    });

    // We use an effect to catch the moment prox.isActive flips to true
    $effect(() => {
        if (prox.isActive) {
            lastEnteredAt = Date.now();
        }
    });
</script>

<div bind:this={prox.container} class="peek-wrapper">
    <div
        class="footprint"
        bind:clientWidth={prox.size.width}
        bind:clientHeight={prox.size.height}
    >
        {@render children()}
    </div>

    {#if shouldShow}
        <div
            transition:peek={{ duration, ...transitionProps }}
            class="peek-content"
        >
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .peek-wrapper {
        position: relative;
        /* Inline-block ensures the wrapper only takes up the space of the content */
        display: inline-block;
        vertical-align: middle;
    }

    .footprint {
        /* visibility: hidden preserves width/height but hides from view/screen readers */
        visibility: hidden;
        pointer-events: none;
        /* Ensure no layout shifts happen */
        user-select: none;
    }

    .peek-content {
        /* Absolute positioning relative to the wrapper */
        position: absolute;
        top: 0;
        left: 0;

        /* Stop text from wrapping if the kitty is a long string */
        white-space: nowrap;

        /* This prevents the kitty from blocking mouse events meant for the wrapper */
        pointer-events: none;

        /* Keeps the kitty above other elements */
        z-index: 100;

        /* Optimization: tells the browser this will move */
        will-change: transform, opacity;
    }
</style>
