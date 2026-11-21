#!/usr/bin/env python3
"""
Builds the static site.

    python tools/build.py              build the pages
    python tools/build.py --out _site  build, then gather the public files into _site/
                                       (what Cloudflare Pages publishes)

Reads   src/site.json        business details, clients, projects, team
        src/pages/*.html     page bodies with a small front-matter header
Writes  *.html               finished pages in the repo root (uploaded to cPanel)
        assets/js/site.js    the same business details for the browser scripts

The header, footer, chat assistant and icon set are defined once here, so every page
stays identical. Edit content in src/, never in the generated root *.html files.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
S = json.loads((SRC / "site.json").read_text(encoding="utf-8"))
# Edited through the content manager at /admin/ (see admin/config.yml).
CLIENTS = json.loads((SRC / "content/clients.json").read_text(encoding="utf-8"))
PROJECTS = json.loads((SRC / "content/projects.json").read_text(encoding="utf-8"))
THUMBS = ROOT / "assets/uploads/_thumbs"


def load_products():
    """Product slug → {id, name}, read from assets/js/data.js (the products' single source)."""
    src = (ROOT / "assets/js/data.js").read_text(encoding="utf-8")
    found = re.findall(r"id:\s*(\d+),\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)'", src)
    return {slug: {"id": int(i), "name": name} for i, slug, name in found}


PRODUCTS = load_products()
IMG = "https://ik.imagekit.io/Gilli/Gilli_asserts"
e = html.escape

NAV = [
    ("home", "index.html", "Home"),
    ("products", "products.html", "Products"),
    ("services", "services.html", "Services"),
    ("clients", "clients.html", "Projects"),
    ("about", "about.html", "About"),
    ("contact", "contact.html", "Contact"),
]

ICONS = {
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z"/>',
    "mail": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    "pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    "clock": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    "menu": '<path d="M4 6h16M4 12h16M4 18h16"/>',
    "close": '<path d="M18 6 6 18M6 6l12 12"/>',
    "left": '<path d="m15 18-6-6 6-6"/>',
    "right": '<path d="m9 18 6-6-6-6"/>',
    "chat": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    "send": '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    "search": '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "play": '<path d="m7 4 13 8-13 8z"/>',
    "pause": '<path d="M8 5v14M16 5v14"/>',
    # WhatsApp-style glyph: speech bubble with tail + handset
    "whatsapp": '<path d="M12 2.6a9.4 9.4 0 0 0-8.1 14.2L2.6 21.4l4.7-1.2A9.4 9.4 0 1 0 12 2.6z" fill="none" stroke="currentColor" stroke-width="1.7"/><path transform="translate(6.9 6.9) scale(.43)" fill="currentColor" stroke="none" d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z"/>',
    "refresh": '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
}


def icon(name, cls="icon"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#i-{name}"/></svg>'


SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + "".join(
    f'<symbol id="i-{k}" viewBox="0 0 24 24">{v}</symbol>' for k, v in ICONS.items()
) + "</svg>"


def wa(text=""):
    from urllib.parse import quote
    return f"https://wa.me/{S['whatsapp']}" + (f"?text={quote(text)}" if text else "")


# ---------------------------------------------------------------- partials
def head(meta):
    title = meta["title"]
    desc = meta.get("description", "")
    ld = ""
    if meta.get("ld") == "business":
        ld = '<script type="application/ld+json">' + json.dumps({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": S["name"],
            "description": "Manufacturer and installer of commercial kitchen ventilation systems: hoods, ducting, blowers, filters and fresh-air systems.",
            "image": S["logo"],
            "telephone": S["phoneHref"][0],
            "email": S["email"],
            "foundingDate": str(S["founded"]),
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "#89, Duggalama Temple, Peenya Industrial Area, 3rd Phase",
                "addressLocality": "Bengaluru",
                "addressRegion": "Karnataka",
                "postalCode": "560058",
                "addressCountry": "IN",
            },
            "openingHoursSpecification": [
                {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "17:00"},
                {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "14:00"},
            ],
        }, ensure_ascii=False) + "</script>"
    preload = meta.get("preload", "")
    if meta.get("intro"):
        preload += """
  <script>
    /* Decide before the first paint whether to play the logo intro: first visit this session,
       motion allowed, not in data-saver mode. Any error means no intro. */
    try {
      if (!sessionStorage.getItem('gilli-intro') &&
          !matchMedia('(prefers-reduced-motion: reduce)').matches &&
          !(navigator.connection && navigator.connection.saveData)) {
        document.documentElement.classList.add('has-intro');
      }
    } catch (e) {}
  </script>"""
    return f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  {f'<base href="{e(meta["base"])}">' if meta.get("base") else ""}
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(desc)}">
  {f'<meta name="robots" content="{e(meta["robots"])}">' if meta.get("robots") else ""}
  <meta name="theme-color" content="#15212b">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(desc)}">
  <meta property="og:image" content="{e(S['media']['heroPoster'])}">
  <link rel="icon" href="{e(S['logo'])}&tr=w-64,h-64">
  <link rel="preconnect" href="https://ik.imagekit.io" crossorigin>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap">
  <link rel="stylesheet" href="assets/css/site.css">
  {preload}
  {ld}
  <script type="module" src="assets/js/main.js"></script>
