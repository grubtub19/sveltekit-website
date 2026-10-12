import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getImmichClient } from '$lib/server/immich';
import galleryMetadataJson from '$content/galleries.json';

interface GalleryMetadata {
	gear?: string;
}

const galleryMetadata: Record<string, GalleryMetadata> = galleryMetadataJson;

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
	});

	try {
		const immich = getImmichClient(env.IMMICH_API_URL, env.IMMICH_API_KEY);
		const album = await immich.getAlbum(params.id);
		const meta = galleryMetadata[params.id];

		return {
			album: {
				...album,
				gear: meta?.gear
			}
		};
	} catch (err: any) {
		const status = err?.status || 500;
		console.error(`[Gallery] Error loading album ${params.id}:`, err?.message || err);
		throw error(status, err?.message || 'Failed to load album');
	}
};
