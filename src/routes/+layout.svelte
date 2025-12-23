<script>
	import favicon from "$lib/assets/favicon.svg";
	import kitty from "$lib/assets/kitty.png";
	import PeekyElement from "$lib/components/PeekyElement.svelte";
	import { peek } from "$lib/transitions/peek-transitions";
	import { cubicOut } from "svelte/easing";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<div class="kitty-container">
	<PeekyElement
		transitionFn={peek}
		duration={200}
		direction="bottom-left"
		distance={100}
		rotation={-60}
		easing={cubicOut}
	>
		<img src={kitty} alt="Glorp is curious!" class="kitty" />
	</PeekyElement>
</div>

<style>
	@import "$lib/css/fonts.css";

	.kitty-container {
		position: fixed;
		bottom: -6px;
		left: -18px;
		z-index: 1000;
		transform-origin: 50% 50%;
	}

	.kitty {
		width: 150px;
		display: block;
		rotate: 8deg;
	}

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
