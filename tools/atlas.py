"""
Installations map ("From Peenya to your kitchen") — build-time part.

Turns projects (with city / area fields) into the full-screen map section: a floating
panel with stats, search, filters and a project list (plain HTML, works without
JavaScript), plus the data that assets/js/atlas.js draws on a MapLibre map.

Pure Python, no extra packages. Called by tools/build.py.
"""
import html
import json
import math
from pathlib import Path

e = html.escape
ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src/content"

FACTORY = (13.030, 77.520)          # Peenya Industrial Area
BLR = (12.972, 77.594)              # Bengaluru centre
REGION_KM = 45                      # no factory arc for projects this close to Peenya
MIN_PROJECTS = 3                    # the map stays hidden until this many have a location

TYPES = {
    "restaurant": "Restaurants",
    "hotel": "Hotels",
    "hospital": "Hospitals",
    "institution": "Institutions",
    "club": "Clubs",
    "industrial": "Bulk kitchens",
    "other": "Other",
}


def km(a, b):
    (la1, lo1), (la2, lo2) = a, b
    x = math.radians(lo2 - lo1) * math.cos(math.radians((la1 + la2) / 2))
    return 6371 * math.hypot(x, math.radians(la2 - la1))


def load_places():
    return json.loads((CONTENT / "places.json").read_text(encoding="utf-8"))


def locate(project, places):
    """(lat, lng, city, area) for a project, or None if it has no known location."""
    city = (project.get("city") or "").strip()
    area = (project.get("area") or "").strip()
    if not city or city not in places["cities"]:
        return None
    lat, lng = places["cities"][city]
    if city == "Bengaluru" and area in places["bengaluru_areas"]:
        lat, lng = places["bengaluru_areas"][area]
    else:
        area = ""
    return lat, lng, city, area


def poster_svg():
    """Small gold outline of India shown while the map loads (and if WebGL is unavailable)."""
    rings = json.loads((CONTENT / "india.json").read_text(encoding="utf-8"))["rings"]
    k, c = 9.0, math.cos(math.radians(23))
    pt = lambda x, y: ((x - 67.5) * k * c, (37.6 - y) * k)
    d = " ".join("M" + " L".join(f"{pt(x, y)[0]:.1f},{pt(x, y)[1]:.1f}" for x, y in r) + "Z"
                 for r in rings if len(r) > 12)
    return (f'<svg viewBox="0 -4 {(98 - 67.5) * k * c:.0f} {(37.6 - 6) * k + 8:.0f}" aria-hidden="true">'
            f'<path d="{d}"/></svg>')


def cities_geojson():
    """All cities in places.json as points — labels for the offline fallback map."""
    places = load_places()
    feats = [{"type": "Feature", "properties": {"name": n}, "geometry": {"type": "Point", "coordinates": [lng, lat]}}
             for n, (lat, lng) in places["cities"].items()]
    return {"type": "FeatureCollection", "features": feats}


