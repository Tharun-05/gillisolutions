/**
 * Optional AI backend for the "Ask Gilli" assistant — a Cloudflare Worker.
 *
 * Why a proxy: any API key placed in the website's JavaScript
 * is public. This worker holds the key as a secret and only answers your own domain.
 *
 * Deploy (free tier is enough for a small site):
 *   npm i -g wrangler
 *   wrangler init gilli-ai   (choose "Hello World" worker, then replace src/index.js with this file)
 *   wrangler secret put ANTHROPIC_API_KEY
 *   wrangler deploy
 * Then put the worker URL in src/site.json → "aiEndpoint", and run `python tools/build.py`.
 *
 * Set ALLOWED_ORIGINS below to your real site address(es).
 */

const ALLOWED_ORIGINS = [
  'https://www.your-domain.com', // CHANGE to your live cPanel domain, with and without www
  'https://your-domain.com',
  'http://localhost:8000',
];
const MODEL = 'claude-haiku-5-5'; // fast, low-cost model — see docs.claude.com for current model names
const MAX_TURNS = 12;
const MAX_CHARS = 1500;

const SYSTEM = `You are the website assistant for Gilli Solutions, a manufacturer of commercial kitchen ventilation systems in Peenya Industrial Area, Bengaluru, India (founded 2013, ISO 9001:2015, 250+ installations across India).

What Gilli makes and installs: stainless steel kitchen hoods (wall, island, low-profile), baffle grease filters, G.I. and stainless exhaust ducting, dampers (manual, motorised, backdraft), M.S. centrifugal blowers, axial fans, blower silencers, and fresh-air collars/grilles. Services: design and site survey, fabrication, installation, maintenance/cleaning, repair and upgrades.

Contact: phone +91 94825 62738 / +91 96116 55968, email gillisolutions@gmail.com, WhatsApp +91 94825 62738. Hours: Mon–Fri 9am–5pm, Sat 10am–2pm.

Useful pages (link with markdown like [text](products.html)): products.html, services.html, clients.html, about.html, contact.html, and the airflow estimator at index.html#estimate.

Sizing guidance (wall canopy hood, CFM per linear foot): light duty (café, bakery) 200; medium (mixed restaurant, institutional) 300; heavy (dosa tawa, fryers) 400; extra-heavy (tandoor, charcoal grill, wok) 550. Island hoods need more (400/500/600/700). Make-up air is roughly 80% of exhaust. Final sizing is always done by Gilli engineers after a site visit.

Rules:
- Answer briefly (2–5 sentences or a short list), in plain language, in the visitor's language.
- Never quote prices, delivery dates, warranty terms beyond "1-year warranty against manufacturing defects", or certifications not listed above. For prices, ask for kitchen type, hood length and site location, and suggest a quote request.
- Only discuss kitchen ventilation and Gilli Solutions. Politely decline unrelated requests.
- If unsure, say so and offer the phone number or WhatsApp.`;

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors(origin) });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors(origin) });

    let body;
    try { body = await request.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors(origin) }); }

    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .slice(-MAX_TURNS)
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    while (messages.length && messages[0].role !== 'user') messages.shift();
    if (!messages.length) return new Response('No messages', { status: 400, headers: cors(origin) });

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM, messages }),
    });

    if (!upstream.ok) {
      console.error('Upstream error', upstream.status, await upstream.text());
      return new Response(JSON.stringify({ error: 'upstream' }), { status: 502, headers: { ...cors(origin), 'Content-Type': 'application/json' } });
    }
    const data = await upstream.json();
    const reply = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    return new Response(JSON.stringify({ reply }), { headers: { ...cors(origin), 'Content-Type': 'application/json' } });
  },
};
