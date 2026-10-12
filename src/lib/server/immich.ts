import { env } from '$env/dynamic/private';

export type PhotoSize = 'thumbnail' | 'preview' | 'original';

export interface PhotoMetadata {
	id: string;
	width: number;
	height: number;
	aspectRatio: number;
	thumbhash?: string;
	capturedAt?: string;
}

/**
 * Client for communicating with an Immich instance.
 */
export class ImmichClient {
	readonly baseUrl: string;
	private readonly apiKey: string;

	constructor(baseUrl?: string, apiKey?: string) {
		if (!baseUrl || !apiKey) {
			throw new Error('ImmichClient configuration error: both baseUrl and apiKey are required');
		}

		this.baseUrl = baseUrl.replace(/\/$/, '');
		this.apiKey = apiKey;
	}

	/**
	 * Streams the image binary from Immich for a given asset ID.
	 *
	 * @param id The Immich asset UUID
	 * @param size 'thumbnail' (~300-500px), 'preview' (~1440-2048px), or 'original' (full uncompressed file)
	 * @returns The raw fetch Response stream from Immich
	 */
	async getImage(id: string, size: PhotoSize = 'preview'): Promise<Response> {
		const endpoint =
			size === 'original'
				? `${this.baseUrl}/api/assets/${id}/original`
				: `${this.baseUrl}/api/assets/${id}/thumbnail?size=${size}`;

		const response = await fetch(endpoint, {
			headers: {
				'x-api-key': this.apiKey,
				Accept: 'image/webp,image/jpeg,image/*;q=0.8'
			}
		});

		if (!response.ok) {
			let errorMsg = `HTTP ${response.status}`;
			try {
				const json = await response.json();
				errorMsg = json.message || JSON.stringify(json);
			} catch {
				const text = await response.text().catch(() => '');
				if (text) errorMsg = text;
			}
			const error = new Error(`Immich error (${response.status}): ${errorMsg}`);
			(error as any).status = response.status;
			throw error;
		}

		return response;
	}

	/**
	 * Fetches lightweight metadata (dimensions, aspect ratio, thumbhash, EXIF) without downloading the image binary.
	 *
	 * This is intended to be called at build-time (e.g., baking into `<img>` tags). The client should not be issuing API calls to my home NAS at runtime.
	 *
	 * TODO: For dynamic client-side components (e.g. interactive EXIF inspection modals or lightbox tooltips),
	 * consider exposing an edge-cached endpoint (`/api/photo/[id]/info/+server.ts`) with
	 * `Cache-Control: public, max-age=31536000, immutable` so Cloudflare's CDN caches JSON responses at the edge.
	 *
	 * @param id The Immich asset UUID
	 */
	async getMetadata(id: string): Promise<PhotoMetadata> {
		const endpoint = `${this.baseUrl}/api/assets/${id}`;

		const response = await fetch(endpoint, {
			headers: {
				'x-api-key': this.apiKey,
				Accept: 'application/json'
			}
		});

		if (!response.ok) {
			const error = new Error(`Immich metadata request failed with status ${response.status}`);
			(error as any).status = response.status;
			throw error;
		}

		const data = await response.json();
		const width = data.exifInfo?.imageWidth || 0;
		const height = data.exifInfo?.imageHeight || 0;
		const aspectRatio = width && height ? width / height : 1;

		return {
			id,
			width,
			height,
			aspectRatio,
			thumbhash: data.thumbhash || undefined,
			capturedAt: data.fileCreatedAt || data.createdAt
		};
	}
}

let cachedClient: ImmichClient | null = null;

/**
 * Singleton factory function avoids reinitializing client on every call.
 */
export function getImmichClient(): ImmichClient {
	if (!cachedClient) {
		cachedClient = new ImmichClient(env.IMMICH_API_URL, env.IMMICH_API_KEY);
	}
	return cachedClient;
}
