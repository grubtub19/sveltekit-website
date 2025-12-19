<script>
// TODO: I straight up vibecoded this so maybe do this myself in the future.
  // SvelteKit automatically passes the 'posts' array from +page.js
  export let data;
  // Disable date for now until I make it pretty.
  let date = false;
</script>

<h1>All Blog Posts</h1>

<div class="blog-list">
{#each data.posts as post (post.slug)}
  <a href={`/blog/${post.slug}`} class="blog-item">
    {#if post.img}
      <enhanced:img class="blog-image" src={post.img} alt={post.title || 'Untitled Post'} />
    {/if}
    <p class="blog-text">
      <!-- Links point to the URL handled by src/routes/blog/[slug]/+page.js -->
      {post.title || 'Untitled Post'}
      {#if post.date && date}
        <big>{new Date(post.date).toLocaleDateString()}</big>
      {/if}
    </p>
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
</style>