</head>"""


def header(active):
    current = ' aria-current="page"'
    links = "".join(
        f'<li><a href="{href}"{current if key == active else ""}>{label}</a></li>'
        for key, href, label in NAV
    )
    return f"""
<a class="skip-link" href="#main">Skip to content</a>
{SPRITE}
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="{e(S['name'])} home">
      <img src="{e(S['logo'])}&tr=t-true:h-168" alt="{e(S['name'])}" height="84">
    </a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul>{links}</ul>
      <div class="nav-mobile-cta">
        <a class="btn" href="contact.html#enquiry">Request a site visit</a>
        <a class="btn btn--ghost" href="tel:{S['phoneHref'][0]}">{icon('phone')} {e(S['phones'][0])}</a>
      </div>
    </nav>
    <a class="btn header-cta" href="contact.html#enquiry">Request a site visit</a>
    <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">
      {icon('menu', 'icon icon-open')}{icon('close', 'icon icon-close')}
    </button>
  </div>
</header>"""


def footer():
    social = [(k, v) for k, v in S["social"].items() if v]
    social_html = (
        '<div><h2>Follow us</h2><ul>' + "".join(f'<li><a href="{e(v)}" rel="noopener" target="_blank">{k.title()}</a></li>' for k, v in social) + "</ul></div>"
        if social else ""
    )
    return f"""
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="{e(S['logo'])}&tr=t-true:h-104" alt="{e(S['name'])}" height="52" loading="lazy">
        <p>Kitchen exhaust and fresh-air systems, designed and fabricated in Bengaluru since {S['founded']}.</p>
      </div>
      <div>
        <h2>Products</h2>
        <ul>
          <li><a href="products.html#exhaust">Exhaust systems</a></li>
          <li><a href="products.html#freshair">Fresh air &amp; accessories</a></li>
          <li><a href="index.html#estimate">Airflow estimator</a></li>
        </ul>
      </div>
      <div>
        <h2>Services</h2>
        <ul>
          <li><a href="services.html#design">Design &amp; site survey</a></li>
          <li><a href="services.html#installation">Installation</a></li>
          <li><a href="services.html#maintenance">Maintenance</a></li>
          <li><a href="services.html#repair">Repair &amp; upgrades</a></li>
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li><a href="tel:{S['phoneHref'][0]}">{e(S['phones'][0])}</a></li>
          <li><a href="tel:{S['phoneHref'][1]}">{e(S['phones'][1])}</a></li>
          <li><a href="mailto:{e(S['email'])}">{e(S['email'])}</a></li>
          <li><a href="{wa()}" target="_blank" rel="noopener">WhatsApp</a></li>
        </ul>
      </div>
      {social_html}
    </div>
    <div class="footer-bottom">
      <span>&copy; <span data-year>2026</span> {e(S['name'])}. {e(S['address'])}</span>
      <a href="privacy.html">Privacy</a>
    </div>
  </div>
</footer>"""


def assistant():
    mode = "AI assistant · answers may be imperfect" if S.get("aiEndpoint") else "Answers from our product information"
    wa_default = wa("Hi Gilli Solutions (via website), I'd like to discuss a kitchen exhaust system.\nKitchen type: \nLocation: ")
    return f"""
