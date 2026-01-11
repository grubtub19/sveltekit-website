import { error, redirect } from '@sveltejs/kit';
import { blogRegistry } from '$lib/utils/post-registry';
import { render } from 'svelte/server';

export async function load({ params }) {
    const { slug } = params;
    const idMatch = slug.match(/^(\d+)/);
    
    if (!idMatch) throw error(400, 'Invalid ID');
    const id = parseInt(idMatch[1], 10);
    const post = blogRegistry[id];

    if (!post) throw error(404, 'Post not found');

    if (slug !== post.slug) {
        throw redirect(301, `/blog/${post.slug}`);
    }

    // Import the markdown module
    const module = await import(`$blog/${post.folderName}/index.md`);
    
    // Render the Svelte component to HTML on the server
    const { body } = render(module.default);

    return {
        metadata: { title: post.title, date: post.date },
        content: body  // Pass rendered HTML string (serializable)
    };
}