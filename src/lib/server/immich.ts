export type PhotoSize = 'thumbnail' | 'preview' | 'original';

export type AssetType = 'IMAGE' | 'VIDEO';

export interface Album {
	id: string;
	albumName: string;
	description?: string;
	createdAt: string;
	albumThumbnailAssetId?: string;
	assetCount: number;
	assets?: Array<{ id: string; type: AssetType }>;
}

/**
 * Pure client for communicating with an Immich instance.
 * Completely decoupled from SvelteKit runtime virtual modules ($env)
 * so it can be used cleanly in both server routes and build-time plugins.
 */
export class ImmichClient {
	readonly baseUrl: string;
	private readonly apiKey: string;
	private static readonly UUID_REGEX =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

	constructor(baseUrl?: string, apiKey?: string) {
		if (!baseUrl || !apiKey) {
			throw new Error('ImmichClient configuration error: both baseUrl and apiKey are required');
		}

		this.baseUrl = baseUrl.replace(/\/$/, '');
		this.apiKey = apiKey;
	}

	/**
	 * Validates 36-character UUIDv4 format, failing fast with HTTP 400 if malformed.
	 */
	validateId(id: string): void {
		if (!id || !ImmichClient.UUID_REGEX.test(id)) {
			const error = new Error(`Invalid Immich asset ID format: "${id}". Expected 36-character UUIDv4.`);
			(error as any).status = 400;
			throw error;
		}
	}

	/**
	 * Core private fetch handler for Immich API calls.
	 * Handles authentication, Range headers, retries with backoff for transient failures,
	 * and structured error extraction.
	 */
	private async fetchAsset(
		path: string,
		options: {
			accept: string;
			range?: string | null;
			method?: string;
			headers?: Record<string, string>;
			body?: string;
		}
	): Promise<Response> {
		const headers: Record<string, string> = {
			'x-api-key': this.apiKey,
			Accept: options.accept,
			...(options.headers || {})
		};

		if (options.range) {
			headers['Range'] = options.range;
		}

		const maxRetries = 2;
		let attempt = 0;

		while (true) {
			try {
				const response = await fetch(`${this.baseUrl}${path}`, {
					method: options.method || 'GET',
					headers,
					body: options.body
				});

				if (!response.ok && response.status !== 206) {
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
			} catch (err: any) {
				const isTransient =
					!err.status ||
					err.status === 429 ||
					(err.status >= 500 && err.status <= 504);

				if (attempt < maxRetries && isTransient) {
					attempt++;
					const delay = Math.min(200 * Math.pow(2, attempt - 1), 1000);
					await new Promise((resolve) => setTimeout(resolve, delay));
					continue;
				}

				throw err;
			}
		}
	}

	/**
	 * Streams the image binary from Immich for a given asset ID.
	 *
	 * @param id The Immich asset UUID
	 * @param size 'thumbnail' (~300-500px), 'preview' (~1440-2048px), or 'original' (full uncompressed file)
	 * @returns The raw fetch Response stream from Immich
	 */
	async getImage(id: string, size: PhotoSize = 'preview'): Promise<Response> {
		this.validateId(id);

		const path =
			size === 'original'
				? `/api/assets/${id}/original`
				: `/api/assets/${id}/thumbnail?size=${size}`;

		return this.fetchAsset(path, {
			accept: 'image/webp,image/jpeg,image/*;q=0.8'
		});
	}

	/**
	 * Streams video playback from Immich with HTTP Range request support.
	 *
	 * @param id The Immich asset UUID
	 * @param rangeHeader The incoming Range header from the browser (e.g. "bytes=0-1048576")
	 * @returns The raw Response stream from Immich (usually 206 Partial Content)
	 */
	async getVideo(id: string, rangeHeader?: string | null): Promise<Response> {
		this.validateId(id);

		return this.fetchAsset(`/api/assets/${id}/video/playback`, {
			accept: 'video/mp4,video/*;q=0.9',
			range: rangeHeader
		});
	}

	/**
	 * Fetches asset type from Immich without downloading media binaries.
	 * Used at build-time to resolve <img> vs <video> content.
	 *
	 * @param id The Immich asset UUID
	 */
	async getAssetType(id: string): Promise<AssetType> {
		this.validateId(id);

		const response = await this.fetchAsset(`/api/assets/${id}`, {
			accept: 'application/json'
		});

		const data = await response.json();
		return data.type === 'VIDEO' ? 'VIDEO' : 'IMAGE';
	}

	// Lists all albums from Immich.
	async getAlbums(): Promise<Album[]> {
		const response = await this.fetchAsset('/api/albums', {
			accept: 'application/json'
		});

		return response.json();
	}
	 
	// Fetches a single album and its assets by UUID.
	async getAlbum(id: string): Promise<Album> {
		this.validateId(id);

		const albumResponse = await this.fetchAsset(`/api/albums/${id}`, {
			accept: 'application/json'
		});
		const album: Album = await albumResponse.json();

		// Modern Immich separates asset listing from the album metadata endpoint
		try {
			const searchResponse = await this.fetchAsset('/api/search/metadata', {
				accept: 'application/json',
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ albumIds: [id], size: 1000 })
			});
			const searchData = await searchResponse.json();
			const items: any[] = searchData?.assets?.items || [];

			album.assets = items.map((item) => ({
				id: item.id,
				type: (item.type === 'VIDEO' ? 'VIDEO' : 'IMAGE') as AssetType
			}));
		} catch (err) {
			console.warn(`[Immich] Could not fetch assets for album ${id} via search/metadata:`, err);
			album.assets = album.assets || [];
		}

		return album;
	}
}

let cachedClient: ImmichClient | null = null;

/**
 * Singleton factory function. Reuses client instance once initialized.
 * Credentials are injected due to differences between accessing env variables at buildtime vs runtime.
 */
export function getImmichClient(baseUrl?: string, apiKey?: string): ImmichClient {
	if (!cachedClient) {
		if (!baseUrl || !apiKey) {
			throw new Error('ImmichClient configuration error: both baseUrl and apiKey are required');
		}
		cachedClient = new ImmichClient(baseUrl, apiKey);
	}
	return cachedClient;
}
