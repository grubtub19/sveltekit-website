import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [		
		sveltekit()
	],
	logLevel: 'info',
	define: {
		__BLOG_FILE__: '"index"',  // .md
		// The root folder name for all blog posts. Since we can't directly query $blog for this.
		__BLOG_ROOT__: '"blog"',
	},
	server: {
		fs: {
			// Allowlist the content directory for serving
			allow: ['content']
		}
	}
});
