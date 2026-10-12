/**
 * Remark plugin for MDSveX that transforms Immich photo and video URLs in markdown
 * into responsive, edge-cached <img> or progressive-streaming <video> tags.
 *
 * Example:
 *   ![Photo Caption](https://photos.valorant.nyc/photos/<uuid>)
 *   ![Video Caption](https://photos.valorant.nyc/photos/<uuid>)
 */

import { PHOTO_CONFIG, DEFAULT_SIZES } from '../config/photo.js';
import { getImmichClient } from '../server/immich.ts';

// Default responsive image configuration
const DEFAULT_CONFIG = {
	thumbnailWidth: PHOTO_CONFIG.thumbnailWidth,
	previewWidth: PHOTO_CONFIG.previewWidth,
	sizes: DEFAULT_SIZES
};

// Matches /photos/<id> with optional query parameters
const IMMICH_PHOTO_REGEX = /(?:https?:\/\/[^\/\s]+)?\/photos\/([^\s?#/]+)(?:\?([^#\s]*))?/;

// Cache asset types across markdown files to avoid duplicate API requests
/** @type {Map<string, 'IMAGE' | 'VIDEO'>} */
const assetTypeCache = new Map();

/**
 * Loads build-time environment variables and resolves the ImmichClient singleton.
 * Returns null if unconfigured (e.g. offline).
 * @returns {import('../server/immich.ts').ImmichClient | null}
 */
function getClient() {
	try {
		process.loadEnvFile?.();
	} catch {}

	const url = process.env.IMMICH_API_URL;
	const key = process.env.IMMICH_API_KEY;

	try {
		return getImmichClient(url, key);
	} catch {
		return null;
	}
}

/**
 * Recursive tree walker (zero external dependencies)
 * @param {any} node
 * @param {(node: any) => void} visitor
 */
function walk(node, visitor) {
	if (!node || typeof node !== 'object') return;
	visitor(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			walk(child, visitor);
		}
	}
}

/**
 * Remark plugin factory for MDSveX
 *
 * @param {Partial<typeof DEFAULT_CONFIG>} [userOptions] - Optional configuration overrides
 */
export default function remarkImmichImages(userOptions = {}) {
	const config = { ...DEFAULT_CONFIG, ...userOptions };

	/**
	 * @param {any} tree
	 * @param {any} file
	 */
	return async function transformer(tree, file) {
		const client = getClient();
		/** @type {Array<{ node: any, match: RegExpMatchArray }>} */
		const nodesToProcess = [];

		walk(tree, (/** @type {any} */ node) => {
			if (node.type === 'image' && typeof node.url === 'string') {
				const match = node.url.match(IMMICH_PHOTO_REGEX);
				if (match) {
					nodesToProcess.push({ node, match });
				}
			}
		});

		// Process all media nodes concurrently using ImmichClient
		await Promise.all(
			nodesToProcess.map(async ({ node, match }) => {
				const id = match[1];
				const searchParams = new URLSearchParams(match[2] || '');

				// Resolve asset type from cache or ImmichClient
				let isVideo = false;
				if (assetTypeCache.has(id)) {
					isVideo = assetTypeCache.get(id) === 'VIDEO';
				} else if (client) {
					try {
						const type = await client.getAssetType(id);
						isVideo = type === 'VIDEO';
						assetTypeCache.set(id, type);
					} catch (/** @type {any} */ err) {
						if (err?.status === 400) {
							const filePath = file?.filename || file?.path || 'unknown file';
							const line = node.position?.start?.line ? ` (line ${node.position.start.line})` : '';
							throw new Error(
								`[remark-immich-images] Invalid Immich asset UUID "${id}" in ${filePath}${line}. Expected 36-character UUIDv4 format.`
							);
						}
						// Fallback to IMAGE if offline or unreachable
						assetTypeCache.set(id, 'IMAGE');
					}
				}

				const caption = node.alt || '';

				if (isVideo) {
					const videoSrc = `/api/video/${id}`;
					const posterSrc = `/api/photo/${id}?size=preview`;

					node.data = {
						...node.data,
						hName: 'video',
						hProperties: {
							src: videoSrc,
							poster: posterSrc,
							controls: true,
							playsinline: true,
							preload: 'metadata',
							'aria-label': caption || undefined,
							title: caption || undefined
						},
						hChildren: [
							{
								type: 'element',
								tagName: 'track',
								properties: { kind: 'captions' },
								children: []
							}
						]
					};
				} else {
					const isOriginal = searchParams.get('size') === 'original';
					const imageSrc = isOriginal
						? `/api/photo/${id}?size=original`
						: `/api/photo/${id}?size=preview`;

					node.url = imageSrc;
					node.data = {
						...node.data,
						hProperties: {
							...(node.data?.hProperties || {}),
							src: imageSrc,
							...(!isOriginal && {
								srcset: `/api/photo/${id}?size=thumbnail ${config.thumbnailWidth}w, ${imageSrc} ${config.previewWidth}w`,
								sizes: config.sizes
							}),
							alt: caption,
							title: caption || undefined,
							loading: 'lazy',
							decoding: 'async'
						}
					};
				}
			})
		);
	};
}
