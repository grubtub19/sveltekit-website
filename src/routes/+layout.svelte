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
		background-color: black;
		color: white;
	}
</style>