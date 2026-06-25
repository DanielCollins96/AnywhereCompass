# AnywhereCompass

A mobile-first toy compass — point your phone and the needle shows which way to go. No map dashboard.

## Modes

- **Place** — search an address, drop a map pin, or open a share link
- **Parking** — one tap to save your car, later find it with the compass

## Run locally

```bash
npm install
npm run dev
```

Open on your phone over HTTPS for compass sensors (use [ngrok](https://ngrok.com) or deploy to Vercel).

## Deploy

Push to GitHub and deploy on [Vercel](https://vercel.com). No backend or env vars required.

Optional: set `NEXT_PUBLIC_MAPBOX_TOKEN` if you swap in Mapbox later (currently uses OpenStreetMap + Nominatim).

## Demo

1. **Place** — search a venue, rotate phone, needle tracks the spot
2. **Share** — copy link / QR, friend opens same destination
3. **Parking** — Save my car → walk away → Find my car

## Tech

Next.js 15 · TypeScript · Tailwind · Framer Motion · Leaflet · Nominatim geocoding
