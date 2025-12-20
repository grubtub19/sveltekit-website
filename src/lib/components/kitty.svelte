<script>
  import kitten from "$lib/assets/kitty.png";

  let hereKitty = $state(false);
</script>

<svelte:body
  onmouseenter={() => (hereKitty = true)}
  onmouseleave={() => (hereKitty = false)}
/>

<img
  class={{ curious: hereKitty }}
  alt="Kitten wants to know what's going on"
  src={kitten}
/>

<style>
  img {
    position: absolute;
    left: 0;
    bottom: -25px;
    transform: translate(-80%, 0) rotate(-15deg);
    transform-origin: 100% 100%;
    transition: transform 0.4s;
  }

  .curious {
    transform: translate(-20%, 0) rotate(15deg);
  }

  :global(body) {
    overflow: hidden;
  }
</style>
