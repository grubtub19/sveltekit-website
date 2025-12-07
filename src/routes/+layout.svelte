<script>
	import favicon from '$lib/assets/favicon.svg';
	import Kitty from '$lib/components/kitty.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>


{@render children()}

<Kitty />

<style>
	:global(html) {
		height: 100%;
		background-color: black;
		color: white;
	}

	:global(body) {
		height: 100%;
	}
</style>