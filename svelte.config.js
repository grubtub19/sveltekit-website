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
		remarkPlugins: [[
			relativeImages,
			{
					// Optional: attributes to add to **all** `img` tags
					attributes: {
						fetchpriority: "auto", // browser's default
						loading: "eager", // browser's default
						decoding: "auto", // browser's default
						class: "test-decoration test-shadow" // add classes to all images
					},
					// Optional: imagetools directives to add to **all** `img` tags
					// see https://github.com/JonasKruckenberg/imagetools/blob/main/docs/directives.md#format
					imagetoolsDirectives:{
						// tint: "rgb(10,33,127)",
						// blur: 10,
					}
				}
		]
		],
		extensions: ['.svx', '.md'] })
	],
	extensions: [".svelte", ".svx", ".md"]
};

export default config;
