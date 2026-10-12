import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getImmichClient, type PhotoSize } from '$lib/server/immich';
import { deliverImage } from '$lib/server/delivery';

/**
 * API endpoint for `GET /api/photo/[id]`.
 */
export const GET: RequestHandler = async ({ params, url }): Promise<Response> => {
	const requestedSize = url.searchParams.get('size');
	const size: PhotoSize =
		requestedSize === 'thumbnail' || requestedSize === 'original'
			? requestedSize
			: 'preview';

	try {
		const immich = getImmichClient(env.IMMICH_API_URL, env.IMMICH_API_KEY);
		const upstreamResponse = await immich.getImage(params.id, size);
		return deliverImage(upstreamResponse);

	} catch (err: any) {
		const status = err?.status || 500;
		console.error(`[API/photo] Error fetching asset ${params.id}:`, err?.message || err);
		throw error(status, err?.message || 'Failed to retrieve photo');
	}
};
