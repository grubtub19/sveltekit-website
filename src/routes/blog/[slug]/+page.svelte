<script lang="ts">
    import type { PageData } from "./$types";
    let { data }: { data: PageData } = $props();
</script>

<a href="/blog">Back</a>

<article>
    <header>
        <h1>{data.metadata.title}</h1>
        <p>{data.metadata.date}</p>
    </header>

    {@html data.content}
</article>

<style>
    :global(img) {
        max-height: var(--photo-max-height);
        max-width: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
    }
</style>
