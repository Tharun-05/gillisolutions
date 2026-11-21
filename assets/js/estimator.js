/**
 * Airflow estimator — a quick, rules-based first estimate for a canopy hood system.
 *
 * Rates are typical minimum exhaust rates for Type I canopy hoods (CFM per linear foot),
 * in line with the International Mechanical Code table 507.13 values commonly used
 * by Indian MEP consultants. It is a planning aid, not a design: final sizing is done
 * by Gilli's engineers after a site visit.
 */

const RATES = {
  wall:   { light: 200, medium: 300, heavy: 400, extra: 550 },
  island: { light: 400, medium: 500, heavy: 600, extra: 700 },
};
const DUTY_LABEL = { light: 'Light', medium: 'Medium', heavy: 'Heavy', extra: 'Extra-heavy' };
const KITCHEN_DUTY = {
  cafe: 'light',        // café, bakery, ovens & steamers
  institutional: 'medium', // hostel, hospital, bulk cooking with kettles
  restaurant: 'medium', // mixed menu
  southindian: 'heavy', // dosa tawa, fryers
  tandoor: 'extra',     // tandoor, charcoal grill, Chinese wok range
};
const DUCT_FPM = 1800;      // design duct velocity (≈ 9 m/s)
const FILTER_CFM = 1100;    // design airflow per 20" × 20" baffle filter
const FILTER_IN = 20;
const MAKEUP = 0.8;         // fresh (make-up) air ≈ 80% of exhaust
const STATIC_IN_WG = 1.25;  // typical system static for one hood + medium duct run
const FAN_EFF = 0.55;
const MOTORS_HP = [0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 12.5, 15, 20];

const fmt = (n) => Math.round(n).toLocaleString('en-IN');

export function estimate({ style, duty, lengthFt }) {
  const cfm = RATES[style][duty] * lengthFt;
  const m3h = cfm * 1.699;
  const areaIn2 = (cfm / DUCT_FPM) * 144;
  const ductIn = Math.ceil(Math.sqrt((4 * areaIn2) / Math.PI));
  const ductMm = Math.round((ductIn * 25.4) / 10) * 10;
  const filters = Math.max(Math.ceil((lengthFt * 12) / FILTER_IN), Math.ceil(cfm / FILTER_CFM));
  const makeup = cfm * MAKEUP;
  const bhp = (cfm * STATIC_IN_WG) / (6356 * FAN_EFF);
  const motorHp = MOTORS_HP.find((m) => m >= bhp * 1.25) || MOTORS_HP[MOTORS_HP.length - 1];
  return { cfm, m3h, ductIn, ductMm, filters, makeup, motorHp, lengthM: lengthFt * 0.3048 };
}

function schematic({ lengthFt, filters, ductIn, style }) {
  const W = 600, H = 300;
  const hoodW = 200 + ((lengthFt - 4) / 26) * 340;
  const x0 = (W - hoodW) / 2;
  const hoodTop = 120, hoodBot = 176, inset = 26;
  const ductW = Math.min(110, 26 + ductIn * 3.6);
  const dx = W / 2 - ductW / 2;
  const shown = Math.min(filters, 24);
  const bankX = x0 + inset + 8, bankW = hoodW - 2 * (inset + 8);
  const fw = bankW / shown;

  let slats = '';
  for (let i = 0; i < shown; i++) {
    const fx = bankX + i * fw;
    slats += `<rect x="${(fx + 1.5).toFixed(1)}" y="140" width="${Math.max(fw - 3, 2).toFixed(1)}" height="22" rx="1.5" fill="#3a4b58"/>`;
    slats += `<line x1="${(fx + fw * 0.3).toFixed(1)}" y1="142" x2="${(fx + fw * 0.7).toFixed(1)}" y2="160" stroke="#6f8291" stroke-width="1.2"/>`;
  }

  const arrows = [0.3, 0.5, 0.7].map((t, i) => {
    const ax = dx + ductW * t;
    return `<line class="flow" style="animation-delay:${i * 0.35}s" x1="${ax}" y1="112" x2="${ax}" y2="14" stroke="#f2b705" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="10 14"/>`;
  }).join('');

  const rangeY = 226;
  const burners = Math.max(2, Math.round(lengthFt / 3));
  const dimY = 284;
  return `
<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Schematic: ${lengthFt} ft ${style} hood with ${filters} baffle filters and a ${ductIn}-inch duct">
  <style>
    .flow{animation:flow 1.4s linear infinite}
    @keyframes flow{to{stroke-dashoffset:-48}}
    @media (prefers-reduced-motion: reduce){.flow{animation:none}}
  </style>
  <rect x="${dx}" y="0" width="${ductW}" height="${hoodTop - 4}" fill="#2b3a46" stroke="#5d707e" stroke-width="1.5"/>
  ${arrows}
  <path d="M${x0 + inset} ${hoodTop} H${x0 + hoodW - inset} L${x0 + hoodW} ${hoodBot} H${x0} Z" fill="#c9d1d6" stroke="#eef1f3" stroke-width="1.5"/>
  <rect x="${dx - 6}" y="${hoodTop - 8}" width="${ductW + 12}" height="10" fill="#8a979f"/>
  ${slats}
  <rect x="${x0 + 10}" y="${rangeY}" width="${hoodW - 20}" height="26" rx="2" fill="#2b3a46" stroke="#5d707e"/>
  ${Array.from({ length: burners }, (_, i) => {
    const cx = x0 + 10 + ((hoodW - 20) / burners) * (i + 0.5);
    return `<ellipse cx="${cx.toFixed(1)}" cy="${rangeY}" rx="18" ry="4" fill="#e8590c" opacity=".55"/>`;
  }).join('')}
  <line x1="${x0}" y1="${dimY}" x2="${x0 + hoodW}" y2="${dimY}" stroke="#9fb0bc" stroke-width="1"/>
  <line x1="${x0}" y1="${dimY - 6}" x2="${x0}" y2="${dimY + 6}" stroke="#9fb0bc"/>
  <line x1="${x0 + hoodW}" y1="${dimY - 6}" x2="${x0 + hoodW}" y2="${dimY + 6}" stroke="#9fb0bc"/>
  <text x="${W / 2}" y="${dimY - 8}" text-anchor="middle" fill="#dbe3e9" font-size="13" font-family="Archivo, sans-serif">${lengthFt} ft · ${(lengthFt * 0.3048).toFixed(2)} m</text>
  <text x="${dx + ductW + 12}" y="40" fill="#9fb0bc" font-size="12" font-family="Archivo, sans-serif">Ø ${ductIn}" duct</text>
</svg>`;
}

