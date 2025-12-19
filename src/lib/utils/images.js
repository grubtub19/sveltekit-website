// Using $lib alias in the glob
const imageModules = import.meta.glob('$lib/assets/blog/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP}', {
  query: { enhanced: true },
  eager: true
});

/**
 * A pre-normalized map of image paths.
 * Keys: "blog/7-nishiki3.png"
 * Values: The optimized image object (srcset, src, etc.)
 */
export const blogImages = Object.fromEntries(
  Object.entries(imageModules).map(([path, module]) => [
    path.replace('/src/lib/assets/', ''), 
    module.default
  ])
);

/**
 * Helper to resolve a metadata path (e.g., "$lib/assets/blog/img.png")
 * to its optimized image object.
 */
export function resolveBlogImage(metadataPath) {
  if (!metadataPath) return null;
  const lookupKey = metadataPath.replace('$lib/assets/', '');
  return blogImages[lookupKey] || null;
}