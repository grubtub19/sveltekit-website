<script>
	export let data;
</script>

<a href="/blog">Back</a>

<article>
	<h1>{data.title}</h1>
	<p>{data.date}</p>
	<svelte:component this={data.content} />
</article>