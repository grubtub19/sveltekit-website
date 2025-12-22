export class ProximityState {
    pointer = $state({ x: 0, y: 0 });
    container = $state<HTMLElement | null>(null);
    size = $state({ width: 0, height: 0 });
    threshold = $state(1.5);

    // Pure math, no timers
    isActive = $derived.by(() => {
        if (!this.container || this.size.width === 0) return false;
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const radius = (Math.max(rect.width, rect.height) / 2) * this.threshold;
        const distance = Math.sqrt(
            Math.pow(this.pointer.x - centerX, 2) + Math.pow(this.pointer.y - centerY, 2)
        );
        return distance < radius;
    });

    constructor(threshold?: number) {
        if (threshold) this.threshold = threshold;
        $effect(() => {
            const move = (e: PointerEvent) => { this.pointer = { x: e.clientX, y: e.clientY }; };
            window.addEventListener("pointermove", move);
            return () => window.removeEventListener("pointermove", move);
        });
    }
}