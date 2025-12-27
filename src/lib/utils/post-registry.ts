const postModules = import.meta.glob('$blog/**/*.md', { eager: true });
const imageModules = import.meta.glob('$blog/**/*.{png,PNG,webp,WEBP,webm,WEBM,jpg,JPG}', { 
    eager: true
});

export interface PostMetadata {
    id: number;
    slug: string;
    folderName: string; // The parent folder (e.g., "001-japan")
    title: string;
    date: string;
    image: any;
}

const postsById: Record<number, PostMetadata> = {};

for (const path in postModules) {
    const module = postModules[path] as any;
    const metadata = module.metadata;

    // Get the folder name (e.g., "8-gyoen-garden")
    const pathSegments = path.split('/');
    const folderName = pathSegments[pathSegments.length - 2]; 

    // Extract ID
    const idMatch = folderName.match(/^(\d+)/);
    if (!idMatch) continue;
    const id = parseInt(idMatch[1], 10);

    let resolvedImage = null;
    if (metadata.img) {
        const imageFileName = metadata.img.replace('./', '');
        
        // Find the image that is in the SAME path as the .md file
        // path: "src/lib/blog/8-gyoen/post.md"
        // folder: "src/lib/blog/8-gyoen"
        const currentFolder = path.split('/').slice(0, -1).join('/');
        
        const imageEntry = Object.entries(imageModules).find(([imgPath]) => {
            return imgPath.startsWith(currentFolder) && imgPath.endsWith(imageFileName);
        });

        if (imageEntry) {
            resolvedImage = (imageEntry[1] as any).default;
        } else {
            console.warn(`[Registry] ID ${id} image not found in ${currentFolder}/${imageFileName}`);
        }
    }

    postsById[id] = {
        id,
        slug: folderName,
        folderName: folderName,
        title: metadata.title || 'Untitled Post',
        date: metadata.date,
        image: resolvedImage // Make sure this is "image" (not "img") to match interface
    };
}

export const blogRegistry = postsById;