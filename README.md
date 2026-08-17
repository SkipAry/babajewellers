# Baba Jewellers — Website

Premium landing page for Baba Jewellers, Shikrapur, Pune.
Next.js (App Router) + TypeScript + Tailwind CSS, statically exported.

## Quick start

```bash
npm install
npm run dev      # develop at http://localhost:3000
npm run build    # static export to ./out
```

## Deployment

Pushing to `main` deploys automatically — DigitalOcean App Platform builds
the static export and serves it at https://babajewellers.co.in behind
Cloudflare. Live about a minute after the push. There is nothing to upload
by hand, and no deploy config in this repo.

The deploy leaves no trace on GitHub: no Actions run, no deployment or
commit status, Pages off. `.github/workflows/` holds only `update-rates.yml`,
the daily gold and silver rates bot. So to confirm a deploy landed, check the
site rather than GitHub:

```bash
curl -sSI https://babajewellers.co.in   # last-modified vs. your push time
```

Then grep the served HTML, or `/_next/static/css/*.css`, for markup the new
commit introduced — a class only takes effect if its CSS rule shipped too.

## Editing content

**Everything editable lives in `src/data/site.ts`** — global phone and
WhatsApp details, per-store calling and WhatsApp contacts, hours, both
store addresses, the Formspree endpoint, the six promises, collection
pieces, reels, milestones, FAQs and the Instagram link.

Assets:
- `public/products/` — ornament photos (WebP)
- `public/models/` — model photography (WebP)
- `public/reels/` — compressed reel videos + posters

## Analytics

Cloudflare Web Analytics measures aggregate visits, page views, referral
sources, countries, and page performance. The privacy-first beacon is loaded
globally from `src/app/layout.tsx`; it does not use analytics cookies or track
individual visitors. The Cloudflare site token is public and belongs to the
`babajewellers.co.in` Web Analytics site.

Search Console clicks remain a separate search-performance metric. The
existing event hooks in `src/lib/analytics.ts` are not transmitted because no
Google Tag Manager container is loaded.

## Before launch checklist

1. **Form integration** — enquiries submit to the active Formspree
   endpoint configured in `site.formEndpoint` in `src/data/site.ts`.
2. ~~**Domain**~~ — done. `site.url` is `https://babajewellers.co.in`,
   which is live and serving.
3. ~~**Analytics**~~ — Cloudflare Web Analytics is installed globally without
   analytics cookies or a consent popup.
4. **Lifetime exchange wording** — confirm the exact exchange terms with
   the store owner; the FAQ and terms pages keep it general on purpose.
