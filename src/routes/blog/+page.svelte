<script lang="ts">
  import type { PageProps } from './$types';
  import { CardGrid, Card } from '$lib';

  let { data }: PageProps = $props();
</script>

<h1>All Blog Posts</h1>

<CardGrid>
  {#each data.posts as post (post.id)}
    <Card href="/blog/{post.slug}">
      {#if post.image}
        <img src={post.image} alt={post.title} />
      {:else}
        <div class="placeholder">No Image</div>
      {/if}

      <div class="card-text">
        <h3>{post.title}</h3>
        {#if post.date}
          <time datetime={post.date}>
            {new Date(post.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        {/if}
      </div>
    </Card>
  {/each}
</CardGrid>