export function initEstimator() {
  const form = document.getElementById('estimator');
  if (!form) return;
  const scope = form.closest(".estimator") || document;
  const out = (name) => scope.querySelector(`[data-out="${name}"]`);
  const fig = document.getElementById('est-figure');
  const lengthEl = form.elements.hoodlen;
  let last = null;

  const read = () => ({
    style: form.elements.style.value,
    duty: form.elements.duty.value,
    lengthFt: Number(lengthEl.value),
  });

  const render = () => {
    const input = read();
    const r = estimate(input);
    last = { input, r };
    out('length').textContent = `${input.lengthFt} ft`;
    out('cfm').innerHTML = `${fmt(r.cfm)}<small>CFM</small>`;
    out('m3h').textContent = `${fmt(r.m3h)} m³/h`;
    out('duct').innerHTML = `Ø ${r.ductIn}"<small>${r.ductMm} mm</small>`;
    out('filters').innerHTML = `${r.filters}<small>× 20" baffle</small>`;
    out('makeup').innerHTML = `${fmt(r.makeup)}<small>CFM</small>`;
    out('motor').innerHTML = `${r.motorHp}<small>HP approx.</small>`;
    fig.innerHTML = schematic({ ...input, filters: r.filters, ductIn: r.ductIn });
  };

  form.querySelectorAll('input[name="kitchen"]').forEach((el) =>
    el.addEventListener('change', () => {
      const duty = KITCHEN_DUTY[el.value];
      const target = form.querySelector(`input[name="duty"][value="${duty}"]`);
      if (target) target.checked = true;
      render();
    })
  );
  const markUsed = () => {
    if (!last) return;
    window.gilliEstimate = {
      style: last.input.style === 'wall' ? 'wall' : 'island',
      lengthFt: last.input.lengthFt,
      duty: DUTY_LABEL[last.input.duty].toLowerCase(),
      cfm: fmt(last.r.cfm),
    };
  };
  form.addEventListener('input', () => { render(); markUsed(); });
  form.addEventListener('change', markUsed);
  form.addEventListener('submit', (e) => e.preventDefault());

  document.getElementById('est-send')?.addEventListener('click', () => {
    if (!last) return;
    const { input, r } = last;
    const kitchen = form.querySelector('input[name="kitchen"]:checked')?.nextElementSibling?.textContent || '';
    const summary =
`Airflow estimate from the website:
• Kitchen: ${kitchen}
• Hood: ${input.style === 'wall' ? 'Wall canopy' : 'Island canopy'}, ${input.lengthFt} ft (${r.lengthM.toFixed(2)} m), ${DUTY_LABEL[input.duty]} duty
• Exhaust: ~${fmt(r.cfm)} CFM (${fmt(r.m3h)} m³/h)
• Duct: Ø ${r.ductIn}" (${r.ductMm} mm), ${r.filters} baffle filters
• Fresh air: ~${fmt(r.makeup)} CFM, blower motor ~${r.motorHp} HP

Site location: `;
    const msg = document.querySelector('form[data-enquiry] [name="message"]');
    if (msg) {
      msg.value = summary;
      const type = document.querySelector('form[data-enquiry] [name="enquiry_type"]');
      if (type) type.value = 'New exhaust system';
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => document.querySelector('form[data-enquiry] [name="name"]')?.focus({ preventScroll: true }), 600);
    } else {
      location.href = `contact.html?product=${encodeURIComponent(summary)}`;
    }
  });

  render();
}

initEstimator();
