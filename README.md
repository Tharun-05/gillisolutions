# Gilli Solutions website

Static site for Gilli Solutions (commercial kitchen ventilation, Peenya, Bengaluru).
Hosted free on **Cloudflare Pages**, with the source on GitHub. Every push, including saves from
`/admin/`, is built and published automatically. Setup and upkeep: **HOSTING-GUIDE.md**.
(Staying on cPanel instead is also supported: **DEPLOY-CPANEL.md**.)

## Editing content

| What | Where |
|---|---|
| Phones, email, address, hours, stats, warranty, team | `src/site.json` |
| Client logos, project photos | the content manager at `/admin/` (saves to `src/content/*.json` and `assets/uploads/`) — see **ADMIN-GUIDE.md** |
| Page text and layout | `src/pages/*.html` |
| Products (names, specs, images, search keywords) | `assets/js/data.js` |
| Header, footer, chat widget, enquiry form, icons | `tools/build.py` |
| Styles | `assets/css/site.css` (one file) |

After editing anything in `src/` or `tools/`, run:

```
python tools/build.py
```

This regenerates the `*.html` pages in the root and `assets/js/site.js`.
**Don't edit the root `*.html` files directly** — they're overwritten on every build.
Cloudflare runs `python tools/build.py --out _site` on every push, so the live site always
matches `src/`. Redirects and security headers are in `_redirects` and `_headers`
(`.htaccess` holds the same settings for cPanel).

## Previewing locally

The scripts are ES modules, so open the site through a local server, not by double-clicking:

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Features

- **Logo intro** (home page, `assets/js/intro.js`) — plays `logo-video.mp4` once per visit
  session, then lifts away. Skipped automatically if the video is slow to load (1.5 s), capped at
  5 s, skippable, and not shown with reduced-motion or data-saver settings. The video address is
  `media.introVideo` in `src/site.json`. To turn the intro off, remove `intro: yes` from
  `src/pages/index.html` and rebuild.
- **Live page-top scenes** (`assets/js/hero.js`, markup `<header class="fx-hero" data-fx="…">`):
  `smoke` (Products, 404 — the visitor's cursor is an exhaust hood that captures smoke, with a
  live counter), `sparks` (About — the cursor becomes a welding torch), and `flow` with
  `data-variant="stream|radial|converge"` (Services, Projects, Contact — gold airflow the cursor
  bends like a fan). Canvas 2D, no libraries; pauses off-screen and in background tabs, lighter on
  low-power phones, a still frame for reduced-motion users. To use one on another page, copy a
  header block from `src/pages/products.html` and add `hero` to the page's `scripts:` line.
- **Installations map** (top of the Projects page; `tools/atlas.py` + `assets/js/atlas.js`) — a
  full-screen, street-level map of India in black and gold, with a floating panel (stats, search,
  filters, project list and details), clustered pins and animated lines from the Peenya factory.
  Built from each project's City / Area / Type fields; appears once 3+ projects have a city.
  Preview with sample data: `map-preview.html` (hidden, not indexed).
  - Engine: MapLibre GL JS, self-hosted in `assets/vendor/` (see its README for versions).
  - Street data: OpenFreeMap vector tiles (data only, no code). Only India is shown: other
    countries are darkened by `assets/data/india-mask.geojson` and India's official boundary
    (`assets/data/india-outline.geojson`) is drawn in gold; street-map border lines aren't drawn.
  - If the tile server is unreachable, the map falls back to India, city names and all pins.
  - Map data files are regenerated from their public sources with `tools/make_map_data.py`.
- **Airflow estimator** (home page, `assets/js/estimator.js`) — rules-based first estimate of
  exhaust CFM, duct size, filters, fresh air and blower motor, with a live hood schematic.
  Rates and constants are at the top of the file.
- **Ask Gilli assistant** (`assets/js/assistant.js`) — answers from the product data on this site.
  Visitors who type a phone number or email can send the chat to the team in one tap.
- **Optional AI mode** — deploy `worker/ai-proxy.js` as a Cloudflare Worker (instructions inside),
  then set `"aiEndpoint"` in `src/site.json`. The API key stays in the worker, never in the site.
- **WhatsApp button** (floating, above Ask Gilli) — opens WhatsApp with a message that matches
  the page: the product being viewed, the visitor's airflow estimate, or the service section.
  Messages start with "(via website)" so you can tell where leads came from. Wording is in
  `whatsappMessage()` in `assets/js/main.js`; the number is `whatsapp` in `src/site.json`.
- **Enquiry forms** — delivered by Web3Forms (key in `src/site.json`), with inline validation,
  a spam honeypot and on-page confirmation.

## Security

Every page is served with a **Content-Security-Policy** that only lets the browser run this
site's own scripts and contact the services the site uses (Web3Forms, OpenFreeMap map data,
ImageKit, Google Fonts, the Google Maps embed on the contact page, and the product image hosts).
Injected scripts, outside scripts and data sent to unknown servers are blocked by the browser.

- The policy is generated by `tools/build.py` and written into both `_headers` (Cloudflare)
  and `.htaccess` (cPanel). Product image hosts are picked up from `assets/js/data.js`
  automatically, and the AI endpoint from `src/site.json`.
- **Adding a new outside service** (a YouTube embed, an analytics tag, a chat widget…)?
  Add its address to `write_security_policy()` in `tools/build.py` and rebuild, or the
  browser will block it.
- Don't put `<script>` code directly inside pages or `onclick=` attributes — put it in a
  file under `assets/js/`. The only inline script (the intro check on the home page) is
  approved by its SHA-256 fingerprint, recalculated on every build.
- `/admin/` is exempt, because the content manager loads its editor from unpkg and talks to GitHub.
- Third-party code is never loaded from a CDN on public pages: MapLibre and the map fonts are
  copies in `assets/vendor/`, pinned to versions that had been public for at least two weeks.

## Before going live — please confirm

Values marked `CONFIRM` in `src/site.json`: installations count, opening hours, warranty terms,
and which number is on WhatsApp. Also replace the six hot-linked product photos in
`assets/js/data.js` with your own, and only keep certification claims you actually hold.
