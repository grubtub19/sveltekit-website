<script>
	import favicon from "$lib/assets/favicon.svg";
	import Kitty from "$lib/components/kitty.svelte";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Kitty />

<style>
	@import "$lib/css/fonts.css";

	:global(html) {
		height: 100%;
		background-color: black;
		color: white;
		font-family: "Hiragino Maru Gothic Pro", sans-serif;
	}

	:global(body) {
		overflow: auto;
		height: 100%;
	}

	:global(h1) {
		color: #2cff05;
	}
</style>
