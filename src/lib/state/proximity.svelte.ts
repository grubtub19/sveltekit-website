// src/lib/state/proximity.svelte.ts
import { browser } from '$app/environment';

export class ProximityState {
    // Element 
    container = $state<HTMLElement | null>(null);

    // Internal state
    #bounds = $state({ x: 0, y: 0, w: 0, h: 0 });
    #pointer = $state({ x: 0, y: 0 });

    // Proximity threshold multiplier (1 = element radius, 2 = double radius, etc.)
	threshold = $state(1);

	// 2. Optimized Derived Logic
	isActive = $derived.by(() => {
		const centerX = this.#bounds.x + this.#bounds.w / 2;
		const centerY = this.#bounds.y + this.#bounds.h / 2;

		// Use the larger dimension to create a circular proximity zone
		const radius = (Math.max(this.#bounds.w, this.#bounds.h) / 2) * this.threshold;

		const distance = Math.sqrt(
			Math.pow(this.#pointer.x - centerX, 2) + Math.pow(this.#pointer.y - centerY, 2)
		);
		return distance < radius;
	});

	constructor(threshold: number) {
        this.threshold = threshold;

        // Early exit for SSR
		if (!browser) return;

		// Global Mouse Tracking
        // TODO: Make this a singleton to avoid duplicate listeners for each instance.
		$effect(() => {
			const move = (e: PointerEvent) => {
				this.#pointer = { x: e.clientX, y: e.clientY };
			};
			window.addEventListener('pointermove', move, { passive: true });
			return () => window.removeEventListener('pointermove', move);
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