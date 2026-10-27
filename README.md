# Pearson Building website

Static export of https://www.pearsonbuilding.co.uk/ (originally built on Duda), self-hosted and deployed on Netlify.

## Layout

- `*.html` – desktop/tablet pages (`/phelps` is served from `phelps.html`)
- `_mobile/` – the phone build of each page. Duda serves different HTML to phones, so
  `netlify/edge-functions/device.ts` rewrites phone user agents to `/_mobile/<page>`
- `assets/` – CSS, fonts and images that were served from Duda's CDNs, plus the Duda runtime
- `editor/apps/modules/runtime/` – lazily loaded Duda runtime chunks (the runtime requests them from this path)
- `libs/` – skrollr and flexslider
- `feed/`, `sitemap.xml`, `robots.txt`, `404.html` – copied from the live site

## Deploy

Connect the repo to Netlify with no build command and publish directory `.` (see `netlify.toml`).

## Editing content

Text lives in the page HTML files, so edit both the desktop file and its `_mobile/` twin.
Images are referenced from `/assets/irp.cdn-website.com/86f28e74/dms3rep/multi/`.

## Notes

- Duda's visitor analytics beacon was removed. The runtime still attempts a metrics POST to
  `rtc.multiscreensite.com`, which fails harmlessly (it fails on the live site too).
- YouTube videos are still embedded from YouTube.
