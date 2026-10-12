/**
 * Cloudflare Edge CDN & browser immutable media caching policy.
 * - public: Allows edge CDN and intermediate proxies to cache.
 * - max-age: 1 year client browser cache duration.
 * - s-maxage: 1 year Cloudflare edge CDN cache duration.
 * - immutable: Asset will not change under this URL; bypasses 304 revalidations.
 */
export const IMMUTABLE_MEDIA_CACHE =
	'public, max-age=31536000, s-maxage=31536000, immutable';


/**
 * Delivers an image stream with immutable edge caching and content length passthrough.
 */
export function deliverImage(
	upstream: Response,
	fallbackMime = 'image/webp'
): Response {
	const headers = new Headers();
	headers.set('Content-Type', upstream.headers.get('content-type') || fallbackMime);
	headers.set('Cache-Control', IMMUTABLE_MEDIA_CACHE);
	headers.set('Content-Disposition', 'inline');

	const contentLength = upstream.headers.get('content-length');
	if (contentLength) {
		headers.set('Content-Length', contentLength);
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers
	});
}

/**
 * Delivers a progressive video stream with HTTP 206 Partial Content (Range requests)
 * and edge caching so browsers can stream and scrub smoothly.
 */
export function deliverVideo(
	upstream: Response,
	fallbackMime = 'video/mp4'
): Response {
	const headers = new Headers();
	headers.set('Content-Type', upstream.headers.get('content-type') || fallbackMime);
	headers.set('Cache-Control', IMMUTABLE_MEDIA_CACHE);
	headers.set('Content-Disposition', 'inline');
	headers.set('Accept-Ranges', 'bytes');

	const contentRange = upstream.headers.get('content-range');
	if (contentRange) {
		headers.set('Content-Range', contentRange);
	}

	const contentLength = upstream.headers.get('content-length');
	if (contentLength) {
		headers.set('Content-Length', contentLength);
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers
	});
}
