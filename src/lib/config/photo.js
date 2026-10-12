/**
 * Global photo layout & sizing configuration.
 * Single source of truth for <Photo /> component and remark markdown image plugin.
 */

export const PHOTO_CONFIG = Object.freeze({
	defaultHeight: 400, // Matches blog post CSS (:global(img) max-height: 400px)
	aspectRatio: 3 / 2, // Fujifilm X-T50 3:2 native sensor ratio
	mobileBreakpoint: 600, // Breakpoint where images expand to 100vw on mobile
	thumbnailWidth: 400, // Immich thumbnail asset width
	previewWidth: 1440 // Immich preview asset width
});

export const DEFAULT_LANDSCAPE_WIDTH = Math.round(
	PHOTO_CONFIG.defaultHeight * PHOTO_CONFIG.aspectRatio
);

export const DEFAULT_PORTRAIT_WIDTH = Math.round(
	PHOTO_CONFIG.defaultHeight / PHOTO_CONFIG.aspectRatio
);

export const DEFAULT_SIZES = `(max-width: ${PHOTO_CONFIG.mobileBreakpoint}px) 100vw, ${DEFAULT_LANDSCAPE_WIDTH}px`;
