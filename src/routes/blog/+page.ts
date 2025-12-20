import { blogRegistry } from '$lib/utils/post-registry';

export function load() {
    const posts = Object.values(blogRegistry).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return { posts };
}