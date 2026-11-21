import { PRODUCTS, CATEGORIES, productUrl, findProduct } from './data.js';
import { initLightbox } from './main.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FALLBACK_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#eef1f3"/><text x="200" y="158" text-anchor="middle" font-family="Arial" font-size="16" fill="#52616c">Image coming soon</text></svg>'
);
// Swap broken product images for a placeholder (a listener, not an inline handler, so the
// site's Content-Security-Policy can forbid inline scripts).
const guardImages = (root) => root.querySelectorAll('img').forEach((img) =>
  img.addEventListener('error', () => { img.src = FALLBACK_IMG; }, { once: true }));

/* ---------- Listing ------------------------------------------------------ */
function initList() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  const chips = document.querySelectorAll('.chip[data-cat]');
  const search = document.getElementById('product-search');
  const count = document.getElementById('product-count');

  // Support new (#exhaust) and old (#Commercial_Kitchen_Ventilation_Systems) links.
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (CATEGORIES[h]) return h;
    const legacy = PRODUCTS.find((p) => p.legacy === h);
    return legacy ? legacy.category : 'all';
  };
  let cat = fromHash();
  let q = '';

  const card = (p) => `
    <li class="product-card">
      <div class="product-card__img"><img src="${esc(p.image)}" alt="" loading="lazy" decoding="async"></div>
      <div class="product-card__body">
        <span class="product-card__cat">${esc(CATEGORIES[p.category])}</span>
        <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
        <p>${esc(p.summary)}</p>
        <span class="product-card__more" aria-hidden="true">View specifications</span>
      </div>
    </li>`;

  const render = () => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = PRODUCTS.filter((p) => cat === 'all' || p.category === cat).filter((p) => {
      if (!terms.length) return true;
      const hay = [p.name, p.summary, p.description, ...p.keywords, ...p.specs.flat()].join(' ').toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === cat)));
    grid.innerHTML = list.length
      ? list.map(card).join('')
      : `<li class="empty"><p><strong>No products match “${esc(q)}”.</strong></p><p class="muted">Try “hood”, “blower” or “duct”, or ask our assistant to help you choose.</p></li>`;
    guardImages(grid);
    if (count) count.textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
  };

  chips.forEach((c) => c.addEventListener('click', () => {
    cat = c.dataset.cat;
    history.replaceState(null, '', cat === 'all' ? location.pathname : `#${cat}`);
    render();
  }));
  search?.addEventListener('input', () => { q = search.value.trim(); render(); });
  window.addEventListener('hashchange', () => { cat = fromHash(); render(); });
  render();
}

