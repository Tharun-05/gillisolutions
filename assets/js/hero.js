/**
 * Live page-top scenes. The visitor's pointer becomes the equipment:
 *   data-fx="smoke"   smoke rising from a cooking line; the pointer is an exhaust hood
 *   data-fx="sparks"  a welding torch laying a glowing seam; the pointer becomes the torch
 *   data-fx="flow"    gold airflow streams (data-variant: stream | radial | converge);
 *                     the pointer is a fan that bends the flow
 *
 * Canvas 2D, no libraries. Runs only while visible (pauses off-screen and in background
 * tabs), uses fewer particles on low-power devices, and draws a single still frame when
 * the visitor prefers reduced motion.
 */
const TAU = Math.PI * 2;
const GOLD = '242,183,5';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 ||
  !!(navigator.connection && navigator.connection.saveData);

/* ---------- Smooth value noise (for natural, swirling motion) ------------------ */
function hash(x, y, z) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(z | 0, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function noise(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const u = fade(x - xi), v = fade(y - yi), w = fade(z - zi);
  const c = (i, j, k) => hash(xi + i, yi + j, zi + k);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v), w);
}
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- Soft round sprite, pre-rendered once ---------------------------------- */
function sprite(rgb) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.45, `rgba(${rgb},.45)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

/* ---------- Scenes ---------------------------------------------------------------- */
class Smoke {
  constructor(fx) {
    this.fx = fx;
    this.resScale = 0.5; // smoke is soft anyway: draw at half resolution, ~4× less work
    this.parts = [];
    this.captured = 0;
    this.rings = [];
    this.puff = sprite('196,206,214');
    this.warm = sprite('255,170,60');
    this.counter = fx.host.querySelector('[data-fx-count]');
  }
  resize(w, h) {
    // Phones: the cooking line sits at the bottom of the clear top band, above the text.
    this.base = w < 700 ? Math.min(175, h * 0.24) : h;
    const n = Math.max(3, Math.min(8, Math.round(w / 210)));
    this.burners = Array.from({ length: n }, (_, i) => ({
      x: w * (0.08 + (0.84 * (i + 0.5)) / n), phase: Math.random() * TAU,
    }));
    this.cap = Math.round(((w * h) / 1400) * this.fx.density);
  }
  step(dt, t) {
    const { w, h, pointer } = this.fx;
    // Spawn from the burners at the bottom edge
    const rate = (this.cap / 230) * dt;
    for (let n = 0; n < rate && this.parts.length < this.cap; n++) {
      const b = this.burners[(Math.random() * this.burners.length) | 0];
      this.parts.push({ x: b.x + rand(-30, 30), y: this.base + rand(0, 20), vx: rand(-0.2, 0.2), vy: rand(-1.6, -0.8),
        age: 0, life: rand(180, 320), r0: rand(8, 16), r1: rand(40, 90), a: rand(0.09, 0.2) });
    }
    const R = Math.min(170, w * 0.22);
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      const ang = noise(p.x * 0.0028, p.y * 0.0028, t * 0.00012) * TAU * 2;
      p.vx += Math.cos(ang) * 0.04 * dt;
      p.vy += (Math.sin(ang) * 0.02 - 0.006) * dt;
      // The pointer is an exhaust hood: smoke is drawn in, then captured.
      const dx = pointer.x - p.x, dy = pointer.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d < R) {
        const f = (1 - d / R) ** 1.5 * 1.1 * pointer.power;
        p.vx += (dx / d) * f * dt;
        p.vy += (dy / d) * f * dt;
        if (d < 20 * pointer.power) {
          this.parts.splice(i, 1);
          this.captured++;
          continue;
        }
      }
      p.vx *= 0.985; p.vy *= 0.99;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.age += dt;
      if (p.age > p.life || p.y < -80 || p.x < -100 || p.x > w + 100) this.parts.splice(i, 1);
    }
    if (this.counter) this.counter.textContent = (this.captured * 0.004).toFixed(2);
  }
  draw(ctx, t) {
    const { w, h, pointer } = this.fx;
    ctx.clearRect(0, 0, w, h);
    // Burner glow along the bottom edge
    ctx.globalCompositeOperation = 'lighter';
    for (const b of this.burners) {
      const flick = 0.55 + 0.25 * Math.sin(t * 0.009 + b.phase) + 0.2 * noise(b.x, t * 0.004, 1);
      ctx.globalAlpha = 0.4 * flick;
      ctx.drawImage(this.warm, b.x - 110, this.base - 60, 220, 130);
    }
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this.parts) {
      const k = p.age / p.life;
      const r = lerp(p.r0, p.r1, Math.min(1, k * 1.4));
      const a = p.a * Math.min(1, p.age / 25) * (1 - k);
      // Fresh smoke near the burners picks up their warm light.
      ctx.globalAlpha = a;
      ctx.drawImage(k < 0.22 ? this.warm : this.puff, p.x - r, p.y - r, r * 2, r * 2);
    }
    // The hood: a rotating gold intake ring at the pointer
    ctx.globalAlpha = pointer.real ? 0.9 : 0.45;
    ctx.strokeStyle = `rgba(${GOLD},1)`;
    ctx.lineWidth = 1.5;
    const rr = 26 + Math.sin(t * 0.004) * 2;
    for (let i = 0; i < 3; i++) {
      const a0 = t * 0.002 + (i * TAU) / 3;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, rr, a0, a0 + 1.3);
      ctx.stroke();
    }
    ctx.globalAlpha = pointer.real ? 0.12 : 0.06;
    ctx.fillStyle = `rgba(${GOLD},1)`;
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, rr - 6, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class Sparks {
  constructor(fx) {
    this.fx = fx;
    this.sparks = [];
    this.bead = [];
    this.glow = sprite('255,214,120');
    this.core = sprite('220,235,255');
    this.seamX = 0;
    this.dir = 1;
  }
  resize(w, h) {
    const narrow = w < 700;
    // Phones: weld along the top band, above the text; wide screens: bottom right.
    this.floor = narrow ? Math.min(150, h * 0.2) : h * 0.84;
    this.seam = narrow ? { x0: w * 0.12, x1: w * 0.88 } : { x0: w * 0.5, x1: w * 0.94 };
    this.seamX = this.seam.x0;
    this.bead = [];
    this.emit = Math.round((lowPower ? 4 : 8) * this.fx.density + 1);
  }
  torch() {
    const { pointer } = this.fx;
    if (pointer.real) return { x: pointer.x, y: pointer.y, seam: false };
    return { x: this.seamX, y: this.floor, seam: true };
  }
  step(dt, t) {
    const { w, h } = this.fx;
    // Auto mode: the torch runs along the seam, leaving a glowing bead that cools.
    this.seamX += this.dir * 0.9 * dt;
    if (this.seamX > this.seam.x1 || this.seamX < this.seam.x0) {
      this.dir *= -1;
      this.seamX = Math.max(this.seam.x0, Math.min(this.seam.x1, this.seamX));
    }
    const tp = this.torch();
    if (tp.seam) {
      const last = this.bead[this.bead.length - 1];
      if (!last || Math.abs(last.x - tp.x) > 3) this.bead.push({ x: tp.x, y: tp.y + rand(-0.6, 0.6), heat: 1 });
    }
    for (const b of this.bead) b.heat -= 0.0025 * dt;
    while (this.bead.length && this.bead[0].heat <= 0) this.bead.shift();

    const flicker = Math.random() < 0.08 ? 0.2 : 1; // the arc stutters now and then
    for (let n = 0; n < this.emit * flicker * dt; n++) {
      const a = -Math.PI / 2 + rand(-1.35, 1.35);
      const s = rand(2, 9);
      this.sparks.push({ x: tp.x, y: tp.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, age: 0, life: rand(30, 85), bounced: false });
    }
    const floor = tp.seam ? this.floor : h - 3;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const p = this.sparks[i];
      p.vy += 0.17 * dt;
      p.vx *= 0.992; p.vy *= 0.992;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > floor && p.vy > 0) {
        p.y = floor; p.vy *= -0.32; p.vx *= 0.6;
        if (p.bounced) p.life = Math.min(p.life, p.age + 12);
        p.bounced = true;
      }
      p.age += dt;
      if (p.age > p.life || p.x < -20 || p.x > w + 20) this.sparks.splice(i, 1);
    }
    this.tp = tp;
    this.t = t;
  }
  draw(ctx, t) {
    const { w, h } = this.fx;
    ctx.clearRect(0, 0, w, h);
    // Steel plate edge
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#2a3742';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(this.seam.x0 - 40, this.floor + 3); ctx.lineTo(w, this.floor + 3); ctx.stroke();
    // Weld bead: white-hot → gold → orange → dull red → steel
    ctx.lineCap = 'round';
    for (let i = 1; i < this.bead.length; i++) {
      const a = this.bead[i - 1], b = this.bead[i], k = b.heat;
      const col = k > 0.75 ? '255,244,214' : k > 0.5 ? '255,196,64' : k > 0.28 ? '232,110,30' : '120,52,30';
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.strokeStyle = `rgba(${col},1)`;
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.sparks) {
      const k = p.age / p.life;
      const col = k < 0.25 ? '255,250,230' : k < 0.6 ? '255,200,80' : '240,120,30';
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = `rgba(${col},1)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    // The arc: a flickering blue-white core with a warm halo and light spill
    const tp = this.tp;
    const fl = 0.75 + Math.random() * 0.25;
    ctx.globalAlpha = 0.35 * fl; ctx.drawImage(this.glow, tp.x - 120, tp.y - 120, 240, 240);
    ctx.globalAlpha = 0.95 * fl; ctx.drawImage(this.core, tp.x - 16, tp.y - 16, 32, 32);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}

