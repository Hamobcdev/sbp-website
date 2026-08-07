# Synergy Blockchain Pacific — Company Website

**Domain:** synergybcpacific.com
**Tagline:** Pioneering Blockchain in the Pacific
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS

## Why Next.js

The site is scaffolded on Next.js rather than static HTML because upcoming work
connects to the Algorand SDK, wallet interactions, smart contract reads, and
authenticated research access (Session 16+). Next.js gives us API routes,
server components, and a client-component boundary to build that on.

## Structure

```
sbp-website/
├── src/
│   └── app/
│       ├── layout.tsx       # Root layout — fonts, metadata
│       ├── page.tsx         # Landing page — assembles all sections
│       ├── globals.css      # Tailwind base + design tokens
│       └── components/      # Section + client components
├── public/
│   └── assets/
│       └── images/          # Logo, hero imagery
└── content/
    ├── research/            # Working papers, briefs (not publicly linked)
    └── updates/             # News and milestone updates
```

## Development

```bash
npm run dev
```

## Deployment

Deployed via Vercel. Every push to main auto-deploys to synergybcpacific.com.

## Sessions

- Session 15: Landing page — hero, about, products, research, contact
- Session 16: Gallery, audience tabs, ring diagram, working paper gate