def render(projects, products, image, site, sample=False):
    """Full map section HTML, or "" if fewer than MIN_PROJECTS have a location."""
    places = load_places()
    located = []
    for i, p in enumerate(projects):
        loc = locate(p, places)
        if not loc or not p.get("name"):
            continue
        lat, lng, city, area = loc
        located.append({
            "id": f"p{i}",
            "name": p["name"],
            "city": city,
            "area": area,
            "lat": lat,
            "lng": lng,
            "type": p.get("type") if p.get("type") in TYPES else "other",
            "year": p.get("year") or "",
            "products": [
                {"name": products[s]["name"], "url": f"product-detail.html?id={products[s]['id']}"}
                for s in (p.get("products") or []) if s in products
            ],
            "thumb": image(p["photo"], "thumb") if p.get("photo") else "",
            "full": image(p["photo"], "full") if p.get("photo") else "",
            "maplink": (
                "https://www.google.com/maps/search/?api=1&query="
                + "+".join((p["name"] + " " + (area + " " if area else "") + city).split())
            ) if p.get("map_link") else "",
            "arc": km((lat, lng), FACTORY) > REGION_KM,
        })
    if len(located) < MIN_PROJECTS:
        return ""

    # Spread projects that share exactly the same point (same city, no area) on a small
    # circle, so each pin can be tapped when zoomed right in.
    by_point = {}
    for p in located:
        by_point.setdefault((p["lat"], p["lng"]), []).append(p)
    for (lat, lng), group in by_point.items():
        if len(group) > 1:
            for j, p in enumerate(group):
                a = 2 * math.pi * j / len(group)
                p["lat"] = round(lat + 0.0035 * math.sin(a), 5)
                p["lng"] = round(lng + 0.0035 * math.cos(a) / math.cos(math.radians(lat)), 5)

    types_present = {}
    for p in located:
        types_present[p["type"]] = types_present.get(p["type"], 0) + 1
    chips = '<button class="atlas-chip" type="button" data-type="all" aria-pressed="true">All</button>' + "".join(
        f'<button class="atlas-chip" type="button" data-type="{k}" aria-pressed="false">{e(TYPES[k])}'
        f' <span>{types_present[k]}</span></button>'
        for k in TYPES if k in types_present
    )
    items = "".join(
        f'<li><button class="atlas-item" type="button" data-id="{p["id"]}">'
        + (f'<img src="{e(p["thumb"])}" alt="" loading="lazy" width="56" height="42">' if p["thumb"] else '<span class="atlas-item__ph"></span>')
        + f'<span class="atlas-item__txt"><strong>{e(p["name"])}</strong>'
        f'<span>{e((p["area"] + ", " if p["area"] else "") + p["city"])} · {e(TYPES[p["type"]])}</span></span></button></li>'
        for p in located
    )
    cities = sorted({p["city"] for p in located})
    data = {
        "projects": located,
        "types": TYPES,
        "factory": {"lat": FACTORY[0], "lng": FACTORY[1], "name": "Gilli Solutions factory",
                    "address": site["address"], "directions": site["mapsLink"]},
        "sample": sample,
    }
    banner = ('<p class="atlas-sample" role="note"><strong>Preview with sample locations.</strong> '
              'Cities and areas here are placeholders.</p>') if sample else ""

    return f'''
<section class="atlas" id="map" aria-labelledby="atlas-title">
  <div class="atlas__map" id="atlas-map" role="region" aria-label="Interactive map of installations across India">
    <div class="atlas__poster">{poster_svg()}<p>Loading the map…</p></div>
  </div>
  <aside class="atlas__panel" aria-label="Installations">
    <button class="atlas__handle" type="button" aria-expanded="false" aria-label="Expand the list"><span></span></button>
    <div class="atlas__head">
      {banner}
      <p class="atlas__eyebrow">Installations</p>
      <h2 id="atlas-title">From Peenya to your kitchen.</h2>
      <dl class="atlas__stats">
        <div><dt>Kitchens</dt><dd data-stat="kitchens">{len(located)}</dd></div>
        <div><dt>Cities</dt><dd data-stat="cities">{len(cities)}</dd></div>
        <div><dt>Since</dt><dd>{site["founded"]}</dd></div>
      </dl>
    </div>
    <div class="atlas__tools">
      <label class="atlas-search">
        <span class="sr-only">Search a client or city</span>
        <svg class="icon" aria-hidden="true"><use href="#i-search"/></svg>
        <input type="search" placeholder="Search a client or city" autocomplete="off" data-search>
      </label>
      <div class="atlas-chips" role="group" aria-label="Filter by kitchen type">{chips}</div>
    </div>
    <div class="atlas__body">
      <ul class="atlas__list" data-list>{items}</ul>
      <p class="atlas__empty" data-empty hidden>No installations match. Try another name or city.</p>
      <article class="atlas__detail" data-detail hidden></article>
    </div>
  </aside>
  <script type="application/json" id="atlas-data">{json.dumps(data, ensure_ascii=False).replace("</", "<\\/")}</script>
</section>'''
