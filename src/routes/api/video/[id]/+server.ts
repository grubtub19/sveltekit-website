import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getImmichClient } from '$lib/server/immich';
import { deliverVideo } from '$lib/server/delivery';

/**
 * API endpoint for `GET /api/video/[id]`.
 * Streams video based on range requests (e.g. scrubbing a video).
 */
export const GET: RequestHandler = async ({ params, request }): Promise<Response> => {
	try {
		const immich = getImmichClient(env.IMMICH_API_URL, env.IMMICH_API_KEY);
		const rangeHeader = request.headers.get('range');
		const upstreamResponse = await immich.getVideo(params.id, rangeHeader);
		return deliverVideo(upstreamResponse);
	} catch (err: any) {
		const status = err?.status || 500;
		console.error(`[API/video] Error streaming video asset ${params.id}:`, err?.message || err);
		throw error(status, err?.message || 'Failed to stream video');
	}
};