<a class="wa-float" id="wa-float" href="{e(wa_default)}" target="_blank" rel="noopener" aria-label="Chat with Gilli Solutions on WhatsApp" title="Chat on WhatsApp">
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-whatsapp"/></svg>
</a>
<button class="ai-launch" id="ai-launch" type="button" aria-controls="ai-panel" aria-expanded="false">
  <span class="dot" aria-hidden="true"></span>{icon('chat')}<span>Ask <span class="label-long">Gilli</span></span>
</button>
<section class="ai-panel" id="ai-panel" role="dialog" aria-label="Ask Gilli assistant" hidden>
  <div class="ai-head">
    <div><h2>Ask Gilli</h2><p>Kitchen ventilation help</p></div>
    <button type="button" data-reset aria-label="Start a new chat">{icon('refresh')}</button>
    <button type="button" data-close aria-label="Close assistant" style="margin-left:0">{icon('close')}</button>
  </div>
  <div class="ai-log" aria-live="polite"></div>
  <div class="ai-suggest" aria-label="Suggested questions">
    <button type="button" data-q="What size hood and blower do I need?">Size my system</button>
    <button type="button" data-q="Smoke is not clearing from my kitchen">Smoke not clearing</button>
    <button type="button" data-q="How do I get a quote?">Get a quote</button>
    <button type="button" data-q="My blower is too noisy">Noisy blower</button>
    <button type="button" data-q="Talk to a person">Talk to a person</button>
  </div>
  <div>
    <form class="ai-input">
      <label class="sr-only" for="ai-q">Your question</label>
      <input id="ai-q" type="text" autocomplete="off" placeholder="Ask about hoods, blowers, ducting…" maxlength="500">
      <button type="submit" aria-label="Send">{icon('send')}</button>
    </form>
    <p class="ai-note">{mode}. For a firm quote, our engineers confirm on site.</p>
  </div>
</section>
<script type="module" src="assets/js/assistant.js"></script>"""


# ------------------------------------------------------- content blocks
def hours_table():
    rows = "".join(f"<tr><td>{e(d)}</td><td>{e(h)}</td></tr>" for d, h in S["hours"])
    return f'<table class="hours"><tbody>{rows}</tbody></table>'


def enquiry_form(heading="Tell us about your kitchen", intro=""):
    intro_html = f'<p class="muted">{intro}</p>' if intro else ""
    return f"""
<div>
  <h2 id="enquiry-title">{heading}</h2>
  {intro_html}
  <form class="form" data-enquiry novalidate aria-labelledby="enquiry-title">
    <div class="form-row">
      <div class="field">
        <label for="f-name">Name</label>
        <input id="f-name" name="name" type="text" autocomplete="name" required>
        <span class="err" aria-live="polite"></span>
      </div>
      <div class="field">
        <label for="f-phone">Phone</label>
        <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile" required>
        <span class="err" aria-live="polite"></span>
      </div>
    </div>
    <div class="form-row">
      <div class="field">
        <label for="f-email">Email <span class="opt">(optional)</span></label>
        <input id="f-email" name="email" type="email" autocomplete="email">
        <span class="err" aria-live="polite"></span>
      </div>
      <div class="field">
        <label for="f-city">Site location <span class="opt">(optional)</span></label>
        <input id="f-city" name="site_location" type="text" autocomplete="address-level2" placeholder="e.g. Whitefield, Bengaluru">
      </div>
    </div>
    <div class="field">
      <label for="f-type">What do you need?</label>
      <select id="f-type" name="enquiry_type" required>
        <option value="">Choose one</option>
        <option>New exhaust system</option>
        <option>Upgrade or replace existing system</option>
        <option>Maintenance or cleaning</option>
        <option>Repair</option>
        <option>Individual product</option>
        <option>Something else</option>
      </select>
      <span class="err" aria-live="polite"></span>
    </div>
    <div class="field">
      <label for="f-msg">Details</label>
      <textarea id="f-msg" name="message" placeholder="Kitchen type, cooking line length, number of burners or tandoors, timeline…" required></textarea>
      <span class="err" aria-live="polite"></span>
    </div>
    <div class="field">
      <label class="check"><input type="checkbox" name="consent" value="yes" required> <span>I agree that Gilli Solutions may contact me about this enquiry. See our <a href="privacy.html">privacy notice</a>.</span></label>
      <span class="err" aria-live="polite"></span>
    </div>
    <input class="hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="btn-row">
      <button class="btn" type="submit">Send enquiry</button>
      <a class="btn btn--wa" href="{wa('Hi Gilli Solutions, I would like to discuss a kitchen ventilation project.')}" target="_blank" rel="noopener">WhatsApp instead</a>
    </div>
    <p class="form-status" role="status" tabindex="-1"></p>
  </form>
