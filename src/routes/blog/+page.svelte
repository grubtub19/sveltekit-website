<script lang="ts">
  let { data } = $props();
</script>

<h1>All Blog Posts</h1>

<div class="blog-list">
  {#each data.posts as post (post.id)}
    <a href="/blog/{post.slug}" class="blog-item">
      {#if post.image}
        <enhanced:img class="blog-image" src={post.image} alt={post.title} />
      {:else}
        <div class="placeholder">No Image</div>
      {/if}

      <div class="blog-text">
        <h3 class="blog-title">{post.title}</h3>
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
    </a>
  {/each}
</div>

<style>
  .blog-list {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
  }
  .blog-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    border: green 2px solid;
    flex-grow: 0;
  }

  .blog-image {
    max-width: 300px;
    height: auto;
  }

  .blog-text {
    padding: 1rem;
    margin: 0;
  }

  .blog-title {
    margin-top: 0;
  }
</style>
