# valorant.nyc (Personal Website & Blog)

My personal website and photography blog. Written in Svelte/SvelteKit and deployed via Cloudflare Pages. Images are served via my Immich instance on my NAS.

# Architecture

* **Hosting**: Cloudflare Pages + Edge Network.
* **Media / Photos**: Self-hosted Immich instance.

Hosting via Cloudflare Pages provides global edge distribution, allowing global users to load cached versions of the site. 

Since Cloudflare Pages isn't designed to store large assets (e.g., images), Cloudflare Images would be the immediate solution. However, I already store my photos in my own publically accessible Immich instance from my NAS. Duplicating image files across services introduces unnecessary complexity and churn for blog authoring. Coupled with Cloudflare's Edge Network, served images are cached for global users, reducing latency and protecting my home network's upload bandwidth.

## Environment Setup

1. Copy `.env.example` into a new local `.env` file and populate the environment variables.
2. For production, configure these same variables in **Cloudflare Pages**:
   **Dashboard $\rightarrow$ Workers & Pages $\rightarrow$ Settings $\rightarrow$ Environment Variables**.

## Development

```sh
npm install
npm run dev
```

## Building & Deployment

```sh
npm run build      # Produces Cloudflare Pages build in .svelte-kit/cloudflare
npm run preview    # Preview locally
npm run deploy     # Deploy to Cloudflare Pages
```