/* ---------- Detail ------------------------------------------------------- */
function initDetail() {
  const root = document.getElementById('product-detail');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const p = findProduct(params.get('id') || params.get('p'));

  if (!p) {
    root.innerHTML = `
      <div class="empty">
        <h2>We couldn't find that product</h2>
        <p class="muted">The link may be out of date.</p>
        <a class="btn" href="products.html">See all products</a>
      </div>`;
    document.title = 'Product not found | Gilli Solutions';
    return;
  }

  const i = PRODUCTS.indexOf(p);
  const n = PRODUCTS.length;
  // Wrap around so there is always a previous and a next product.
  const prev = PRODUCTS[(i - 1 + n) % n];
  const next = PRODUCTS[(i + 1) % n];

  document.title = `${p.name} | Gilli Solutions, Bengaluru`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', p.summary);
  const crumb = document.getElementById('crumb-current');
  if (crumb) crumb.textContent = p.name;

  // Previous / next: a compact control beside the breadcrumb (visible on every screen size)
  // and round arrows fixed at the screen edges on large screens.
  const arrow = (dir) => `<svg class="icon" aria-hidden="true"><use href="#i-${dir}"/></svg>`;
  document.getElementById('pd-stepper')?.remove();
  document.querySelectorAll('.pd-arrow').forEach((el) => el.remove());
  const stepper = document.createElement('nav');
  stepper.id = 'pd-stepper';
  stepper.className = 'pd-stepper';
  stepper.setAttribute('aria-label', 'Browse products');
  stepper.innerHTML = `
    <a href="${productUrl(prev)}" aria-label="Previous product: ${esc(prev.name)}" title="${esc(prev.name)}">${arrow('left')}</a>
    <span aria-current="page">${i + 1} / ${n}</span>
    <a href="${productUrl(next)}" aria-label="Next product: ${esc(next.name)}" title="${esc(next.name)}">${arrow('right')}</a>`;
  document.querySelector('.crumbs-row')?.appendChild(stepper);

  [['prev', prev, 'left', 'Previous'], ['next', next, 'right', 'Next']].forEach(([cls, item, dir, word]) => {
    const a = document.createElement('a');
    a.className = `pd-arrow pd-arrow--${cls}`;
    a.href = productUrl(item);
    a.setAttribute('aria-label', `${word} product: ${item.name}`);
    a.innerHTML = `${arrow(dir)}<span class="pd-arrow__label"><small>${word}</small>${esc(item.name)}</span>`;
    document.body.appendChild(a);
  });

  root.innerHTML = `
    <div class="pd">
      <div class="pd__media">
        <button type="button" data-lightbox="product" data-full="${esc(p.image)}" data-caption="${esc(p.name)}" aria-label="Enlarge image of ${esc(p.name)}">
          <img src="${esc(p.image)}" alt="${esc(p.name)}">
        </button>
      </div>
      <div>
        <p class="pd__cat"><a href="products.html#${p.category}">${esc(CATEGORIES[p.category])}</a></p>
        <h1>${esc(p.name)}</h1>
        <p class="lede">${esc(p.summary)}</p>
        <div class="btn-row">
          <a class="btn" href="#enquiry" data-quote>Request a quote</a>
          <button class="btn btn--ghost" type="button" data-ask="Which ${esc(p.name.toLowerCase())} do I need for my kitchen?">Ask the assistant</button>
        </div>
        <h2 class="sr-only">About this product</h2>
        <p style="margin-top:2rem">${esc(p.description)}</p>
        <h2 style="font-size:var(--step-2);margin-top:2rem">Specifications</h2>
        <table class="spec-table">
          <tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody>
        </table>
        <p class="muted">Every unit is fabricated to order in our Peenya factory, so sizes and gauges can be matched to your kitchen.</p>
        <nav class="pd-nav" aria-label="More products">
          <a class="prev" href="${productUrl(prev)}"><span>Previous</span><strong>${esc(prev.name)}</strong></a>
          <a class="next" href="${productUrl(next)}"><span>Next</span><strong>${esc(next.name)}</strong></a>
        </nav>
      </div>
    </div>`;

  guardImages(root);

  // JSON-LD for search engines
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.image,
    category: CATEGORIES[p.category],
    brand: { '@type': 'Brand', name: 'Gilli Solutions' },
    manufacturer: { '@type': 'Organization', name: 'Gilli Solutions' },
  });
  document.head.appendChild(ld);

  initLightbox(root);

  // "Request a quote" fills in the enquiry form further down this page.
  root.querySelector('[data-quote]')?.addEventListener('click', () => {
    const msg = document.querySelector('form[data-enquiry] [name="message"]');
    const type = document.querySelector('form[data-enquiry] [name="enquiry_type"]');
    if (msg && !msg.value) msg.value = `I'd like a quote for: ${p.name}.\n\nKitchen type / location: \nApproximate size or hood length: `;
    if (type) type.value = 'Individual product';
    setTimeout(() => document.querySelector('form[data-enquiry] [name="name"]')?.focus({ preventScroll: true }), 500);
  });

  // Arrow keys move between products, but never while typing.
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable], dialog[open]')) return;
    if (e.key === 'ArrowLeft') location.href = productUrl(prev);
    if (e.key === 'ArrowRight') location.href = productUrl(next);
  });
}

initList();
initDetail();
