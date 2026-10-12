<script>
	import "$lib/css/main.css";
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
		rotate: 8deg;
	}

	.right {
		right: -18px;
		transform: scaleX(-1);
		rotate: -8deg;
	}
</style>
