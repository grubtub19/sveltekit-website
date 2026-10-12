<script lang="ts">
  import type { PageProps } from "./$types";
  import { CardGrid, Card, Photo } from "$lib";

  let { data }: PageProps = $props();
</script>

<h1>Galleries</h1>

<CardGrid>
  {#each data.albums as album (album.id)}
    <Card href="/gallery/{album.id}">
      {#if album.albumThumbnailAssetId}
        <Photo
          url={album.albumThumbnailAssetId}
          size="thumbnail"
          alt={album.albumName}
        />
      {:else}
        <div class="placeholder">No Cover Image</div>
      {/if}

      <div class="card-text">
        <h3>{album.albumName}</h3>
        {#if album.description}
          <p class="album-desc">{album.description}</p>
        {/if}
        {#if album.gear}
          <p class="album-gear">⚙️ {album.gear}</p>
        {/if}
        {#if album.createdAt}
          <time datetime={album.createdAt}>
            {new Date(album.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        {/if}
      </div>
    </Card>
  {:else}
    <p>No albums found.</p>
  {/each}
</CardGrid>

<style>
  .album-desc {
    margin: 0 0 0.5rem 0;
    color: #aaa;
    font-size: 0.9rem;
  }

  .album-gear {
    margin: 0 0 0.5rem 0;
    color: var(--color-accent, #2cff05);
    font-size: 0.85rem;
  }
</style>