</div>"""


def contact_details():
    return f"""
<div class="contact-card">
  <div class="contact-item">{icon('phone')}<div><h3>Call</h3><p><a href="tel:{S['phoneHref'][0]}">{e(S['phones'][0])}</a><br><a href="tel:{S['phoneHref'][1]}">{e(S['phones'][1])}</a></p></div></div>
  <div class="contact-item">{icon('mail')}<div><h3>Email</h3><p><a href="mailto:{e(S['email'])}">{e(S['email'])}</a></p></div></div>
  <div class="contact-item">{icon('pin')}<div><h3>Factory</h3><address>{e(S['address'])}</address><p><a href="{e(S['mapsLink'])}" target="_blank" rel="noopener">Get directions</a></p></div></div>
  <div class="contact-item">{icon('clock')}<div style="flex:1"><h3>Hours</h3>{hours_table()}</div></div>
</div>"""


def contact_section(heading="Tell us about your kitchen", intro="We usually call back within one working day. A short description and your hood length is enough to start."):
    return f"""
<section class="section section--steel" id="contact">
  <div class="wrap contact-grid" id="enquiry">
    {enquiry_form(heading, intro)}
    {contact_details()}
  </div>
</section>"""


def thumbnail(rel_path, box):
    """Small copy of an uploaded image for grids. Falls back to the original if Pillow is missing."""
    src = ROOT / rel_path
    if not src.exists() or src.suffix.lower() == ".svg":
        return rel_path
    try:
        from PIL import Image
    except ImportError:
        return rel_path
    out = THUMBS / f"{src.stem}-{box[0]}x{box[1]}.webp"
    if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
        out.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(src) as im:
            im.thumbnail(box)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA")
            im.save(out, "WEBP", quality=78)
    return out.relative_to(ROOT).as_posix()


def image(value, kind):
    """
    Resolve an image from the content files.
      - ImageKit URLs get resized by ImageKit.
      - Uploads from the content manager ("/assets/uploads/x.webp") become relative paths,
        so the site also works if it is ever moved into a sub-folder.
    kind: "logo" | "thumb" | "full"
    """
    value = (value or "").strip()
    if value.startswith("http"):
        if "ik.imagekit.io" in value:
            tr = {"logo": "t-true:h-160", "thumb": "w-640,h-480,fo-auto,q-70", "full": "w-1600,q-80"}[kind]
            return f"{value}{'&' if '?' in value else '?'}tr={tr}"
        return value
    rel = value.lstrip("/")
    if kind == "logo":
        return thumbnail(rel, (480, 240))
    if kind == "thumb":
        return thumbnail(rel, (640, 640))
    return rel


def _valid(items, key):
    return [i for i in items if i.get("name") and i.get(key)]


def logo_tiles():
    return "".join(
        f'<div class="logo-tile"><img src="{e(image(c["logo"], "logo"))}" alt="{e(c["name"])}" loading="lazy" decoding="async"></div>'
        for c in _valid(CLIENTS, "logo")
    )


def clients_marquee():
    tiles = logo_tiles()
    hidden = tiles.replace('alt="', 'aria-hidden="true" alt="').replace('<div class="logo-tile">', '<div class="logo-tile" aria-hidden="true">')
    return f'<div class="marquee" role="region" aria-label="Client logos"><div class="marquee__track">{tiles}{hidden}</div></div>'


def logo_wall():
    return '<ul class="logo-wall">' + "".join(
        f'<li class="logo-tile"><img src="{e(image(c["logo"], "logo"))}" alt="{e(c["name"])}" loading="lazy" decoding="async"></li>'
        for c in _valid(CLIENTS, "logo")
    ) + "</ul>"


def gallery(items, preview=False):
    cls = "gallery gallery--preview" if preview else "gallery"
    out = []
    for p in items:
        full, thumb = image(p["photo"], "full"), image(p["photo"], "thumb")
        out.append(
            f'<li><button type="button" data-lightbox="projects" data-full="{e(full)}" data-caption="{e(p["name"])}" aria-label="View project photo: {e(p["name"])}">'
            f'<img src="{e(thumb)}" alt="" loading="lazy" decoding="async" width="640" height="480"><span class="cap">{e(p["name"])}</span></button></li>'
        )
    return f'<ul class="{cls}">' + "".join(out) + "</ul>"


def team():
    return '<div class="team">' + "".join(
        f'<article class="person"><img src="{e(p["photo"])}" alt="{e(p["name"])}" loading="lazy">'
        f'<h3>{e(p["name"])} <span class="qual">{e(p["qual"])}</span></h3><p class="role">{e(p["role"])}</p><p>{e(p["bio"])}</p></article>'
        for p in S["team"]
    ) + "</div>"


def reach_map():
    import atlas
    return atlas.render(_valid(PROJECTS, "photo"), PRODUCTS, image, S)


def reach_map_preview():
    import atlas
    sample = json.loads((SRC / "content/map-sample.json").read_text(encoding="utf-8"))["projects"]
    photos = {p["name"]: p.get("photo") for p in PROJECTS}
    merged = [{**s, "photo": photos.get(s["name"], "")} for s in sample]
    return atlas.render(merged, PRODUCTS, image, S, sample=True)


def projects_head():
    """Projects page opener: the installations map when it's live, otherwise a live scene."""
    if reach_map():
        return """<header class="page-head">
    <div class="wrap">
      <h1>Projects &amp; clients</h1>
      <p class="lede">""" + e(S["installations"]) + """ kitchens ventilated since """ + str(S["founded"]) + """ — restaurants, hotels, hospitals, schools, institutions and bulk kitchens.</p>
    </div>
  </header>"""
    return """<header class="fx-hero" data-fx="flow" data-variant="radial">
    <div class="wrap">
      <p class="fx-eyebrow">Projects</p>
      <h1>""" + e(S["installations"]) + """ kitchens <span class="fx-accent">breathing easier.</span></h1>
      <p class="lede">Restaurants, hotels, hospitals, schools and bulk kitchens across India — every one fitted from our Peenya factory since """ + str(S["founded"]) + """.</p>
      <div class="btn-row">
        <a class="btn btn--gold" href="#gallery">See the work</a>
        <a class="btn btn--outline-light" href="contact.html#enquiry">Request a site visit</a>
      </div>
      <p class="fx-hint"><span class="dot" aria-hidden="true"></span><span class="on-hover">Move through the flow — your cursor is the fan.</span><span class="on-touch">Drag through the flow — your finger is the fan.</span></p>
    </div>
  </header>"""


