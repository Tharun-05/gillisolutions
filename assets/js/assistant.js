/**
 * "Ask Gilli" — site assistant.
 *
 * Two modes:
 *  1. Offline (default): answers from the product data and company facts on this site.
 *     No external calls, no cost, works on any static hosting as-is.
 *  2. AI mode: if SITE.aiEndpoint is set (see worker/ai-proxy.js), questions go to a
 *     large language model through your own server-side proxy. If that call fails, the
 *     offline engine answers instead.
 *
 * Both modes can hand the conversation to the team: when a visitor types a phone number
 * or email, they get a one-tap "Send to the team" button (posts via Web3Forms).
 */
import { SITE, PRODUCTS, CATEGORIES, productUrl } from './data.js';
import { sendToWeb3Forms } from './main.js';

const STORE_KEY = 'gilli-chat-v1';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wa = (text = '') => `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
const onHome = () => !!document.getElementById('estimator');
const estimateLink = () => (onHome() ? '#estimate' : 'index.html#estimate');
const PHONE_RE = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;

/* ---------- Offline knowledge engine ------------------------------------ */
const has = (t, re) => re.test(t);

const kwCache = new Map();
// Whole-word match with simple plurals, so "products" never matches "duct".
const kwRe = (k) => {
  if (!kwCache.has(k)) kwCache.set(k, new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(s|es)?\\b`));
  return kwCache.get(k);
};

