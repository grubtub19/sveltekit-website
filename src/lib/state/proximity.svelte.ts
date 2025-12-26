// src/lib/state/proximity.svelte.ts
import { browser } from '$app/environment';
import { SvelteMap } from 'svelte/reactivity';

export class ProximityDetection {
	// External Variables
    // Element we are monitoring for proximity.
    container = $state<HTMLElement | null>(null);
	// Proximity threshold multiplier (1 = element radius, 2 = double radius, etc.)
    threshold = $state(1);
    // Whether the proximity detection is activated.
    isActive = $derived.by(() => {
		// If we recently lifted a touch within the zone (and 
		if (this.#isStickyActive) return true

        // Check if ANY active point (finger or mouse) is within the radius
        for (const point of this.#activePoints.values()) {
			if (this.#isInProximityZone(point.x, point.y)) return true
        }
        return false;
    });

	// Internal State

    // We use a Reactive Map to track all active input points (Mouse + Multiple Fingers).
    // This avoids thrashing by updating specific IDs instead of re-creating arrays.
    #activePoints = new SvelteMap<string | number, { x: number; y: number }>();
	#isStickyActive = $state(false);

	    // Internal state
    #bounds = $state({ x: 0, y: 0, w: 0, h: 0 });

	#centerX = $derived(this.#bounds.x + this.#bounds.w / 2);
	#centerY = $derived(this.#bounds.y + this.#bounds.h / 2);
	#radius = $derived((Math.max(this.#bounds.w, this.#bounds.h) / 2) * this.threshold)

	#isInProximityZone = (x: number, y: number): boolean => {
        const distance = Math.sqrt(
            Math.pow(x - this.#centerX, 2) + Math.pow(y - this.#centerY, 2)
        );
        return distance < this.#radius;
    };

    constructor(threshold: number) {
        this.threshold = threshold;

        // Early exit for SSR
        if (!browser) return;

        // Global Input Tracking
        // Handles both Mouse (PointerEvents) and Touch (TouchEvents) to ensure
        // proximity works even when a drag starts outside the zone on mobile.
        // TODO: Make this a singleton to avoid duplicate listeners for each instance.
        $effect(() => {
			const handlePointerDown = (e: PointerEvent) => { 
				// Clicks will stick or unstick the active state.
                this.#isStickyActive = this.#isInProximityZone(e.clientX, e.clientY)
            };

            const handlePointerMove = (e: PointerEvent) => {
                if (e.pointerType === 'mouse') {
                    // Reset the "stuck" state on any mouse movement
                    this.#isStickyActive = false;
                    this.#activePoints.set('mouse', { x: e.clientX, y: e.clientY });
                }
            };

			const handleTouchUpdate = (e: TouchEvent) => {
                // Update or add every finger currently involved in this event.
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
                    // Unstick when a touch event enters the proximity zone.
                    if (this.#isStickyActive && this.#isInProximityZone(touch.clientX, touch.clientY)) {
                        this.#isStickyActive = false;
                    }

                    this.#activePoints.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
                }
            };

            const handleTouchRemove = (e: TouchEvent) => {
                // Remove specific fingers as they leave the screen.
                for (let i = 0; i < e.changedTouches.length; i++) {
                    const touch = e.changedTouches[i];
					const point = this.#activePoints.get(touch.identifier);

					// If a touch is lifted while in the proximity zone, we "stick" the active state on.
					if (point && this.#isInProximityZone(point.x, point.y)) {
                        this.#isStickyActive = true;
                    }
                    this.#activePoints.delete(touch.identifier);
                }
            };

			window.addEventListener('pointerdown', handlePointerDown, {passive: true });
            window.addEventListener('pointermove', handlePointerMove, { passive: true });
            window.addEventListener('touchstart', handleTouchUpdate, { passive: true });
            window.addEventListener('touchmove', handleTouchUpdate, { passive: true });
            window.addEventListener('touchend', handleTouchRemove, { passive: true });
            window.addEventListener('touchcancel', handleTouchRemove, { passive: true });

            return () => {
				window.removeEventListener('pointerdown', handlePointerDown);
                window.removeEventListener('pointermove', handlePointerMove);
                window.removeEventListener('touchstart', handleTouchUpdate);
                window.removeEventListener('touchmove', handleTouchUpdate);
                window.removeEventListener('touchend', handleTouchRemove);
                window.removeEventListener('touchcancel', handleTouchRemove);
            };
        });

        // -- Passive Container Tracking --
        // We want to update the #bounds whenever the container's position or size changes.
        // Rather than call getBoundingClientRect() continuously (which requires layout recalculation),
        // we use observers and event listeners to recalculate only when the layout has already been computed.
        // This allows getBoundingClientRect() to use cached layout information rather than forcing a reflow.
        // TODO: Make this a singleton to avoid duplicate observers for each instance.
        $effect(() => {
            if (!this.container) return;

            const update = () => {
                if (!this.container) return;
                // Will always read from layout cache, avoiding reflow.
                const rect = this.container.getBoundingClientRect();
                this.#bounds = {
                    x: rect.left,
                    y: rect.top,
                    w: rect.width,
                    h: rect.height
                };
            };

            // Watch for size changes/layout shifts of the element itself
            // E.g., A sidebar opens or an image loads, pushing your element sideways.
            const resizeObserver = new ResizeObserver(update);
            resizeObserver.observe(this.container);

            // Watch for visibility changes (e.g., parent becomes visible for the first time)
            // E.g., An element is revealed via a Tab/Modal (no scroll/size change occurred).
            const intersectionObserver = new IntersectionObserver(update, {
                threshold: [0, 1]
            });
            intersectionObserver.observe(this.container);

            // Watch for viewport movement
            // E.g., The user scrolls while the mouse is stationary near the element.
            window.addEventListener('scroll', update, { passive: true });

            // Watch for window resizes
            // E.g., A mobile user's address bar shrinks, or a fixed element's anchor moves.
            window.addEventListener('resize', update, { passive: true });

            // Initial measure
            update();

            return () => {
                resizeObserver.disconnect();
                intersectionObserver.disconnect();
                window.removeEventListener('scroll', update);
                window.removeEventListener('resize', update);
            };
        });
    }
}