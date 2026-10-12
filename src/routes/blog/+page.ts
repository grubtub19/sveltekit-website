import { blogRegistry, type PostMetadata } from '$lib/utils/post-registry';

export const load = () => {
	const posts: PostMetadata[] = Object.values(blogRegistry).sort((a, b) => 
		new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	return { posts };
};