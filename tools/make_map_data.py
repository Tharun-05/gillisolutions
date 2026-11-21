#!/usr/bin/env python3
"""
One-off generator for the installations map data. You normally never need to run this —
its outputs are committed:

    src/content/india.json             simplified outline (used by the loading poster)
    src/content/places.json            cities (GeoNames) and Bengaluru areas with coordinates
    assets/data/india-outline.geojson  detailed official boundary, drawn in gold on the map
    assets/data/india-mask.geojson     everything outside India (+ ~3 km sea margin), darkened

To regenerate (needs internet):
    pip install shapely geonamescache
    python tools/make_map_data.py

Sources and licences
  India boundary: DataMeet "india-composite.geojson", released as CC-0 (public domain)
    https://github.com/datameet/maps/blob/master/Country/india-composite.geojson
    Follows the official boundary of India as per the Survey of India (includes Jammu &
    Kashmir, Ladakh, Gilgit-Baltistan, Aksai Chin, Lakshadweep, Andaman & Nicobar Islands).
  Cities: GeoNames (geonames.org), CC BY 4.0, via the geonamescache package.
  Bengaluru areas: approximate centres, hand-entered. Edit places.json to adjust.
"""
import json
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/content"
INDIA_URL = "https://raw.githubusercontent.com/datameet/maps/master/Country/india-composite.geojson"

# Approximate area centres (lat, lng). Good to ~1 km — fine for the stylised close-up.
BENGALURU_AREAS = {
    "Banashankari": (12.925, 77.546), "Banaswadi": (13.010, 77.648),
    "Bannerghatta Road": (12.888, 77.597), "Basavanagudi": (12.942, 77.575),
    "Bellandur": (12.926, 77.676), "BTM Layout": (12.916, 77.610),
    "Devanahalli": (13.247, 77.712), "Domlur": (12.961, 77.638),
    "Electronic City": (12.845, 77.660), "Frazer Town": (12.998, 77.615),
    "Hebbal": (13.035, 77.597), "Hennur": (13.035, 77.640),
    "Hoskote": (13.070, 77.798), "HSR Layout": (12.912, 77.644),
    "Indiranagar": (12.978, 77.640), "Jalahalli": (13.046, 77.548),
    "Jayanagar": (12.925, 77.593), "JP Nagar": (12.906, 77.585),
    "Kengeri": (12.912, 77.485), "Koramangala": (12.935, 77.624),
    "KR Puram": (13.007, 77.696), "Majestic": (12.977, 77.572),
    "Malleshwaram": (13.003, 77.570), "Marathahalli": (12.959, 77.697),
    "MG Road": (12.975, 77.606), "Nagarbhavi": (12.960, 77.510),
    "Peenya": (13.030, 77.520), "Rajajinagar": (12.991, 77.554),
    "Rajarajeshwari Nagar": (12.927, 77.519), "RT Nagar": (13.022, 77.595),
    "Sarjapur Road": (12.910, 77.685), "Shivajinagar": (12.986, 77.605),
    "Ulsoor": (12.982, 77.620), "Vijayanagar": (12.971, 77.537),
    "Whitefield": (12.970, 77.750), "Yelahanka": (13.100, 77.596),
    "Yeshwanthpur": (13.023, 77.550),
}


def plain(s):
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()


def _round(geom, nd=4):
    from shapely.geometry import mapping
    m = mapping(geom)

    def walk(x):
        return [round(x[0], nd), round(x[1], nd)] if isinstance(x[0], (int, float)) else [walk(y) for y in x]
    m["coordinates"] = walk(m["coordinates"])
    return m


def make_india():
    from shapely.geometry import box
    from shapely.geometry import shape
    from shapely.ops import unary_union
    with urllib.request.urlopen(INDIA_URL) as r:
        g = json.load(r)
    geom = unary_union([shape(f["geometry"]) for f in g["features"]])

    # Detailed outline (gold border line on the map)
    detail = geom.simplify(0.003, preserve_topology=True)
    parts = detail.geoms if detail.geom_type == "MultiPolygon" else [detail]
    detail = unary_union([p for p in parts if p.area > 0.00002])
    data = ROOT / "assets/data"
    data.mkdir(parents=True, exist_ok=True)
    fc = lambda gm, src: {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {"source": src}, "geometry": _round(gm)}]}
    (data / "india-outline.geojson").write_text(json.dumps(fc(detail, "DataMeet india-composite (CC0), simplified"), separators=(",", ":")))
    # Mask: a wide box minus India grown ~3 km into the sea, so it never clashes with the
    # street map's own coastline when zoomed in. The box matches the map's pan limits.
    grown = geom.buffer(0.03, resolution=4).simplify(0.008, preserve_topology=True)
    mask = box(5, -30, 150, 60).difference(grown)
    (data / "india-mask.geojson").write_text(json.dumps(fc(mask, "World minus India (official boundary + ~3 km sea margin)"), separators=(",", ":")))
    print("india-outline.geojson, india-mask.geojson written")
    rings = []
    for p in geom.geoms:
        # Mainland coarse; islands finer so Lakshadweep and Andaman & Nicobar survive.
        tol = 0.04 if p.area > 5 else (0.01 if p.area > 0.01 else 0.002)
        s = p.simplify(tol, preserve_topology=True)
        if s.is_empty or s.area < 0.00002 or len(s.exterior.coords) < 4:
            continue
        rings.append([(round(x, 3), round(y, 3)) for x, y in s.exterior.coords])
    (OUT / "india.json").write_text(json.dumps({
        "_source": "India boundaries by DataMeet India community (CC BY 4.0), simplified",
        "rings": rings,
    }, separators=(",", ":")))
    print(f"india.json: {len(rings)} rings")


def make_places():
    import geonamescache
    cities = {}
    for c in geonamescache.GeonamesCache().get_cities().values():
        if c["countrycode"] != "IN" or c["population"] < 100000:
            continue
        name = plain(c["name"]).strip()
        if name not in cities or c["population"] > cities[name][2]:
            cities[name] = (round(c["latitude"], 4), round(c["longitude"], 4), c["population"])
    (OUT / "places.json").write_text(json.dumps({
        "_source": "Cities: GeoNames (CC BY 4.0), population over 100,000. Areas: approximate.",
        "cities": {k: v[:2] for k, v in sorted(cities.items())},
        "bengaluru_areas": dict(sorted(BENGALURU_AREAS.items())),
    }, indent=1))
    print(f"places.json: {len(cities)} cities, {len(BENGALURU_AREAS)} Bengaluru areas")


if __name__ == "__main__":
    make_india()
    make_places()
