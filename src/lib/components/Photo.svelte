<script lang="ts">
	import {
		PHOTO_CONFIG,
		DEFAULT_LANDSCAPE_WIDTH,
		DEFAULT_PORTRAIT_WIDTH,
	} from "$lib/config/photo.js";

	interface Props {
		/** Immich browser URL (e.g. "https://photos.valorant.nyc/photos/<id>") */
		url: string;
		alt?: string;
		width?: string;

		/** If true, sets 2:3 vertical aspect ratio (3:2 landscape is assumed by default) */
		portrait?: boolean;

		/**
		 * For portrait photos only: allows the photo to expand to its full vertical height.
		 * By default, portrait photos are capped to match landscape height (400px) to prevent vertical blowout.
		 */
		tall?: boolean;

		/** Override asset size directly ('thumbnail' | 'preview' | 'original') */
		size?: "thumbnail" | "preview" | "original";
	}

	let {
		url,
		alt = "",
		width,
		portrait = false,
		tall = false,
		size = "preview",
	}: Props = $props();

	// 1. Extract UUID from the Immich URL
	const id = $derived(url.match(/\/photos\/([^\s?#/]+)/)?.[1] ?? "");

	// Warn at development time if 'tall' is passed without 'portrait'
	$effect(() => {
		if (tall && !portrait) {
			console.warn(
				`[<Photo />] Warning: 'tall' prop was specified for "${url}" without 'portrait'. 'tall' only applies to portrait photos.`,
			);
		}
	});

	// 2. Aspect ratio: reads from CSS variables (synced from photo.js)
	const ratio = $derived(
		portrait
			? "var(--photo-aspect-ratio-portrait)"
			: "var(--photo-aspect-ratio)",
	);

	// 3. For portraits: default to var(--photo-max-height); if 'tall', override with 'none'
	const computedMaxHeight = $derived(
		portrait && tall
			? "none"
			: portrait
				? "var(--photo-max-height)"
				: undefined,
	);

	// 4. Preload scanner sizes attribute:
	// Automatically adapts to user width or orientation defaults
	const computedSizes = $derived(
		width
			? width
			: portrait && !tall
				? `(max-width: ${PHOTO_CONFIG.mobileBreakpoint}px) 100vw, ${DEFAULT_PORTRAIT_WIDTH}px`
				: `(max-width: ${PHOTO_CONFIG.mobileBreakpoint}px) 100vw, ${DEFAULT_LANDSCAPE_WIDTH}px`,
	);

	const isOriginal = $derived(size === "original");
	const src = $derived(`/api/photo/${id}?size=${size}`);
	const srcset = $derived(
		isOriginal
			? undefined
			: `/api/photo/${id}?size=thumbnail ${PHOTO_CONFIG.thumbnailWidth}w, /api/photo/${id}?size=preview ${PHOTO_CONFIG.previewWidth}w`,
	);
</script>

<img
	{src}
	{srcset}
	sizes={isOriginal ? undefined : computedSizes}
	{alt}
	loading="lazy"
	decoding="async"
	style:width
	style:max-height={computedMaxHeight}
	style:aspect-ratio={ratio}
/>
