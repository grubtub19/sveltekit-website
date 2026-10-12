/**
 * Remark plugin for MDSveX that transforms Immich photo URLs in markdown
 * into responsive, edge-cached <img> tags.
 *
 * Example:
 *   ![Caption](https://photos.valorant.nyc/photos/13dec4d7-d2ab-4b63-8df0-e9e1bea4ff00)
 *
 * Compiles to:
 *   <img
 *     src="/api/photo/:id?size=preview"
 *     srcset="/api/photo/:id?size=thumbnail 400w, /api/photo/:id?size=preview 1440w"
 *     sizes="(max-width: 600px) 100vw, 750px"
 *     alt="Caption"
 *     loading="lazy"
 *     decoding="async"
 *   />
 */

import { PHOTO_CONFIG, DEFAULT_SIZES } from '../config/photo.js';

// Default responsive image configuration
const DEFAULT_CONFIG = {
	thumbnailWidth: PHOTO_CONFIG.thumbnailWidth,
	previewWidth: PHOTO_CONFIG.previewWidth,
	sizes: DEFAULT_SIZES
};

// Validates 36-character UUIDv4 format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matches /photos/<id> with optional query parameters (e.g. ?size=original)
const IMMICH_PHOTO_REGEX = /(?:https?:\/\/[^\/\s]+)?\/photos\/([^\s?#/]+)(?:\?([^#\s]*))?/;

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
	return function transformer(tree, file) {
		walk(tree, (/** @type {any} */ node) => {
			if (node.type !== 'image' || typeof node.url !== 'string') {
				return;
			}

			const match = node.url.match(IMMICH_PHOTO_REGEX);
			if (!match) {
				return; // Not an Immich photo URL; leave untouched for standard processing
			}

			const id = match[1];
			const searchParams = new URLSearchParams(match[2] || '');

			// Build-time validation: fail fast if UUID is malformed
			if (!UUID_REGEX.test(id)) {
				const filePath = file?.filename || file?.path || 'unknown file';
				const line = node.position?.start?.line ? ` (line ${node.position.start.line})` : '';
				throw new Error(
					`[remark-immich-images] Invalid Immich photo UUID "${id}" in ${filePath}${line}. Expected 36-character UUIDv4 format.`
				);
			}

			const isOriginal = searchParams.get('size') === 'original';
			const imageSrc = isOriginal ? `/api/photo/${id}?size=original` : `/api/photo/${id}?size=preview`;

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
					alt: node.alt || '',
					loading: 'lazy',
					decoding: 'async'
				}
			};
		});
	};
}
