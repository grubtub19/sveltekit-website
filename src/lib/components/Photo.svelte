<script lang="ts">
	import { PHOTO_CONFIG, DEFAULT_SIZES } from "$lib/config/photo.js";

	interface Props {
		// Immich browser URL (or directly the UUID)
		url: string;
		alt?: string;
		/** Asset size tier to request from Immich: 'preview' (default), 'thumbnail', or 'original' */
		size?: "thumbnail" | "preview" | "original";
		/** Browser image loading strategy: 'lazy' (default) or 'eager' */
		loading?: "lazy" | "eager";
		/** Custom responsive sizes attribute */
		sizes?: string;
		class?: string;
	}

	let {
		url,
		alt = "",
		size = "preview",
		loading = "lazy",
		sizes = DEFAULT_SIZES,
		class: className = "",
	}: Props = $props();

	const id = $derived(url.match(/\/photos\/([^\s?#/]+)/)?.[1] ?? url);
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
	sizes={isOriginal ? undefined : sizes}
	{alt}
	{loading}
	decoding="async"
	class="immich-photo {className}"
/>

<style>
	.immich-photo {
		max-width: 100%;
		height: auto;
	}
</style>
