<script>
// TODO: I straight up vibecoded this so maybe do this myself in the future.
  // SvelteKit automatically passes the 'posts' array from +page.js
  export let data;
</script>

<h1>All Blog Posts</h1>

<ul>
  {#each data.posts as post (post.slug)}
    <li>
      <!-- Links point to the URL handled by src/routes/blog/[slug]/+page.js -->
      <a href={`/blog/${post.slug}`}>
        {post.title || 'Untitled Post'}
      </a>
      {#if post.date}
        <p><small>{new Date(post.date).toLocaleDateString()}</small></p>
      {/if}
    </li>
  {/each}
</ul>