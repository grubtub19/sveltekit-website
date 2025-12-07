//TODO: I straight up vibecoded this so maybe do this myself in the future.

// This glob specifically looks for .md files in the current directory, 
// excluding any special SvelteKit files if they exist (though we filter below).
const modules = import.meta.glob('./*.md', { eager: true });

/** @type {import('./$types').PageLoad} */
export async function load() {
  const posts = Object.entries(modules).map(([path, module]) => {
    // path looks like './post-one.md'
    
    // Extract the slug by removing the leading './' and trailing '.md'
    // This vanilla JS solution is robust for your structure:
    const slug = path.replace(/^\.\//, '').replace(/\.md$/, '');
    
    // @ts-ignore - module.metadata is provided by your MDsveX preprocessor
    const { metadata } = module; 

    return {
      slug,
      ...metadata, // Contains title, date, etc.
    };
  });

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    posts: posts
  };
}