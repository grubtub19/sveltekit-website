import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import relativeImages from 'mdsvex-relative-images';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$blog: 'content/blog'
		}
	},
	preprocess: [vitePreprocess(), mdsvex({ 
		remarkPlugins: [
			relativeImages
		],
		extensions: ['.svx', '.md'] })
	],
	extensions: [".svelte", ".svx", ".md"]
};

export default config;
