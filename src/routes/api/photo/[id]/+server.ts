import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { getImmichClient, type PhotoSize } from '$lib/server/immich';

// Validates 36-character UUIDv4 format (e.g. "13dec4d7-d2ab-4b63-8df0-e9e1bea4ff00")
// e.g., [0-9a-f]{8} -> 8 hexadecimal characters
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * SvelteKit API endpoint for `GET /api/photo/[id]`.
 * Proxies and edge-caches Immich photo assets for blog posts.
 *
 * @param params.id - The 36-character Immich asset UUID extracted from the route path.
 * @param url - The incoming request URL, used to read the optional `?size=` query parameter (`thumbnail` | `preview` | `original`).
 * @returns `Response` is the image binary with cache headers.
 */
export const GET: RequestHandler = async ({ params, url }): Promise<Response> => {
	const { id } = params;

	if (!id || !UUID_REGEX.test(id)) {
		throw error(400, 'Invalid photo ID format');
	}

	// Defualt to `preview` if no size is specified.
	const requestedSize = url.searchParams.get('size');
	const size: PhotoSize =
		requestedSize === 'thumbnail'
			? 'thumbnail'
			: requestedSize === 'original'
				? 'original'
				: 'preview';

	try {
		const immich = getImmichClient();
		const upstreamResponse = await immich.getImage(id, size);
		const contentType = upstreamResponse.headers.get('content-type') || 'image/webp';

		// Return image stream with immutable Cloudflare Edge Cache headers.
		//   public   -> Allows intermediate CDN proxies and browsers to cache.
		//   max-age  -> Client browser cache duration (1 year).
		//   s-maxage -> Shared edge CDN (Cloudflare PoP) cache duration (1 year).
		//   immutable-> Image isn't dynamic, so caches don't need to revalidate.
		return new Response(upstreamResponse.body, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
				'Content-Disposition': 'inline'
			}
		});
	} catch (err: any) {
		const status = err?.status || 500;
		console.error(`[API/photo] Error fetching asset ${id}:`, err?.message || err);
		throw error(status, err?.message || 'Failed to retrieve photo');
	}
};
