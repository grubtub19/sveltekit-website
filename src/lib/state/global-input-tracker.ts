// src/lib/state/global-input-tracker.ts
import { SvelteMap } from 'svelte/reactivity';

// Manages a single set of global input listeners shared across all consumers.
// This avoids duplicate listeners when multiple components need to track
// active input points (mouse + touch).
export class GlobalInputTracker {
	static #instance: GlobalInputTracker | null = null;
    // "Active" refers to any input that has location data we can track (mouse + touch).
    // For mouse, it tracks regardless of button state. It is only active when the window
    // is in focus and the mouse is within the viewpoint.
    // For touch, each finger touch is tracked separately.
	#activePoints = new SvelteMap<string | number, { x: number; y: number }>();
    // Use callbacks instead of listeners since we can piggy-back off the listeners for activePoints.
	#pointerdownCallbacks = new Set<(e: PointerEvent) => void>();
	#pointermoveCallbacks = new Set<(e: PointerEvent) => void>();
	#touchUpdateCallbacks = new Set<(e: TouchEvent) => void>();
	#touchRemoveCallbacks = new Set<(e: TouchEvent) => void>();
	#initialized = false;

	private constructor() {}

	static getInstance(): GlobalInputTracker {
		if (!GlobalInputTracker.#instance) {
			GlobalInputTracker.#instance = new GlobalInputTracker();
		}
		return GlobalInputTracker.#instance;
	}

	initialize() {
		if (this.#initialized) return;
		this.#initialized = true;

		const handlePointerDown = (e: PointerEvent) => {
			this.#pointerdownCallbacks.forEach(cb => cb(e));
		};

		const handlePointerMove = (e: PointerEvent) => {
			if (e.pointerType === 'mouse') {
				this.#activePoints.set('mouse', { x: e.clientX, y: e.clientY });
			}
			this.#pointermoveCallbacks.forEach(cb => cb(e));
		};

		const handleTouchUpdate = (e: TouchEvent) => {
			for (let i = 0; i < e.changedTouches.length; i++) {
				const touch = e.changedTouches[i];
				this.#activePoints.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
			}
			this.#touchUpdateCallbacks.forEach(cb => cb(e));
		};

		const handleTouchRemove = (e: TouchEvent) => {
			for (let i = 0; i < e.changedTouches.length; i++) {
				const touch = e.changedTouches[i];
				this.#activePoints.delete(touch.identifier);
			}
			this.#touchRemoveCallbacks.forEach(cb => cb(e));
		};

		// Clear mouse position when the pointer leaves the viewport.
		const handlePointerOut = (e: PointerEvent) => {
			if (e.pointerType === 'mouse' && e.isPrimary) {
				this.#activePoints.delete('mouse');
			}
		};

		// Clear mouse position when the window loses focus.
		const handleWindowBlur = () => {
			this.#activePoints.delete('mouse');
		};

		window.addEventListener('pointerdown', handlePointerDown, { passive: true });
		window.addEventListener('pointermove', handlePointerMove, { passive: true });
		window.addEventListener('pointerout', handlePointerOut, { passive: true });
		window.addEventListener('touchstart', handleTouchUpdate, { passive: true });
		window.addEventListener('touchmove', handleTouchUpdate, { passive: true });
		window.addEventListener('touchend', handleTouchRemove, { passive: true });
		window.addEventListener('touchcancel', handleTouchRemove, { passive: true });
		window.addEventListener('blur', handleWindowBlur, { passive: true });
	}

	onPointerDown(callback: (e: PointerEvent) => void): () => void {
		this.#pointerdownCallbacks.add(callback);
		return () => this.#pointerdownCallbacks.delete(callback);
	}

	onPointerMove(callback: (e: PointerEvent) => void): () => void {
		this.#pointermoveCallbacks.add(callback);
		return () => this.#pointermoveCallbacks.delete(callback);
	}

	onTouchUpdate(callback: (e: TouchEvent) => void): () => void {
		this.#touchUpdateCallbacks.add(callback);
		return () => this.#touchUpdateCallbacks.delete(callback);
	}

	onTouchRemove(callback: (e: TouchEvent) => void): () => void {
		this.#touchRemoveCallbacks.add(callback);
		return () => this.#touchRemoveCallbacks.delete(callback);
	}

	getActivePoints(): SvelteMap<string | number, { x: number; y: number }> {
		return this.#activePoints;
	}
}
