# Third-party files hosted on this site

These are copies, served from this website, so no outside server can change the code
visitors run. Update them deliberately, never by linking to a CDN.

| Folder | What | Version / source | Licence |
|---|---|---|---|
| `maplibre-6.16.0/` | MapLibre GL JS map engine | npm `maplibre-gl@6.16.0` (published 2026-10-25) | BSD-3-Clause (`LICENSE.txt`) |
| `glyphs/` (noto-regular, noto-bold, noto-italic) | Noto Sans label fonts in MapLibre format (Latin ranges only) | github.com/maplibre/demotiles, commit `601ae60` | Fonts: SIL Open Font License; packaging: BSD-3-Clause |

Map *data* (roads, places) is loaded at runtime from OpenFreeMap (`tiles.openfreemap.org`),
which serves data only — no code. The site's Content-Security-Policy allows that one host
for map data and nothing else.