def map_link_button():
    return '<a class="btn btn--ghost" href="clients.html#map">See them on the map</a>' if reach_map() else ""


TOKENS = {
    "contact_section": contact_section,
    "reach_map": reach_map,
    "reach_map_preview": reach_map_preview,
    "map_link_button": map_link_button,
    "projects_head": projects_head,
    "contact_details": contact_details,
    "enquiry_form": enquiry_form,
    "clients_marquee": clients_marquee,
    "logo_wall": logo_wall,
    "projects_preview": lambda: gallery(_valid(PROJECTS, "photo")[:6], preview=True),
    "projects_gallery": lambda: gallery(_valid(PROJECTS, "photo")),
    "team": team,
    "hours_table": hours_table,
    "phone0": lambda: e(S["phones"][0]),
    "phone0_href": lambda: S["phoneHref"][0],
    "email": lambda: e(S["email"]),
    "address": lambda: e(S["address"]),
    "maps_link": lambda: e(S["mapsLink"]),
    "map_embed": lambda: e(S["mapEmbed"]),
    "installations": lambda: e(S["installations"]),
    "founded": lambda: str(S["founded"]),
    "certification": lambda: e(S["certification"]),
    "warranty": lambda: e(S["warranty"]),
    "wa": lambda: wa(),
    "wa_quote": lambda: wa("Hi Gilli Solutions, I would like a quote for a kitchen exhaust system."),
    "hero_video": lambda: e(S["media"]["heroVideo"]),
    "intro_video": lambda: e(S["media"]["introVideo"]),
    "hero_poster": lambda: e(S["media"]["heroPoster"]),
    "img_factory": lambda: e(S["media"]["factory"]),
    "img_facility": lambda: e(S["media"]["facility"]),
    "img_kitchen": lambda: e(S["media"]["kitchen"]),
}


