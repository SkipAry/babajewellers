# Baba Jewellers — Website

Premium landing page for Baba Jewellers, Shikrapur, Pune.
Next.js (App Router) + TypeScript + Tailwind CSS, statically exported.

## Quick start

```bash
npm install
npm run dev      # develop at http://localhost:3000
npm run build    # static export to ./out
```

Deploy the `out/` folder to any static host (Vercel, Netlify,
Cloudflare Pages, or plain hosting).

## Editing content

**Everything editable lives in `src/data/site.ts`** — global phone and
WhatsApp details, per-store calling and WhatsApp contacts, hours, both
store addresses, the Formspree endpoint, the six promises, collection
pieces, reels, milestones, FAQs and the Instagram link.

Assets:
- `public/products/` — ornament photos (WebP)
- `public/models/` — model photography (WebP)
- `public/reels/` — compressed reel videos + posters

## Before launch checklist

1. **Form integration** — enquiries submit to the active Formspree
   endpoint configured in `site.formEndpoint` in `src/data/site.ts`.
2. **Domain** — update `site.url` when the domain is confirmed.
3. **Analytics** — CTA clicks, reel plays and form submits already push
   to `window.dataLayer`; add a GA4/GTM snippet in `src/app/layout.tsx`.
4. **Lifetime exchange wording** — confirm the exact exchange terms with
   the store owner; the FAQ and terms pages keep it general on purpose.