function matchProducts(t) {
  return PRODUCTS
    .map((p) => ({ p, score: p.keywords.reduce((s, k) => s + (kwRe(k).test(t) ? k.length : 0), 0) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

const A = (html, actions = []) => ({ html, actions });
const link = (href, label) => ({ href, label });
const quoteLink = (what) => link(`contact.html?product=${encodeURIComponent(what)}#enquiry`, 'Request a quote');

function localAnswer(raw, state) {
  const t = ' ' + raw.toLowerCase().replace(/[’']/g, "'") + ' ';
  const products = matchProducts(t);
  const p = products[0] || state.lastProduct;

  if (PHONE_RE.test(raw) || EMAIL_RE.test(raw)) {
    state.contact = (raw.match(PHONE_RE) || raw.match(EMAIL_RE))[0];
    return A(`<p>Thanks — I can send this conversation to the Gilli team so an engineer calls you back with the right questions already answered.</p>`,
      [{ action: 'handoff', label: 'Send to the team' }]);
  }
  if (has(t, /\b(hi|hello|hey|hii+|namaste|namaskara|good (morning|afternoon|evening))\b/) && t.trim().split(/\s+/).length <= 4) {
    return A(`<p>Hello! I can help you choose a hood, size your exhaust system, or get you a quote. What are you working on — a new kitchen or an existing one?</p>`);
  }
  if (has(t, /\b(thank|thanks|thx|dhanyavad|great|perfect)\b/)) {
    return A(`<p>Happy to help. If you'd like a firm price, share your kitchen location and hood length and we'll arrange a site visit.</p>`, [quoteLink('Kitchen exhaust system')]);
  }
  if (has(t, /\b(price|cost|rate|quote|quotation|budget|how much|charges?|estimate cost)\b/)) {
    const what = products[0] ? products[0].name.toLowerCase() : 'a system';
    return A(`<p>Prices depend on hood length, steel gauge, duct run and blower size, so we quote ${esc(what)} after a short site visit or a look at your kitchen drawings.</p>
      <p>To speed it up, send us: your kitchen type, cooking line length, and the site location.</p>`,
      [quoteLink(products[0] ? products[0].name : 'Kitchen exhaust system'), link(wa('Hi Gilli, I need a quote for a kitchen exhaust system.'), 'WhatsApp us')]);
  }
  if (has(t, /\b(cfm|airflow|air flow|sizing|size|how big|capacity|calculate|which (hood|blower|fan)|what (hood|blower|fan)|need for my)\b/)) {
    return A(`<p>Airflow is set by the length of your cooking line and how heavy the cooking is. As a rough guide for a wall canopy hood:</p>
      <ul><li>Café / bakery: about 200 CFM per foot</li><li>Restaurant, mixed menu: about 300</li><li>Dosa tawa, fryers: about 400</li><li>Tandoor, charcoal grill, wok range: about 550</li></ul>
      <p>The estimator works out airflow, duct size, filters and blower motor for your kitchen in seconds.</p>`,
      [link(estimateLink(), 'Open the estimator')]);
  }
  if (has(t, /\b(smoke|not (pulling|working|sucking)|weak|suction|draft|draught|smell|odou?r|too hot|heat (in|inside))\b/)) {
    return A(`<p>When smoke isn't clearing, the usual causes are:</p>
      <ul><li>Clogged or greasy baffle filters</li><li>A blower that's undersized, or a slipping belt</li><li>No fresh (make-up) air, so the hood can't pull</li><li>Long or leaky ducting with too many bends</li><li>A hood that's shorter than the cooking line</li></ul>
      <p>Our team can inspect the system and tell you which one it is.</p>`,
      [link('services.html#repair', 'Repair & upgrades'), link(wa('Hi Gilli, our kitchen exhaust is not clearing smoke properly.'), 'WhatsApp a photo')]);
  }
  if (has(t, /\b(noise|noisy|loud|sound|vibrat\w*|humming)\b/)) {
    const s = PRODUCTS.find((x) => x.slug === 'silencers');
    return A(`<p>Blower noise usually comes from the fan itself, a worn bearing, or high air speed in the duct. A <a href="${productUrl(s)}">blower silencer</a> typically cuts 20–40 dB, and balancing or re-mounting the blower can remove vibration.</p>`,
      [link(productUrl(s), 'See silencers'), link('services.html#repair', 'Book an inspection')]);
  }
  if (has(t, /\b(clean\w*|maintenance|maintain|amc|grease build|service contract)\b/)) {
    return A(`<p>Baffle filters should be washed regularly — weekly in busy kitchens, more often with heavy frying. Ducts and blowers need periodic professional cleaning to keep grease from building up, which is the main fire risk in a kitchen exhaust.</p>
      <p>We offer scheduled maintenance for systems we've installed and for existing ones.</p>`,
      [link('services.html#maintenance', 'Maintenance service')]);
  }
  if (has(t, /\b(install\w*|fitting|how long|timeline|days|site visit|survey)\b/)) {
    return A(`<p>We design, fabricate in our Peenya factory, and install the full system — hood, filters, ducting, dampers and blower. Timelines depend on the size of the job; you'll get a schedule with the quote after the site visit.</p>`,
      [link('services.html#installation', 'How installation works'), quoteLink('Installation')]);
  }
  if (has(t, /\b(warranty|guarantee)\b/)) {
    return A(`<p>Our products carry a ${esc(SITE.warranty)}. Ask us for the exact terms for your system when you get your quote.</p>`);
  }
  if (has(t, /\b(fire|safety|nfpa|suppression|grease fire)\b/)) {
    return A(`<p>Grease build-up is the main fire risk in a kitchen exhaust. Baffle filters, sealed welded ducting and regular cleaning reduce it a lot. We build our hoods and ducting with NFPA 96 practice as the design reference.</p>
      <p>For a fire-suppression system on your hood, ask our team what's suitable for your kitchen.</p>`,
      [link('services.html#maintenance', 'Cleaning & maintenance')]);
  }
  if (has(t, /\b(material|steel|stainless|\bss\b|\bgi\b|galvani[sz]ed|gauge|304|202|\bms\b|mild steel)\b/)) {
    return A(`<p>Hoods and filters are stainless steel (18 or 20 gauge). Ducting is galvanised (G.I.) or stainless steel in 16–20 gauge. Blower housings are M.S. or galvanised steel. Gauges can be matched to your budget and kitchen conditions.</p>`,
      [link('products.html', 'All products')]);
  }
  if (has(t, /\b(where|location|address|located|factory|showroom|visit you|which (city|cities)|outside bangalore|deliver|ship)\b/)) {
    return A(`<p>Our factory is at ${esc(SITE.address)}. We're based in Bengaluru and have completed ${esc(SITE.installations)} installations across India.</p>`,
      [link(SITE.mapsLink, 'Open in Maps'), link('contact.html', 'Contact details')]);
  }
  if (has(t, /\b(hours|open|timings?|closed|sunday|saturday|working days)\b/)) {
    return A(`<p>${SITE.hours.map(([d, h]) => `${esc(d)}: ${esc(h)}`).join('<br>')}</p>`, [link(`tel:${SITE.phoneHref[0]}`, `Call ${SITE.phones[0]}`)]);
  }
  if (has(t, /\b(call|phone|whatsapp|contact|talk|speak|human|person|agent|number|email)\b/)) {
    return A(`<p>You can reach the team directly:</p>
      <ul><li>Phone: <a href="tel:${SITE.phoneHref[0]}">${esc(SITE.phones[0])}</a> or <a href="tel:${SITE.phoneHref[1]}">${esc(SITE.phones[1])}</a></li><li>Email: <a href="mailto:${SITE.email}">${esc(SITE.email)}</a></li></ul>
      <p>Or leave your number here and I'll pass this chat on.</p>`,
      [link(wa('Hi Gilli Solutions, I have a question about kitchen ventilation.'), 'WhatsApp us')]);
  }
  if (has(t, /\b(clients?|projects?|portfolio|previous work|references?|who have you)\b/)) {
    return A(`<p>We've worked with restaurants, hotels, hospitals, schools and institutions — including Akshaya Patra, ISRO, PES University, Hrudaya Hospital and The Tipsy Bull.</p>`,
      [link('clients.html', 'See projects')]);
  }
  if (products.length) {
    state.lastProduct = products[0];
    const pr = products[0];
    const extra = products.slice(1, 3);
    return A(`<p><strong>${esc(pr.name)}</strong> — ${esc(pr.summary)}</p>
      <p>${esc(pr.specs.slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · '))}</p>
      ${extra.length ? `<p>You might also be asking about ${extra.map((x) => `<a href="${productUrl(x)}">${esc(x.name.toLowerCase())}</a>`).join(' or ')}.</p>` : ''}`,
      [link(productUrl(pr), 'Full specifications'), quoteLink(pr.name)]);
  }
  if (has(t, /\b(products?|what do you (make|sell|do|offer)|range|catalog\w*|items)\b/)) {
    return A(`<p>We manufacture complete kitchen ventilation systems:</p>
      <ul>${PRODUCTS.map((x) => `<li><a href="${productUrl(x)}">${esc(x.name)}</a></li>`).join('')}</ul>`,
      [link('products.html', 'Browse products')]);
  }
  if (p && has(t, /\b(more|details|spec\w*|features?|tell me)\b/)) {
    return A(`<p>${esc(p.description)}</p>`, [link(productUrl(p), 'Full specifications')]);
  }
  return A(`<p>I'm not sure I understood. I can help with choosing a hood or blower, sizing airflow, fixing smoke or noise problems, or getting a quote.</p>`,
    [link(wa(`Hi Gilli, ${raw}`), 'Ask the team on WhatsApp')]);
}

/* ---------- Optional AI endpoint ----------------------------------------- */
async function aiAnswer(history) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(SITE.aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history.slice(-12).map(({ role, text }) => ({ role, content: text })) }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.reply) throw new Error('empty reply');
    return A(renderModelText(data.reply));
  } finally {
    clearTimeout(timer);
  }
}

/** Model output is untrusted: escape it, then allow a tiny, safe subset of markdown. */
function renderModelText(text) {
  const safe = esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(((?:[a-z-]+\.html|#)[^)\s]*)\)/g, '<a href="$2">$1</a>'); // same-site links only
  const blocks = safe.split(/\n{2,}/).map((b) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\s*[-•*]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${l.replace(/^\s*[-•*]\s+/, '')}</li>`).join('')}</ul>`;
    return `<p>${lines.join('<br>')}</p>`;
  });
  return blocks.join('');
}

/* ---------- UI ----------------------------------------------------------- */
function initAssistant() {
  const launch = document.getElementById('ai-launch');
  const panel = document.getElementById('ai-panel');
  if (!launch || !panel) return;
  const log = panel.querySelector('.ai-log');
  const form = panel.querySelector('.ai-input');
  const input = form.querySelector('input');
  const state = { lastProduct: null, contact: null, busy: false };
  let history = [];

  try { history = JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]'); } catch { history = []; }
  const save = () => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-30))); } catch { /* storage unavailable */ } };

  const bubble = (role, html, actions = []) => {
    const el = document.createElement('div');
    el.className = `msg msg--${role === 'user' ? 'user' : 'bot'}`;
    if (role === 'user') el.textContent = html;
    else {
      el.innerHTML = html;
      if (actions.length) {
        const row = document.createElement('div');
        row.className = 'msg-actions';
        actions.forEach((a) => {
          if (a.action === 'handoff') {
            const b = document.createElement('button');
            b.type = 'button'; b.textContent = a.label; b.dataset.action = 'handoff';
            row.appendChild(b);
          } else {
            const l = document.createElement('a');
            l.href = a.href; l.textContent = a.label;
            if (/^https?:/.test(a.href)) { l.target = '_blank'; l.rel = 'noopener'; }
            row.appendChild(l);
          }
        });
        el.appendChild(row);
      }
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  const greet = () => bubble('bot',
    `<p>Hi, I'm the Gilli assistant. I can help you pick the right hood or blower, estimate airflow for your kitchen, troubleshoot smoke or noise, or get a quote.</p>`);

  const restore = () => {
    log.innerHTML = '';
    if (!history.length) { greet(); return; }
    history.forEach((m) => bubble(m.role, m.role === 'user' ? m.text : m.html, m.actions || []));
  };

  const open = (question) => {
    panel.hidden = false;
    launch.hidden = true;
    document.body.classList.add('ai-open');
    launch.setAttribute('aria-expanded', 'true');
    if (!log.children.length) restore();
    if (question) ask(question); else input.focus();
  };
  const close = () => {
    panel.hidden = true;
    launch.hidden = false;
    document.body.classList.remove('ai-open');
    launch.setAttribute('aria-expanded', 'false');
    launch.focus();
  };

  async function ask(text) {
    if (state.busy || !text.trim()) return;
    state.busy = true;
    bubble('user', text);
    history.push({ role: 'user', text });
    const typing = bubble('bot', '<span class="typing" aria-label="Typing"><span></span><span></span><span></span></span>');

    let answer;
    if (SITE.aiEndpoint && !PHONE_RE.test(text) && !EMAIL_RE.test(text)) {
      try { answer = await aiAnswer(history); } catch (e) { console.warn('AI endpoint failed, using offline answers', e); }
    }
    if (!answer) {
      await new Promise((r) => setTimeout(r, 380)); // brief pause so replies don't feel abrupt
      answer = localAnswer(text, state);
    }
    typing.remove();
    bubble('bot', answer.html, answer.actions);
    history.push({ role: 'assistant', text: answer.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), html: answer.html, actions: answer.actions });
    save();
    state.busy = false;
  }

  async function handoff(btn) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
    const transcript = history.map((m) => `${m.role === 'user' ? 'Visitor' : 'Assistant'}: ${m.text}`).join('\n\n');
    try {
      await sendToWeb3Forms({
        subject: 'Website chat — callback request',
        name: 'Website chat visitor',
        contact: state.contact || '',
        page: location.pathname,
        message: transcript,
      });
      btn.textContent = 'Sent';
      bubble('bot', `<p>Done. The team has your details and this chat, and will get back to you within one working day.</p>`);
    } catch (e) {
      console.error(e);
      btn.disabled = false;
      btn.textContent = 'Send to the team';
      bubble('bot', `<p>That didn't go through. Please call <a href="tel:${SITE.phoneHref[0]}">${esc(SITE.phones[0])}</a> or message us on WhatsApp.</p>`, [link(wa(), 'WhatsApp us')]);
    }
  }

  launch.addEventListener('click', () => open());
  panel.querySelector('[data-close]').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; ask(v); });
  panel.querySelectorAll('.ai-suggest button').forEach((b) => b.addEventListener('click', () => ask(b.dataset.q || b.textContent)));
  log.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action="handoff"]');
    if (b) handoff(b);
    const a = e.target.closest('a[href^="#"]');
    if (a) close();
  });
  panel.querySelector('[data-reset]')?.addEventListener('click', () => {
    history = []; save(); state.lastProduct = null; log.innerHTML = ''; greet(); input.focus();
  });
  // Any element with data-ask="question" opens the assistant with that question.
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-ask]');
    if (t) { e.preventDefault(); open(t.dataset.ask); }
  });
}

initAssistant();