def icon_token(m):
    return icon(m.group(1))


def render_tokens(body):
    body = re.sub(r"\{\{icon:([a-z]+)\}\}", icon_token, body)

    def sub(m):
        key = m.group(1)
        if key not in TOKENS:
            raise KeyError(f"Unknown token {{{{{key}}}}}")
        return TOKENS[key]()
    return re.sub(r"\{\{([a-z0-9_]+)\}\}", sub, body)


def parse_page(path):
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"---\n(.*?)\n---\n(.*)", raw, re.S)
    if not m:
        raise ValueError(f"{path.name}: missing front matter")
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)


def update_admin_config():
    """Write the installations-map fields (with city/area dropdowns) into admin/config.yml."""
    import atlas
    places = atlas.load_places()
    q = lambda s: json.dumps(s, ensure_ascii=False)
    ind = " " * 14
    cities = ", ".join(q(c) for c in places["cities"])
    areas = ", ".join(q(a) for a in places["bengaluru_areas"])
    types = ", ".join("{ label: %s, value: %s }" % (q(v), q(k)) for k, v in atlas.TYPES.items())
    prods = ", ".join("{ label: %s, value: %s }" % (q(p["name"]), q(s)) for s, p in sorted(PRODUCTS.items(), key=lambda kv: kv[1]["id"]))
    block = "\n".join([
        f"{ind}# >>> map fields — generated by tools/build.py from src/content/places.json; edits here are overwritten",
        f"{ind}- {{ name: city, label: City, widget: select, required: false, options: [{cities}],",
        f'{ind}    hint: "For the installations map. Leave empty to keep this project off the map." }}',
        f"{ind}- {{ name: area, label: Area (Bengaluru only), widget: select, required: false, options: [{areas}],",
        f'{ind}    hint: "Only used when the city is Bengaluru. Shown in the Bengaluru close-up." }}',
        f"{ind}- {{ name: type, label: Kitchen type, widget: select, required: false, dropdown_threshold: 8, options: [{types}] }}",
        f"{ind}- {{ name: year, label: Year installed, widget: number, value_type: int, min: 2013, max: 2100, required: false }}",
        f"{ind}- {{ name: products, label: Products installed, widget: select, multiple: true, required: false, dropdown_threshold: 8, options: [{prods}] }}",
        f"{ind}- {{ name: map_link, label: Show a Google Maps link, widget: boolean, default: false, required: false,",
        f'{ind}    hint: "Only for public places such as restaurants or cafés. Leave off for hospitals, schools, offices and private kitchens." }}',
        f"{ind}# <<< map fields",
    ])
    path = ROOT / "admin/config.yml"
    text = path.read_text(encoding="utf-8")
    start = text.index(f"{ind}# >>> map fields")
    end = text.index("# <<< map fields", start) + len("# <<< map fields")
    path.write_text(text[:start] + block + text[end:], encoding="utf-8")
    print("  updated admin/config.yml (map fields)")


