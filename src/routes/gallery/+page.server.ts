import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { getImmichClient } from '$lib/server/immich';
import galleryMetadataJson from '$content/galleries.json';

interface GalleryMetadata {
	gear?: string;
}

const galleryMetadata: Record<string, GalleryMetadata> = galleryMetadataJson;

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
	});

	try {
		const immich = getImmichClient(env.IMMICH_API_URL, env.IMMICH_API_KEY);
		const albums = await immich.getAlbums();

		const enrichedAlbums = albums
			.map((album) => {
				const meta = galleryMetadata[album.id];
				return {
					...album,
					gear: meta?.gear
				};
			})
			.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);

		return { albums: enrichedAlbums };
	} catch (err: any) {
		console.error('[Gallery] Failed to fetch albums from Immich:', err?.message || err);
		return { albums: [] };
	}
};
