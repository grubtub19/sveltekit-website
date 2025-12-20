// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	// These must match the keys you used in vite.config.ts
    const __BLOG_FILE__: string;
    const __BLOG_ROOT__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};