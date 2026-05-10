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

<div class="glorp bottom left">
	<PeekyElement
		transitionFn={peek}
		duration={200}
		direction="bottom-left"
		distance={100}
		rotation={-60}
		easing={cubicOut}
	>
		<img class="kitty" src={kitty} alt="Glorp is curious!" />
	</PeekyElement>
</div>
<div class="glorp bottom right">
	<PeekyElement
		transitionFn={peek}
		duration={200}
		direction="bottom-right"
		distance={100}
		rotation={60}
		easing={cubicOut}
	>
		<img class="kitty" src={kitty} alt="Glorp is curious!" />
	</PeekyElement>
</div>

<style>
	@import "$lib/css/fonts.css";

	.glorp {
		position: fixed;
		z-index: 1000;
		transform-origin: 50% 50%;
	}

	.bottom {
		bottom: -6px;
	}

	.left {
		left: -18px;
	}

	.right {
		right: -18px;
		transform: scaleX(-1);
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
