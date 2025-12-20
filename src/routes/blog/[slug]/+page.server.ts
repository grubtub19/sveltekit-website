import { error, redirect } from '@sveltejs/kit';
import { blogRegistry } from '$lib/utils/post-registry';

export async function load({ params }) {
    const { slug } = params;
    const idMatch = slug.match(/^(\d+)/);
    
    if (!idMatch) throw error(400, 'Invalid ID');
    const id = parseInt(idMatch[1], 10);
    const post = blogRegistry[id];

    if (!post) throw error(404, 'Post not found');

    // Canonical redirect (e.g., /blog/001 -> /blog/001-japan)
    if (slug !== post.slug) {
        throw redirect(301, `/blog/${post.slug}`);
    }

    return {
        metadata: {
            title: post.title,
            date: post.date
        },
        folderName: post.folderName
    };
}