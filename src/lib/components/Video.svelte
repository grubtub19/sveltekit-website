<script lang="ts">
	import type { HTMLVideoAttributes } from "svelte/elements";

	interface Props extends HTMLVideoAttributes {
		/** Immich browser URL or UUID */
		url: string;
		alt?: string;
		/** Asset size for video poster image: 'preview' (default) or 'thumbnail' */
		posterSize?: "thumbnail" | "preview";
	}

	let {
		url,
		alt = "",
		controls = true,
		autoplay = false,
		loop = false,
		muted = false,
		posterSize = "preview",
		class: className = "",
		...restProps
	}: Props = $props();

	const id = $derived(url.match(/\/photos\/([^\s?#/]+)/)?.[1] ?? url);
	const src = $derived(`/api/video/${id}`);
	const poster = $derived(`/api/photo/${id}?size=${posterSize}`);
</script>

<video
	{src}
	{poster}
	{controls}
	{autoplay}
	{loop}
	{muted}
	playsinline
	preload="metadata"
	aria-label={alt || undefined}
	{...restProps}
	class="immich-video {className}"
>
	<track kind="captions" />
</video>

<style>
	.immich-video {
		max-width: 100%;
		height: auto;
	}
</style>