def write_security_policy():
    """
    Content-Security-Policy: the browser may only run this site's own scripts and may only
    contact the services listed here. Generated from the built pages, so the fingerprint of
    the one inline script (the intro check) and the product image hosts stay in sync.
    Written into _headers (Cloudflare Pages) and .htaccess (cPanel/Apache).
    """
    import base64
    import hashlib
    from urllib.parse import urlparse
    hashes = set()
    for page in ROOT.glob("*.html"):
        for body in re.findall(r"<script>(.*?)</script>", page.read_text(encoding="utf-8"), re.S):
            hashes.add("'sha256-" + base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode() + "'")
    data_js = (ROOT / "assets/js/data.js").read_text(encoding="utf-8")
    img_hosts = sorted({f"https://{urlparse(u).netloc}" for u in re.findall(r"image:\s*'(https://[^']+)'", data_js)} | {"https://ik.imagekit.io"})
    connect = ["'self'", "https://api.web3forms.com", "https://tiles.openfreemap.org"]
    if S.get("aiEndpoint"):
        u = urlparse(S["aiEndpoint"])
        connect.append(f"{u.scheme}://{u.netloc}")
    policy = "; ".join([
        "default-src 'self'",
        "script-src 'self' " + " ".join(sorted(hashes)),
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: " + " ".join(img_hosts),
        "media-src 'self' https://ik.imagekit.io",
        "connect-src " + " ".join(connect),
        "worker-src 'self'",
        "frame-src https://www.google.com",
        "frame-ancestors 'self'",
        "form-action 'self' https://api.web3forms.com",
        "base-uri 'self'",
        "object-src 'none'",
        "upgrade-insecure-requests",
    ])

    def put(path, start, end, block):
        text = path.read_text(encoding="utf-8")
        i, j = text.index(start), text.index(end) + len(end)
        path.write_text(text[:i] + block + text[j:], encoding="utf-8")

    put(ROOT / "_headers", "  # >>> csp", "# <<< csp",
        "  # >>> csp (generated by tools/build.py)\n  Content-Security-Policy: " + policy + "\n  # <<< csp")
    put(ROOT / ".htaccess", "  # >>> csp", "# <<< csp",
        "  # >>> csp (generated by tools/build.py) — not applied to /admin/, which loads its editor from unpkg\n"
        '  <If "%{REQUEST_URI} !~ m#^/admin/#">\n'
        '    Header always set Content-Security-Policy "' + policy + '"\n'
        "  </If>\n  # <<< csp")
    print("  wrote Content-Security-Policy to _headers and .htaccess")


def build():
    update_admin_config()
    import atlas
    (ROOT / "assets/data").mkdir(parents=True, exist_ok=True)
    (ROOT / "assets/data/cities.geojson").write_text(json.dumps(atlas.cities_geojson(), separators=(",", ":")), encoding="utf-8")
    pages = sorted((SRC / "pages").glob("*.html"))
    for path in pages:
        meta, body = parse_page(path)
        scripts = "".join(
            f'\n<script type="module" src="assets/js/{s.strip()}.js"></script>'
            for s in meta.get("scripts", "").split(",") if s.strip()
        )
        chrome = meta.get("chrome", "full")
        doc = head(meta) + "\n<body>\n"
        doc += header(meta.get("nav", ""))
        doc += "\n" + render_tokens(body).strip() + "\n"
        doc += footer()
        if chrome == "full":
            doc += assistant()
        doc += scripts + "\n</body>\n</html>\n"
        (ROOT / path.name).write_text(doc, encoding="utf-8")
        print(f"  built {path.name}")

    # Browser copy of business details (no secrets — everything here is public).
    public = {k: v for k, v in S.items() if not k.startswith("_") and k not in ("team", "media", "mapEmbed")}
    (ROOT / "assets/js/site.js").write_text(
        "// Generated by tools/build.py from src/site.json — do not edit by hand.\n"
        f"export const SITE = {json.dumps(public, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print("  built assets/js/site.js")
    write_security_policy()

    # Redirect stubs so old links (home.html, Products.html) keep working.
    # (Products.html is handled in 404.html: on Windows/macOS it would overwrite products.html.)
    stubs = {"home.html": "index.html"}
    for old, new in stubs.items():
        (ROOT / old).write_text(f"""<!DOCTYPE html>
<html lang="en-IN"><head><meta charset="utf-8"><title>Moved</title>
<meta name="robots" content="noindex"><link rel="canonical" href="{new}">
<meta http-equiv="refresh" content="0; url={new}">
</head><body><p>This page has moved to <a href="{new}">{new}</a>.</p></body></html>
""", encoding="utf-8")
        print(f"  built {old} (redirect)")


PUBLIC = ["robots.txt", "_redirects", "_headers", ".htaccess", "assets", "admin"]


def collect(out):
    """Copy only the public website files into one folder (what the host serves)."""
    import shutil
    out = (ROOT / out).resolve()
    if out == ROOT or ROOT not in out.parents:
        raise SystemExit("--out must be a sub-folder of the project")
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    for page in ROOT.glob("*.html"):
        shutil.copy2(page, out / page.name)
    for name in PUBLIC:
        src = ROOT / name
        if src.is_dir():
            shutil.copytree(src, out / name)
        elif src.exists():
            shutil.copy2(src, out / name)
    print(f"  collected public files into {out.relative_to(ROOT)}/")


if __name__ == "__main__":
    import sys
    build()
    if "--out" in sys.argv:
        collect(sys.argv[sys.argv.index("--out") + 1])
