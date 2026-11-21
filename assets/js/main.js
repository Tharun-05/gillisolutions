/**
 * Shared behaviour for every page. Each feature checks its elements exist first,
 * so nothing throws on pages that don't use it (the old script.js crashed on most pages).
 */
import { SITE } from './site.js';

document.documentElement.classList.add('js');

// Footer year
document.querySelectorAll('[data-year]').forEach((n) => { n.textContent = new Date().getFullYear(); });

// Old links used "Products.html" (capital P). On hosts without redirect rules,
// the 404 page lands here and forwards to the right page.
if (/\/Products\.html$/.test(location.pathname)) {
  location.replace(location.pathname.replace(/Products\.html$/, 'products.html') + location.search + location.hash);
}

/* ---------- Mobile navigation ------------------------------------------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  let scrollY = 0;
  const setOpen = (open) => {
    const body = document.body;
    if (open === body.classList.contains('nav-open')) return;
    if (open) {
      scrollY = window.scrollY;
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.width = '100%';
      body.classList.add('nav-open');
    } else {
      // Unlock first, then restore — the browser ignores scrollTo while scrolling is locked.
      body.classList.remove('nav-open');
      body.style.position = body.style.top = body.style.width = '';
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) { setOpen(false); toggle.focus(); }
  });
  matchMedia('(min-width: 1181px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
}

/* ---------- Header border on scroll ------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
}

/* ---------- Hero video: pause control + reduced motion ------------------ */
function initHeroVideo() {
  const video = document.querySelector('.hero video');
  const btn = document.querySelector('.hero__pause');
  if (!video) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (reduce || saveData) { video.removeAttribute('autoplay'); video.pause(); }
  if (!btn) return;
  const sync = () => {
    const paused = video.paused;
    btn.setAttribute('aria-label', paused ? 'Play background video' : 'Pause background video');
    btn.innerHTML = paused
      ? '<svg class="icon" aria-hidden="true"><use href="#i-play"/></svg>'
      : '<svg class="icon" aria-hidden="true"><use href="#i-pause"/></svg>';
  };
  btn.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  sync();
}

/* ---------- Gentle reveal (opt-in via .reveal) -------------------------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => io.observe(el));
}

/* ---------- Lightbox (native <dialog>, replaces jQuery + Lightbox2) ----- */
export function initLightbox(root = document) {
  const triggers = [...root.querySelectorAll('[data-lightbox]')];
  if (!triggers.length) return;

  let dlg = document.getElementById('lightbox');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'lightbox';
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-label', 'Image viewer');
    dlg.innerHTML = `
      <figure class="lightbox__inner">
        <img alt="">
        <figcaption></figcaption>
        <button class="lb-btn lb-close" type="button" aria-label="Close"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
        <button class="lb-btn lb-prev" type="button" aria-label="Previous image"><svg class="icon" aria-hidden="true"><use href="#i-left"/></svg></button>
        <button class="lb-btn lb-next" type="button" aria-label="Next image"><svg class="icon" aria-hidden="true"><use href="#i-right"/></svg></button>
      </figure>`;
    document.body.appendChild(dlg);
  }
  const img = dlg.querySelector('img');
  const cap = dlg.querySelector('figcaption');
  let group = [];
  let index = 0;

  const show = (i) => {
    index = (i + group.length) % group.length;
    const t = group[index];
    img.src = t.dataset.full;
    img.alt = t.dataset.caption || '';
    cap.textContent = group.length > 1 ? `${t.dataset.caption || ''}  ·  ${index + 1} / ${group.length}` : (t.dataset.caption || '');
    dlg.querySelector('.lb-prev').hidden = dlg.querySelector('.lb-next').hidden = group.length < 2;
  };

  triggers.forEach((t) => {
    t.addEventListener('click', (e) => {
      e.preventDefault();
      group = triggers.filter((x) => x.dataset.lightbox === t.dataset.lightbox);
      show(group.indexOf(t));
      dlg.showModal();
    });
  });

  if (!dlg.dataset.bound) {
    dlg.dataset.bound = '1';
    dlg.querySelector('.lb-close').addEventListener('click', () => dlg.close());
    dlg.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
    dlg.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('lightbox__inner')) dlg.close(); });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    let x0 = null;
    dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
}

/* ---------- Enquiry forms (Web3Forms via fetch, inline status) ---------- */
export async function sendToWeb3Forms(fields) {
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ access_key: SITE.web3formsKey, from_name: 'Gilli Solutions website', ...fields }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

