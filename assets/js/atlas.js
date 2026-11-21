/**
 * Installations map — a full-screen, Google-Maps-style map of India in black and gold.
 *
 * Engine:   MapLibre GL JS, self-hosted in assets/vendor (no CDN).
 * Map data: OpenFreeMap vector tiles (data only, no code), restyled here.
 * Only India: neighbouring countries are darkened and India's official boundary
 * (assets/data/india-outline.geojson) is drawn in gold. Street-map border layers are
 * not drawn at all.
 * Fallback: if the tile server can't be reached, the map still shows India, city names
 * and every installation, from files on this site.
 *
 * Markup and data come from tools/atlas.py.
 */
const section = document.getElementById('map');
const dataEl = document.getElementById('atlas-data');

const TILES = 'https://tiles.openfreemap.org/planet';
const VENDOR = 'assets/vendor/maplibre-6.16.0/';
const INDIA_BOUNDS = [[68.0, 6.5], [97.5, 37.2]];
const GOLD = '#f2b705';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const abs = (path) => new URL(path, document.baseURI).href;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Map style: black & gold, built on the OpenMapTiles schema ---------- */
function buildStyle() {
  // Brace placeholders must stay literal, so build this URL by hand rather than with new URL().
  const glyphs = abs('assets/vendor/glyphs/') + '{fontstack}/{range}.pbf';
  const name = ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']];
  const line = (geom) => ['match', ['geometry-type'], geom, true, false];
  const cls = (...c) => ['match', ['get', 'class'], c, true, false];
  const w = (pairs) => ['interpolate', ['exponential', 1.5], ['zoom'], ...pairs];
  return {
    version: 8,
    glyphs,
    sources: {
      omt: { type: 'vector', url: TILES },
      india: { type: 'geojson', data: abs('assets/data/india-outline.geojson') },
      mask: { type: 'geojson', data: abs('assets/data/india-mask.geojson') },
      cities: { type: 'geojson', data: abs('assets/data/cities.geojson') },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#05080b' } },
      // India's land — the street map paints water over it.
      { id: 'india-land', type: 'fill', source: 'india', paint: { 'fill-color': '#111a21' } },
      { id: 'landuse', type: 'fill', source: 'omt', 'source-layer': 'landuse', minzoom: 9,
        filter: cls('residential', 'suburb', 'neighbourhood', 'commercial', 'industrial'),
        paint: { 'fill-color': '#141f27', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 9, 0, 11, 0.9] } },
      { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', minzoom: 8,
        paint: { 'fill-color': '#0f1d17', 'fill-opacity': 0.8 } },
      { id: 'wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: cls('wood', 'forest'),
        paint: { 'fill-color': '#0f1b16', 'fill-opacity': 0.55 } },
      { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#0a1620' } },
      { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 6,
        paint: { 'line-color': '#0d1d29', 'line-width': w([6, 0.5, 14, 3]) } },
      { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14,
        paint: { 'fill-color': '#18222b', 'fill-outline-color': '#1f2b35', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1] } },
      { id: 'aeroway', type: 'line', source: 'omt', 'source-layer': 'aeroway', minzoom: 11, filter: cls('runway', 'taxiway'),
        paint: { 'line-color': '#1c2731', 'line-width': w([11, 1, 16, 14]) } },
      { id: 'road-minor', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 12,
        filter: ['all', line(['LineString', 'MultiLineString']), cls('minor', 'service', 'track')],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#1b262f', 'line-width': w([12, 0.5, 18, 12]) } },
      { id: 'rail', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 9,
        filter: ['all', line(['LineString', 'MultiLineString']), cls('rail', 'transit')],
        paint: { 'line-color': '#26323c', 'line-width': w([9, 0.6, 16, 2]), 'line-dasharray': [3, 3] } },
      { id: 'road-major', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 7,
        filter: ['all', line(['LineString', 'MultiLineString']), cls('primary', 'secondary', 'tertiary')],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#26333e', 'line-width': w([7, 0.4, 12, 1.6, 18, 18]) } },
      // Highways glow in muted gold — the signature of the style.
      { id: 'road-trunk', type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 5,
        filter: ['all', line(['LineString', 'MultiLineString']), cls('motorway', 'trunk')],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ['interpolate', ['linear'], ['zoom'], 5, '#3a3112', 9, '#6b5617', 13, '#8a6f1d'],
          'line-width': w([5, 0.4, 9, 1.2, 13, 3, 18, 22]) } },
      { id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 13,
        layout: { 'symbol-placement': 'line', 'text-field': name, 'text-font': ['noto-regular'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 17, 13] },
        paint: { 'text-color': '#7d8e9a', 'text-halo-color': '#05080b', 'text-halo-width': 1.4 } },
      { id: 'water-label', type: 'symbol', source: 'omt', 'source-layer': 'water_name', minzoom: 5,
        filter: line(['Point', 'MultiPoint']),
        layout: { 'text-field': name, 'text-font': ['noto-italic'], 'text-size': 12, 'text-letter-spacing': 0.1 },
        paint: { 'text-color': '#3e6072', 'text-halo-color': '#05080b', 'text-halo-width': 1 } },
      { id: 'place-minor', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 11,
        filter: cls('suburb', 'neighbourhood', 'quarter', 'village', 'hamlet'),
        layout: { 'text-field': name, 'text-font': ['noto-regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 11, 10, 16, 13], 'text-max-width': 8 },
        paint: { 'text-color': '#8191a0', 'text-halo-color': '#05080b', 'text-halo-width': 1.2 } },
      { id: 'place-town', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 7, filter: cls('town'),
        layout: { 'text-field': name, 'text-font': ['noto-regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 12, 14] },
        paint: { 'text-color': '#a9b6c0', 'text-halo-color': '#05080b', 'text-halo-width': 1.3 } },
      { id: 'place-city', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 4, filter: cls('city'),
        layout: { 'text-field': name, 'text-font': ['noto-bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 8, 14, 12, 19] },
        paint: { 'text-color': '#e4eaef', 'text-halo-color': '#05080b', 'text-halo-width': 1.5 } },
      { id: 'place-state', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 4.5, maxzoom: 7.5, filter: cls('state'),
        layout: { 'text-field': ['upcase', name], 'text-font': ['noto-regular'], 'text-size': 10.5, 'text-letter-spacing': 0.25, 'text-max-width': 7 },
        paint: { 'text-color': '#6f6236', 'text-halo-color': '#05080b', 'text-halo-width': 1 } },
      // Fallback labels (shown only if the street map can't load)
      { id: 'fallback-city', type: 'symbol', source: 'cities', layout: { visibility: 'none', 'text-field': ['get', 'name'],
        'text-font': ['noto-regular'], 'text-size': 11 }, paint: { 'text-color': '#8a9aa6', 'text-halo-color': '#05080b', 'text-halo-width': 1.2 } },
      // Only India: everything outside the official boundary is darkened.
      { id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': '#030507', 'fill-opacity': 0.94 } },
      { id: 'india-glow', type: 'line', source: 'india', paint: { 'line-color': GOLD, 'line-opacity': 0.18, 'line-width': w([3, 4, 10, 10]), 'line-blur': 4 } },
      { id: 'india-line', type: 'line', source: 'india', paint: { 'line-color': GOLD, 'line-opacity': 0.85, 'line-width': w([3, 0.7, 10, 1.6]) } },
    ],
  };
}

/* ---------- Geometry helpers ---------------------------------------------------- */
function arc(a, b) {
  // Gentle curve from the factory to a city, bowed sideways.
  const [x1, y1] = a; const [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  const cx = (x1 + x2) / 2 - (dy / L) * L * 0.25, cy = (y1 + y2) / 2 + (dx / L) * L * 0.25;
  const pts = [];
  for (let i = 0; i <= 48; i++) {
    const t = i / 48;
    pts.push([(1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2]);
  }
  return pts;
}

/* ---------- Main ------------------------------------------------------------------ */
async function start() {
  const data = JSON.parse(dataEl.textContent);
  const byId = Object.fromEntries(data.projects.map((p) => [p.id, p]));
  const mapEl = document.getElementById('atlas-map');
  const panel = section.querySelector('.atlas__panel');
  const list = section.querySelector('[data-list]');
  const detail = section.querySelector('[data-detail]');
  const empty = section.querySelector('[data-empty]');
  const search = section.querySelector('[data-search]');
  const handle = section.querySelector('.atlas__handle');
  const factoryLL = [data.factory.lng, data.factory.lat];
  let filterType = 'all';
  let query = '';
  let selected = null;
  let listScroll = 0;
  const body = section.querySelector('.atlas__body');

  const isMobile = () => matchMedia('(max-width: 899px)').matches;
  const matches = (p) =>
    (filterType === 'all' || p.type === filterType) &&
    (!query || `${p.name} ${p.city} ${p.area}`.toLowerCase().includes(query));
  const shown = () => data.projects.filter(matches);

  /* Panel: list, stats, detail (work even if the map can't start) */
  function refreshList() {
    const ids = new Set(shown().map((p) => p.id));
    list.querySelectorAll('[data-id]').forEach((b) => { b.parentElement.hidden = !ids.has(b.dataset.id); });
    empty.hidden = ids.size > 0;
    section.querySelector('[data-stat="kitchens"]').textContent = ids.size;
    section.querySelector('[data-stat="cities"]').textContent = new Set(shown().map((p) => p.city)).size;
  }

  function openDetail(p) {
    const where = (p.area ? `${p.area}, ` : '') + p.city;
    const products = p.products.length
      ? `<div class="atlas-tags">${p.products.map((x) => `<a href="${esc(x.url)}">${esc(x.name)}</a>`).join('')}</div>` : '';
    const quote = `contact.html?product=${encodeURIComponent(`a system like ${p.name}`)}#enquiry`;
    detail.innerHTML = `
      <button class="atlas-back" type="button" data-back>← All installations</button>
      ${p.full ? `<button class="atlas-photo" type="button" data-photo="${esc(p.full)}" aria-label="View photo of ${esc(p.name)}"><img src="${esc(p.thumb)}" alt=""></button>` : ''}
      ${data.sample ? '<span class="atlas-flag">Sample location</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <p class="atlas-meta">${esc(where)}<br>${esc(data.types[p.type] || 'Kitchen')}${p.year ? ` · installed ${esc(p.year)}` : ''}</p>
      ${products ? `<p class="atlas-label">Installed</p>${products}` : ''}
      <div class="atlas-actions">
        <a class="btn" href="${esc(quote)}">Request a similar system</a>
        ${p.maplink ? `<a class="btn btn--outline-light" href="${esc(p.maplink)}" target="_blank" rel="noopener">Open in Google Maps</a>` : ''}
      </div>`;
    if (detail.hidden) listScroll = body.scrollTop;
    list.hidden = true; empty.hidden = true; detail.hidden = false;
    section.querySelector('.atlas__tools').hidden = true;
    panel.classList.add('has-detail');
    body.scrollTop = 0;
    if (isMobile()) setSheet(true);
    detail.querySelector('[data-back]').focus({ preventScroll: true });
  }

  function openFactory() {
    detail.innerHTML = `
      <button class="atlas-back" type="button" data-back>← All installations</button>
      <div class="atlas-factory" aria-hidden="true"><span></span></div>
      <h3>${esc(data.factory.name)}</h3>
      <p class="atlas-meta">${esc(data.factory.address)}</p>
      <p class="atlas-meta">Every hood, duct and blower on this map was cut, folded and welded here.</p>
      <div class="atlas-actions"><a class="btn" href="${esc(data.factory.directions)}" target="_blank" rel="noopener">Get directions</a></div>`;
    if (detail.hidden) listScroll = body.scrollTop;
    body.scrollTop = 0;
    list.hidden = true; empty.hidden = true; detail.hidden = false;
    section.querySelector('.atlas__tools').hidden = true;
    panel.classList.add('has-detail');
    if (isMobile()) setSheet(true);
  }

  function closeDetail() {
    detail.hidden = true; list.hidden = false;
    section.querySelector('.atlas__tools').hidden = false;
    panel.classList.remove('has-detail');
    refreshList();
    body.scrollTop = listScroll;
    selected = null;
    map?.getSource('selected')?.setData({ type: 'FeatureCollection', features: [] });
  }

  function setSheet(open) {
    panel.classList.toggle('is-open', open);
    handle.setAttribute('aria-expanded', String(open));
    handle.setAttribute('aria-label', open ? 'Collapse the list' : 'Expand the list');
  }
  handle.addEventListener('click', () => setSheet(!panel.classList.contains('is-open')));

  /* ---------- Map ---------- */
  let map = null;
  let maplibregl;
  try {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = abs(VENDOR + 'maplibre-gl.css');
    document.head.appendChild(link);
    maplibregl = await import(abs(VENDOR + 'maplibre-gl.mjs'));
    map = new maplibregl.Map({
      container: mapEl,
      style: buildStyle(),
      bounds: INDIA_BOUNDS,
      fitBoundsOptions: { padding: framePadding() },
      // Wide enough for any screen shape, so the whole of India always fits (the mask darkens the rest).
      maxBounds: [[10, -25], [145, 55]],
      minZoom: 3,
      maxZoom: 17.5,
      attributionControl: false,
      cooperativeGestures: true,
      dragRotate: false,
      pitchWithRotate: false,
      renderWorldCopies: false,
    });
  } catch (err) {
    console.warn('Interactive map unavailable', err);
    mapEl.querySelector('.atlas__poster p').textContent = 'The interactive map isn’t available on this device — the list has every installation.';
    wirePanel();
    refreshList();
    return;
  }

  function framePadding() {
    if (isMobile()) return { top: 70, bottom: Math.round(mapEl.clientHeight * 0.42), left: 20, right: 20 };
    return { top: 40, bottom: 40, left: Math.round(panel.getBoundingClientRect().width + 56), right: 70 };
  }

  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    customAttribution: 'Boundary: <a href="https://github.com/datameet/maps" target="_blank" rel="noopener">DataMeet</a> · Places: <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a>',
  }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new maplibregl.FullscreenControl({ container: section }), 'top-right');
  // "Show all of India" button
  map.addControl({
    onAdd() {
      const div = document.createElement('div');
      div.className = 'maplibregl-ctrl maplibregl-ctrl-group';
      div.innerHTML = '<button type="button" class="atlas-fit" aria-label="Show all of India" title="Show all of India"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>';
      div.querySelector('button').addEventListener('click', () => map.fitBounds(INDIA_BOUNDS, { padding: framePadding(), duration: reduceMotion ? 0 : 900 }));
      return div;
    },
    onRemove() {},
  }, 'top-right');

  // Fallback: if no street-map tile arrives in time, show the built-in labels instead.
  let tilesOk = false;
  const useFallback = () => {
    if (tilesOk || !map.getLayer('fallback-city')) return;
    map.setLayoutProperty('fallback-city', 'visibility', 'visible');
    section.classList.add('is-fallback');
  };
  map.on('sourcedata', (e) => { if (e.sourceId === 'omt' && e.isSourceLoaded && e.tile) tilesOk = true; });
  map.on('error', (e) => { if (e.sourceId === 'omt' || /openfreemap/.test(e.error?.url || e.error?.message || '')) useFallback(); });
  setTimeout(useFallback, 8000);

  map.on('load', () => {
    mapEl.querySelector('.atlas__poster')?.classList.add('is-gone');
    section.dataset.ready = 'true';

    // Arcs from the factory
    const arcs = data.projects.filter((p) => p.arc).map((p) => ({
      type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: arc(factoryLL, [p.lng, p.lat]) },
    }));
    map.addSource('arcs', { type: 'geojson', data: { type: 'FeatureCollection', features: arcs } });
    map.addLayer({ id: 'arcs-base', type: 'line', source: 'arcs', paint: { 'line-color': GOLD, 'line-opacity': 0.14, 'line-width': 3 } });
    map.addLayer({ id: 'arcs', type: 'line', source: 'arcs', layout: { 'line-cap': 'round' },
      paint: { 'line-color': GOLD, 'line-opacity': 0.8, 'line-width': 1.6, 'line-dasharray': [0, 4, 3] } });

    // Installations, clustered like Google Maps
    map.addSource('projects', { type: 'geojson', data: features(), cluster: true, clusterRadius: 42, clusterMaxZoom: 13 });
    map.addLayer({ id: 'cl-halo', type: 'circle', source: 'projects', filter: ['has', 'point_count'],
      paint: { 'circle-color': GOLD, 'circle-opacity': 0.16, 'circle-radius': ['step', ['get', 'point_count'], 24, 5, 30, 15, 38] } });
    map.addLayer({ id: 'cl', type: 'circle', source: 'projects', filter: ['has', 'point_count'],
      paint: { 'circle-color': GOLD, 'circle-radius': ['step', ['get', 'point_count'], 15, 5, 19, 15, 24],
        'circle-stroke-color': '#05080b', 'circle-stroke-width': 2 } });
    map.addLayer({ id: 'cl-count', type: 'symbol', source: 'projects', filter: ['has', 'point_count'],
      layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['noto-bold'], 'text-size': 13, 'text-allow-overlap': true },
      paint: { 'text-color': '#05080b' } });
    map.addLayer({ id: 'pt-halo', type: 'circle', source: 'projects', filter: ['!', ['has', 'point_count']],
      paint: { 'circle-color': GOLD, 'circle-opacity': 0.2, 'circle-radius': 13, 'circle-blur': 0.4 } });
    map.addLayer({ id: 'pt', type: 'circle', source: 'projects', filter: ['!', ['has', 'point_count']],
      paint: { 'circle-color': GOLD, 'circle-radius': 6.5, 'circle-stroke-color': '#05080b', 'circle-stroke-width': 2.5 } });
    map.addLayer({ id: 'pt-label', type: 'symbol', source: 'projects', filter: ['!', ['has', 'point_count']], minzoom: 9,
      layout: { 'text-field': ['get', 'name'], 'text-font': ['noto-bold'], 'text-size': 12, 'text-offset': [0, 1.4], 'text-anchor': 'top', 'text-max-width': 10 },
      paint: { 'text-color': '#f5d77a', 'text-halo-color': '#05080b', 'text-halo-width': 1.6 } });
    map.addSource('selected', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.addLayer({ id: 'sel', type: 'circle', source: 'selected',
      paint: { 'circle-color': '#ffffff', 'circle-radius': 8, 'circle-stroke-color': GOLD, 'circle-stroke-width': 4 } });

    // Factory: drawn into the map under the clusters, so it never hides a count.
    const sq = 44, img = new Uint8Array(sq * sq * 4);
    for (let y = 0; y < sq; y++) for (let x = 0; x < sq; x++) {
      const i = (y * sq + x) * 4, edge = Math.min(x, y, sq - 1 - x, sq - 1 - y);
      const [r, g, b, a] = edge < 7 ? [242, 183, 5, 255] : [255, 255, 255, 255];
      img.set([r, g, b, a], i);
    }
    map.addImage('factory', { width: sq, height: sq, data: img }, { pixelRatio: 2 });
    map.addSource('factory', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: factoryLL } } });
    map.addLayer({ id: 'factory-glow', type: 'circle', source: 'factory',
      paint: { 'circle-color': GOLD, 'circle-opacity': 0.18, 'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 12, 12, 26], 'circle-blur': 0.5 } }, 'cl-halo');
    map.addLayer({ id: 'factory', type: 'symbol', source: 'factory',
      layout: { 'icon-image': 'factory', 'icon-allow-overlap': true, 'icon-ignore-placement': true,
        'text-field': 'Our factory · Peenya', 'text-font': ['noto-bold'], 'text-size': 12, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-optional': true },
      paint: { 'text-color': '#f5d77a', 'text-halo-color': '#05080b', 'text-halo-width': 1.6, 'text-opacity': ['step', ['zoom'], 0, 8, 1] } }, 'cl-halo');

    // Interactions
    const hover = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14, className: 'atlas-pop' });
    ['pt', 'cl', 'factory'].forEach((id) => {
      map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; hover.remove(); });
    });
    map.on('mousemove', 'pt', (ev) => {
      const p = byId[ev.features[0].properties.id];
      hover.setLngLat([p.lng, p.lat]).setHTML(`<strong>${esc(p.name)}</strong><span>${esc((p.area ? p.area + ', ' : '') + p.city)}</span>`).addTo(map);
    });
    map.on('click', 'cl', async (ev) => {
      const f = ev.features[0];
      const zoom = await map.getSource('projects').getClusterExpansionZoom(f.properties.cluster_id);
      map.easeTo({ center: f.geometry.coordinates, zoom: zoom + 0.2, padding: framePadding(), duration: reduceMotion ? 0 : 700 });
    });
    map.on('click', 'pt', (ev) => select(byId[ev.features[0].properties.id], false));
    map.on('click', 'factory', (ev) => {
      // Clusters sit above the factory; let a click on a cluster win.
      if (map.queryRenderedFeatures(ev.point, { layers: ['cl'] }).length) return;
      openFactory();
      map.flyTo({ center: factoryLL, zoom: Math.max(map.getZoom(), 12), padding: framePadding(), essential: false });
    });

    animateArcs();
  });

  function features() {
    return {
      type: 'FeatureCollection',
      features: shown().map((p) => ({ type: 'Feature', properties: { id: p.id, name: p.name }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })),
    };
  }

  function select(p, fly = true) {
    if (!p) return;
    selected = p;
    openDetail(p);
    map.getSource('selected')?.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } }] });
    if (fly || map.getZoom() < 12) {
      map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(map.getZoom(), 13.5), padding: framePadding(), speed: 1.4, essential: false });
    }
  }

  function applyFilters() {
    refreshList();
    map?.getSource('projects')?.setData(features());
  }

  function animateArcs() {
    if (reduceMotion) { map.setPaintProperty('arcs', 'line-dasharray', [3, 2]); return; }
    // Marching dashes: step through a dash sequence (MapLibre's recommended technique).
    const seq = [[0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0],
      [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]];
    let step = -1;
    let onScreen = true;
    // Only animate while the map is visible — no redraws (and no battery use) once scrolled past.
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(section);
    const tick = (t) => {
      const s = Math.floor((t / 90) % seq.length);
      if (onScreen && !document.hidden && s !== step && map.getLayer('arcs')) {
        map.setPaintProperty('arcs', 'line-dasharray', seq[s]);
        step = s;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function wirePanel() {
    list.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (!b) return;
      if (map) select(byId[b.dataset.id]); else openDetail(byId[b.dataset.id]);
    });
    detail.addEventListener('click', (e) => {
      if (e.target.closest('[data-back]')) { closeDetail(); return; }
      const ph = e.target.closest('[data-photo]');
      if (ph) {
        const match = [...document.querySelectorAll('.gallery [data-lightbox]')].find((x) => x.dataset.full === ph.dataset.photo);
        if (match) match.click(); else window.open(ph.dataset.photo, '_blank', 'noopener');
      }
    });
    section.querySelectorAll('.atlas-chip').forEach((chip) => chip.addEventListener('click', () => {
      filterType = chip.dataset.type;
      section.querySelectorAll('.atlas-chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      applyFilters();
    }));
    search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); applyFilters(); });
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !map) return;
      const hits = shown();
      if (hits.length === 1) select(hits[0]);
      else if (hits.length > 1) {
        const lngs = hits.map((p) => p.lng), lats = hits.map((p) => p.lat);
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: framePadding(), maxZoom: 12.5, duration: reduceMotion ? 0 : 900 });
      }
    });
    section.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !detail.hidden) closeDetail(); });
  }

  wirePanel();
  refreshList();
  window.addEventListener('resize', () => map?.resize());
}

if (section && dataEl) {
  // Load the map engine only when the visitor gets close to the map.
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { io.disconnect(); start(); }
  }, { rootMargin: '400px 0px' });
  io.observe(section);
}

// Exported so the style can be checked with MapLibre's style validator.
export { buildStyle };
