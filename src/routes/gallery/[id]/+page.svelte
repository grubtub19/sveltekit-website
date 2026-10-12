<script lang="ts">
  import type { PageProps } from './$types';
  import { Photo, Video } from '$lib';

  let { data }: PageProps = $props();
</script>

<a href="/gallery">Back</a>

<article>
  <header>
    <h1>{data.album.albumName}</h1>
    {#if data.album.createdAt}
      <p>
        {new Date(data.album.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
    {/if}
    {#if data.album.description}
      <p class="album-desc">{data.album.description}</p>
    {/if}
    {#if data.album.gear}
      <p class="album-gear">⚙️ Gear: {data.album.gear}</p>
    {/if}
  </header>

  {#each data.album.assets as asset (asset.id)}
    {#if asset.type === 'VIDEO'}
      <Video url={asset.id} />
    {:else}
      <Photo url={asset.id} size="preview" />
    {/if}
  {:else}
    <p>This album is empty.</p>
  {/each}
</article>

<style>
  .album-desc {
    color: #ccc;
    margin: 0.5rem 0;
  }

  .album-gear {
    color: var(--color-accent, #2cff05);
    margin: 0.5rem 0;
    font-size: 0.95rem;
  }

  article :global(img),
  article :global(video) {
    max-height: 400px;
    max-width: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }
</style>