function initForms() {
  document.querySelectorAll('form[data-enquiry]').forEach((form) => {
    const status = form.querySelector('.form-status');
    const btn = form.querySelector('button[type="submit"]');
    const btnLabel = btn ? btn.textContent : '';

    // Prefill from ?product= (product page "Request a quote") or from the estimator.
    const params = new URLSearchParams(location.search);
    const product = params.get('product');
    const msg = form.querySelector('[name="message"]');
    const type = form.querySelector('[name="enquiry_type"]');
    if (product && msg && !msg.value) {
      msg.value = `I'd like a quote for: ${product}.\n\nKitchen type / location: \nApproximate hood length: `;
      if (type) type.value = 'New exhaust system';
    }

    const validate = () => {
      let ok = true;
      form.querySelectorAll('[required]').forEach((el) => {
        const err = el.closest('.field')?.querySelector('.err');
        let message = '';
        if (el.type === 'checkbox' && !el.checked) message = 'Please tick this box to continue.';
        else if (!el.value.trim()) message = 'This field is required.';
        else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) message = 'Enter an email like name@company.com.';
        else if (el.type === 'tel' && el.value.replace(/\D/g, '').length < 10) message = 'Enter a 10-digit phone number.';
        el.setAttribute('aria-invalid', message ? 'true' : 'false');
        if (err) err.textContent = message;
        if (message && ok) { ok = false; el.focus(); }
      });
      // Optional email still needs to be valid if filled.
      const email = form.querySelector('[type="email"]:not([required])');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.setAttribute('aria-invalid', 'true');
        const err = email.closest('.field')?.querySelector('.err');
        if (err) err.textContent = 'Enter an email like name@company.com.';
        if (ok) email.focus();
        ok = false;
      }
      return ok;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      if (form.querySelector('[name="botcheck"]')?.checked) return; // honeypot
      if (!validate()) return;

      const data = Object.fromEntries(new FormData(form).entries());
      delete data.botcheck;
      data.subject = `Website enquiry: ${data.enquiry_type || 'General'} — ${data.name}`;
      data.page = location.pathname;
      if (data.email) data.replyto = data.email;

      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        await sendToWeb3Forms(data);
        form.reset();
        status.textContent = "Enquiry sent. We'll call you back within one working day.";
        status.className = 'form-status is-ok';
      } catch (err) {
        console.error('Form error', err);
        status.innerHTML = `Couldn't send right now. Please call <a href="tel:${SITE.phoneHref[0]}">${SITE.phones[0]}</a> or email <a href="mailto:${SITE.email}">${SITE.email}</a>.`;
        status.className = 'form-status is-err';
      } finally {
        btn.disabled = false;
        btn.textContent = btnLabel;
        status.focus();
      }
    });

    form.querySelectorAll('input, select, textarea').forEach((el) =>
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid') === 'true') {
          el.setAttribute('aria-invalid', 'false');
          const err = el.closest('.field')?.querySelector('.err');
          if (err) err.textContent = '';
        }
      })
    );
  });
}

/* ---------- WhatsApp: message matches what the visitor is looking at ----- */
const SERVICE_NAMES = {
  design: 'design and a site survey',
  installation: 'installation',
  maintenance: 'maintenance / cleaning',
  repair: 'a repair or upgrade',
};

export function whatsappMessage() {
  const hi = 'Hi Gilli Solutions (via website),';
  const tail = '\nKitchen type: \nLocation: ';
  const page = location.pathname.split('/').pop() || 'index.html';

  if (page.startsWith('product-detail')) {
    const name = document.querySelector('#product-detail h1')?.textContent.trim();
    if (name) return `${hi} I'm interested in ${name}. Please share price and details.${tail}`;
  }
  if (window.gilliEstimate) {
    const x = window.gilliEstimate;
    return `${hi} I used the airflow estimator on your website: ${x.style} hood, ${x.lengthFt} ft, ${x.duty} duty — about ${x.cfm} CFM. Please share a quote.${tail}`;
  }
  if (page.startsWith('services')) {
    const section = SERVICE_NAMES[location.hash.slice(1)] || 'installation, maintenance or repair';
    return `${hi} I need help with ${section} of my kitchen exhaust system.${tail}`;
  }
  if (page.startsWith('products')) return `${hi} I'd like details on your kitchen ventilation products.${tail}`;
  return `${hi} I'd like to discuss a kitchen exhaust system.${tail}`;
}

function initWhatsApp() {
  const btn = document.getElementById('wa-float');
  if (!btn) return;
  const update = () => { btn.href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(whatsappMessage())}`; };
  // Set the message at the moment of use, so it reflects the current product / estimate.
  ['pointerdown', 'focus', 'click'].forEach((ev) => btn.addEventListener(ev, update));
}

initNav();
initHeader();
initWhatsApp();
initHeroVideo();
initReveal();
initLightbox();
initForms();