class Flow {
  constructor(fx) {
    this.fx = fx;
    this.variant = fx.host.dataset.variant || 'stream';
  }
  resize(w, h) {
    const n = Math.round(((w * h) / 900) * this.fx.density);
    this.parts = Array.from({ length: n }, () => this.spawn());
    this.origin = this.variant === 'radial' ? { x: w * 0.72, y: h * 0.62 } : { x: w * 0.78, y: h * 0.5 };
    this.clear = true;
  }
  spawn() {
    const { w, h } = this.fx;
    return { x: rand(0, w), y: rand(0, h), age: 0, life: rand(80, 260), hot: Math.random() < 0.12 };
  }
  angle(p, t) {
    const n = noise(p.x * 0.0022, p.y * 0.0022, t * 0.00008);
    if (this.variant === 'stream') return (n - 0.5) * 2.2;
    const a = Math.atan2(p.y - this.origin.y, p.x - this.origin.x);
    const wobble = (n - 0.5) * 1.6;
    return this.variant === 'radial' ? a + wobble : a + Math.PI + wobble * 0.8;
  }
  step(dt, t) {
    const { w, h, pointer } = this.fx;
    const R = Math.min(200, w * 0.25);
    for (const p of this.parts) {
      p.px = p.x; p.py = p.y;
      const a = this.angle(p, t);
      let vx = Math.cos(a) * 1.5, vy = Math.sin(a) * 1.5;
      // The pointer is a fan: the flow swirls around it.
      const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy) || 1;
      if (d < R) {
        const f = (1 - d / R) * 3 * pointer.power;
        vx += (-dy / d) * f;
        vy += (dx / d) * f;
      }
      p.x += vx * dt; p.y += vy * dt;
      p.age += dt;
      const out = p.x < -30 || p.x > w + 30 || p.y < -30 || p.y > h + 30;
      const home = this.variant === 'converge' && Math.hypot(p.x - this.origin.x, p.y - this.origin.y) < 12;
      if (out || home || p.age > p.life) Object.assign(p, this.spawn(), { px: undefined });
    }
  }
  draw(ctx) {
    const { w, h } = this.fx;
    // Trails: fade the previous frame instead of clearing it.
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.clear ? 'rgb(5,8,11)' : 'rgba(5,8,11,0.075)';
    ctx.fillRect(0, 0, w, h);
    this.clear = false;
    for (const hot of [false, true]) {
      ctx.strokeStyle = hot ? 'rgba(255,230,150,0.75)' : `rgba(${GOLD},0.34)`;
      ctx.lineWidth = hot ? 1.4 : 1.1;
      ctx.beginPath();
      for (const p of this.parts) {
        if (p.hot !== hot || p.px === undefined) continue;
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    if (this.variant !== 'stream') {
      // A soft point of light where the flow starts (radial) or arrives (converge)
      const g = ctx.createRadialGradient(this.origin.x, this.origin.y, 0, this.origin.x, this.origin.y, 60);
      g.addColorStop(0, `rgba(${GOLD},0.03)`);
      g.addColorStop(1, `rgba(${GOLD},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(this.origin.x - 60, this.origin.y - 60, 120, 120);
    }
  }
}

const SCENES = { smoke: Smoke, sparks: Sparks, flow: Flow };

/* ---------- Mounting, pointer and the animation loop ------------------------------ */
function mount(host) {
  const Scene = SCENES[host.dataset.fx];
  if (!Scene) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: host.dataset.fx !== 'flow' });
  const fx = {
    host, w: 0, h: 0,
    density: lowPower ? 0.5 : 1,
    pointer: { x: 0, y: 0, real: false, power: 0.6, last: -1e9 },
  };
  const scene = new Scene(fx);

  const resize = () => {
    const r = host.getBoundingClientRect();
    const dpr = scene.resScale || Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.75);
    fx.w = Math.max(1, Math.round(r.width));
    fx.h = Math.max(1, Math.round(r.height));
    canvas.width = Math.round(fx.w * dpr);
    canvas.height = Math.round(fx.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene.resize(fx.w, fx.h);
  };
  resize();
  new ResizeObserver(resize).observe(host);

  // Pointer: the hood / torch / fan. Falls back to a slow automatic path when idle.
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    fx.pointer.x = e.clientX - r.left;
    fx.pointer.y = e.clientY - r.top;
    fx.pointer.real = true;
    fx.pointer.last = performance.now();
  };
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerdown', (e) => { onMove(e); fx.pointer.power = 1.6; });
  host.addEventListener('pointerup', () => { fx.pointer.power = 1; });
  // A mouse leaving hands control straight back to the automatic path; a finger lifting
  // lingers for a moment so a tap still has an effect.
  host.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') fx.pointer.last = -1e9; });

  const autoPointer = (t) => {
    if (performance.now() - fx.pointer.last < 3500) {
      fx.pointer.power += (1 - fx.pointer.power) * 0.05;
      return;
    }
    fx.pointer.real = false;
    fx.pointer.power = 0.6;
    const narrow = fx.w < 700;
    fx.pointer.x = fx.w * (narrow ? 0.5 + 0.35 * Math.sin(t * 0.00021) : 0.68 + 0.2 * Math.sin(t * 0.00021));
    fx.pointer.y = narrow ? Math.min(170, fx.h * 0.22) * (0.75 + 0.25 * Math.sin(t * 0.00033 + 1))
                          : fx.h * (0.38 + 0.16 * Math.sin(t * 0.00033 + 1));
  };

  if (reduceMotion) {
    // One still frame: simulate a few seconds, draw once, stop.
    let t = 0;
    for (let i = 0; i < 240; i++) { t += 16; autoPointer(t); scene.step(1, t); if (host.dataset.fx === 'flow') scene.draw(ctx, t); }
    scene.draw(ctx, t);
    host.classList.add('fx-still');
    return;
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(host);
  let prev = performance.now();
  const loop = (t) => {
    const dt = Math.min(3, (t - prev) / 16.67);
    prev = t;
    if (visible && !document.hidden) {
      autoPointer(t);
      scene.step(dt, t);
      scene.draw(ctx, t);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  host.classList.add('fx-live');
}

document.querySelectorAll('[data-fx]').forEach(mount);
