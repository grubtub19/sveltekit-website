<script lang="ts">
    import type { PageData } from "./$types";
    let { data }: { data: PageData } = $props();

    // Use a relative path from this file to your blog folder
    // Note: We use the folderName from the server data
    let postPromise = $derived(
        import(`$blog/${data.folderName}/${__BLOG_FILE__}.md`),
    );
</script>

<a href="/blog">Back</a>

<article>
    <header>
        <h1>{data.metadata.title}</h1>
        <p>{data.metadata.date}</p>
    </header>

    {#await postPromise}
        <p>Loading post...</p>
    {:then module}
        <module.default />
    {:catch error}
        <p style="color: red;">Error: {error.message}</p>
    {/await}
</article>

<style>
    :global(img) {
        max-height: 600px;
        max-width: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
    }
</style>
