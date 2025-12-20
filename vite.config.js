import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [		
		enhancedImages(), // must come before the SvelteKit plugin
		sveltekit()
	],
	define: {
		__BLOG_FILE__: '"index"',  // .md
		// The root folder name for all blog posts. Since we can't directly query $blog for this.
		__BLOG_ROOT__: '"blog"',
	}
});
