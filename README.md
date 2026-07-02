# AnywhereCompass

A mobile-first toy compass — point your phone and the needle shows which way to go. No map dashboard.

## Modes

- **Place** — search an address, drop a map pin, or open a share link
- **Parking** — one tap to save your car, later find it with the compass

## Run locally

Requires Node.js 20.9 or newer.

```bash
nvm use
npm ci
npm run dev
```

Open on your phone over HTTPS for location and compass sensors. `localhost`
works on the development computer; a phone needs an HTTPS tunnel such as
[ngrok](https://ngrok.com) or a deployed URL.

## Deploy

Push to GitHub and deploy on [Vercel](https://vercel.com). No environment
variables are required. The application includes Next.js route handlers that
proxy Photon geocoding requests.

## Demo

1. **Place** — search a venue, rotate phone, needle tracks the spot
2. **Share** — copy link / QR, friend opens same destination
3. **Parking** — Save my car → walk away → Find my car

## Tech

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Framer Motion · Leaflet ·
Photon geocoding

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```
