/* ==========================================================================
   FLOWERS — motor del jardín (Canvas 2D, sin dependencias)
   Cada flor: tallo que crece desde el borde → capullo → floración.
   Las cabezas se dibujan una sola vez en sprites y luego se reutilizan,
   así se ve rico pero corre fluido en celulares.
   ========================================================================== */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeOutBack = (t, s) => {
    const c = s == null ? 1.7 : s;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  };

  function mk(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    return c;
  }

  /* Pétalo puntiagudo apuntando hacia arriba (-y).
     a,b = curvatura de los bordes; sh = dónde se ensancha (0..1) */
  function petal(g, r0, r1, w, a, b, sh) {
    const L = r1 - r0;
    g.beginPath();
    g.moveTo(0, -r0);
    g.bezierCurveTo(w * a, -(r0 + L * 0.10), w * b, -(r0 + L * sh), 0, -r1);
    g.bezierCurveTo(-w * b, -(r0 + L * sh), -w * a, -(r0 + L * 0.10), 0, -r0);
    g.closePath();
  }

  /* ---------------------------------------------------------------- SPRITES */

  const SUN_PAL = [
    { a: '#d98200', b: '#ffb800', c: '#ffcf3a', d: '#ffe466', c0: '#7a4a17', c1: '#2b1706' },
    { a: '#e08a00', b: '#ffc21a', c: '#ffd94a', d: '#fff08a', c0: '#8a5320', c1: '#331b08' },
    { a: '#cf7a00', b: '#ffab00', c: '#ffc933', d: '#ffdf5c', c0: '#6b3e12', c1: '#241305' }
  ];

  function sunflower(S, p) {
    const c = mk(S), g = c.getContext('2d'), R = S / 2;
    g.translate(R, R);
    const n = 22;

    const ring = (off, r0, r1, w, c0, c1, jit) => {
      for (let i = 0; i < n; i++) {
        const a = (i + off) / n * TAU + rand(-0.035, 0.035);
        const len = r1 * rand(1 - jit, 1);
        g.save();
        g.rotate(a);
        petal(g, r0, len, w, 1.15, 0.85, 0.7);
        const gr = g.createLinearGradient(0, -r0, 0, -len);
        gr.addColorStop(0, c0);
        gr.addColorStop(1, c1);
        g.fillStyle = gr;
        g.fill();
        g.lineWidth = R * 0.007;
        g.strokeStyle = 'rgba(120,60,0,.35)';
        g.stroke();
        // nervadura central
        g.beginPath();
        g.moveTo(0, -r0 - (len - r0) * 0.08);
        g.lineTo(0, -len + (len - r0) * 0.16);
        g.strokeStyle = 'rgba(150,80,0,.28)';
        g.lineWidth = R * 0.006;
        g.stroke();
        g.restore();
      }
    };

    ring(0,   R * 0.2, R * 0.98, R * 0.15, p.a, p.b, 0.08);
    ring(0.5, R * 0.2, R * 0.88, R * 0.14, p.c, p.d, 0.10);

    const cr = R * 0.36;
    // sombra suave alrededor del centro
    const sh = g.createRadialGradient(0, 0, cr * 0.9, 0, 0, cr * 1.9);
    sh.addColorStop(0, 'rgba(90,40,0,.38)');
    sh.addColorStop(1, 'rgba(90,40,0,0)');
    g.fillStyle = sh;
    g.beginPath(); g.arc(0, 0, cr * 1.9, 0, TAU); g.fill();

    // disco central
    const gr = g.createRadialGradient(0, 0, cr * 0.1, 0, 0, cr);
    gr.addColorStop(0, p.c0);
    gr.addColorStop(1, p.c1);
    g.fillStyle = gr;
    g.beginPath(); g.arc(0, 0, cr, 0, TAU); g.fill();

    // semillas en espiral de Fibonacci
    const N = 210, ga = 2.399963;
    for (let i = 1; i <= N; i++) {
      const r = Math.sqrt(i / N) * cr * 0.94, a = i * ga;
      g.fillStyle = i % 3 ? 'rgba(205,135,45,.55)' : 'rgba(18,7,0,.6)';
      g.beginPath();
      g.arc(Math.cos(a) * r, Math.sin(a) * r, cr * 0.034 + (i / N) * cr * 0.02, 0, TAU);
      g.fill();
    }
    g.strokeStyle = 'rgba(255,190,70,.6)';
    g.lineWidth = R * 0.025;
    g.beginPath(); g.arc(0, 0, cr, 0, TAU); g.stroke();
    return c;
  }

  const LILY_PAL = [
    { c0: '#fff6c4', c1: '#ffe268', c2: '#ffbd0e', fr: 'rgba(196,84,16,.7)' },
    { c0: '#fffbe0', c1: '#fff09a', c2: '#ffd23a', fr: 'rgba(200,100,20,.6)' },
    { c0: '#fff2b0', c1: '#ffd84a', c2: '#ffa800', fr: 'rgba(180,70,10,.75)' }
  ];

  function lily(S, p) {
    const c = mk(S), g = c.getContext('2d'), R = S / 2;
    g.translate(R, R);

    const tepal = (ang, r1, w) => {
      g.save();
      g.rotate(ang);
      petal(g, R * 0.05, r1, w, 1.5, 1.0, 0.6);
      const gr = g.createLinearGradient(0, 0, 0, -r1);
      gr.addColorStop(0, p.c0);
      gr.addColorStop(0.38, p.c1);
      gr.addColorStop(1, p.c2);
      g.fillStyle = gr;
      g.fill();
      g.lineWidth = R * 0.008;
      g.strokeStyle = 'rgba(170,100,0,.38)';
      g.stroke();
      // nervadura
      g.beginPath();
      g.moveTo(0, -R * 0.08);
      g.quadraticCurveTo(R * 0.012, -r1 * 0.5, 0, -r1 * 0.94);
      g.strokeStyle = 'rgba(190,110,0,.42)';
      g.lineWidth = R * 0.012;
      g.stroke();
      // pecas
      for (let k = 0; k < 10; k++) {
        const rr = rand(0.12, 0.52) * r1;
        const xx = rand(-1, 1) * w * 0.32 * (1 - rr / r1 * 0.5);
        g.fillStyle = p.fr;
        g.beginPath();
        g.arc(xx, -rr, R * rand(0.008, 0.02), 0, TAU);
        g.fill();
      }
      g.restore();
    };

    for (let k = 0; k < 3; k++) tepal(k * TAU / 3, R * 0.98, R * 0.27);
    for (let k = 0; k < 3; k++) tepal(k * TAU / 3 + TAU / 6, R * 0.92, R * 0.30);

    // garganta verdosa
    const th = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.2);
    th.addColorStop(0, 'rgba(206,222,92,.95)');
    th.addColorStop(1, 'rgba(206,222,92,0)');
    g.fillStyle = th;
    g.beginPath(); g.arc(0, 0, R * 0.2, 0, TAU); g.fill();

    // estambres con anteras
    for (let k = 0; k < 6; k++) {
      const a = k * TAU / 6 + 0.35;
      const len = R * rand(0.44, 0.54);
      const dx = Math.sin(a), dy = -Math.cos(a);
      g.strokeStyle = 'rgba(210,150,40,.95)';
      g.lineWidth = R * 0.014;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(dx * len, dy * len); g.stroke();
      g.save();
      g.translate(dx * len, dy * len);
      g.rotate(a);
      g.fillStyle = '#a8480c';
      g.beginPath(); g.ellipse(0, 0, R * 0.022, R * 0.062, 0, 0, TAU); g.fill();
      g.restore();
    }
    // pistilo
    const pl = R * 0.6;
    g.strokeStyle = '#8fa63a';
    g.lineWidth = R * 0.02;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(0.2) * pl, -Math.cos(0.2) * pl); g.stroke();
    g.fillStyle = '#c96a12';
    g.beginPath(); g.arc(Math.sin(0.2) * pl, -Math.cos(0.2) * pl, R * 0.036, 0, TAU); g.fill();
    return c;
  }

  const COS_PAL = [
    { a: '#ffe27a', b: '#fff6b8', edge: '#ffc61f', c0: '#e89a00', c1: '#a4560a' },
    { a: '#ffd23f', b: '#ffeb8a', edge: '#ffb400', c0: '#ee9d00', c1: '#9e4f08' }
  ];

  function cosmos(S, p) {
    const c = mk(S), g = c.getContext('2d'), R = S / 2;
    g.translate(R, R);
    const n = 8;
    for (let i = 0; i < n; i++) {
      g.save();
      g.rotate(i / n * TAU + rand(-0.03, 0.03));
      petal(g, R * 0.14, R * rand(0.94, 0.99), R * 0.3, 1.3, 1.25, 0.86);
      const gr = g.createLinearGradient(0, -R * 0.14, 0, -R);
      gr.addColorStop(0, p.a);
      gr.addColorStop(0.6, p.b);
      gr.addColorStop(1, p.edge);
      g.fillStyle = gr;
      g.fill();
      g.lineWidth = R * 0.008;
      g.strokeStyle = 'rgba(190,120,0,.35)';
      g.stroke();
      // hendidura en la punta
      g.beginPath();
      g.moveTo(0, -R * 0.99);
      g.lineTo(0, -R * 0.86);
      g.strokeStyle = 'rgba(190,120,0,.45)';
      g.lineWidth = R * 0.012;
      g.stroke();
      // venas
      g.strokeStyle = 'rgba(190,120,0,.22)';
      g.lineWidth = R * 0.006;
      for (let v = -1; v <= 1; v++) {
        g.beginPath();
        g.moveTo(v * R * 0.03, -R * 0.2);
        g.lineTo(v * R * 0.11, -R * 0.8);
        g.stroke();
      }
      g.restore();
    }
    const cr = R * 0.2;
    const gr = g.createRadialGradient(0, -cr * 0.2, 0, 0, 0, cr);
    gr.addColorStop(0, p.c0);
    gr.addColorStop(1, p.c1);
    g.fillStyle = gr;
    g.beginPath(); g.arc(0, 0, cr, 0, TAU); g.fill();
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39996, r = Math.sqrt(i / 26) * cr * 0.85;
      g.fillStyle = i % 2 ? 'rgba(255,214,90,.7)' : 'rgba(80,30,0,.5)';
      g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, cr * 0.07, 0, TAU); g.fill();
    }
    return c;
  }

  const BUT_PAL = [
    { hi: '#fff59a', mid: '#ffd60a', lo: '#f0a000' },
    { hi: '#fffbb0', mid: '#ffe030', lo: '#f5b200' }
  ];

  function buttercup(S, p) {
    const c = mk(S), g = c.getContext('2d'), R = S / 2;
    g.translate(R, R);
    const off = rand(0, TAU);
    for (let i = 0; i < 5; i++) {
      const a = i * TAU / 5 + off;
      const cx = Math.cos(a) * R * 0.38, cy = Math.sin(a) * R * 0.38, pr = R * 0.52;
      const gr = g.createRadialGradient(cx - pr * 0.25, cy - pr * 0.3, pr * 0.05, cx, cy, pr);
      gr.addColorStop(0, p.hi);
      gr.addColorStop(0.55, p.mid);
      gr.addColorStop(1, p.lo);
      g.fillStyle = gr;
      g.beginPath(); g.arc(cx, cy, pr, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(160,95,0,.32)';
      g.lineWidth = R * 0.01;
      g.stroke();
    }
    g.fillStyle = '#a9b62c';
    g.beginPath(); g.arc(0, 0, R * 0.14, 0, TAU); g.fill();
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU;
      g.fillStyle = '#f2b81c';
      g.beginPath(); g.arc(Math.cos(a) * R * 0.2, Math.sin(a) * R * 0.2, R * 0.03, 0, TAU); g.fill();
    }
    return c;
  }

  function buildSprites(S) {
    return {
      sun:  SUN_PAL.map(p => sunflower(S, p)),
      lily: LILY_PAL.map(p => lily(S, p)),
      cos:  COS_PAL.map(p => cosmos(S, p)),
      but:  BUT_PAL.map(p => buttercup(S, p))
    };
  }

  const TYPES = [
    { key: 'sun',  w: 0.36, mul: 1.18 },
    { key: 'lily', w: 0.26, mul: 1.05 },
    { key: 'cos',  w: 0.22, mul: 0.82 },
    { key: 'but',  w: 0.16, mul: 0.6 }
  ];

  function pickType() {
    let r = Math.random();
    for (const t of TYPES) { if ((r -= t.w) <= 0) return t; }
    return TYPES[0];
  }

  /* ----------------------------------------------------------------- GARDEN */

  /* El jardín es un "mundo" alto. Cada semilla tiene una posición fija en él;
     la cámara baja por el mundo y, cuando una semilla cruza la línea de
     floración (cerca del borde inferior), brota en el siguiente latido. */
  class Garden {
    constructor(canvas) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.sprites = buildSprites(256);
      this.seeds = [];
      this.ptr = 0;          // primera semilla que aún no ha florecido
      this.bloomed = 0;
      this.dying = [];
      this.time = 0;
      this.cam = 0;
      this.frozenCam = 0;
      this.w = 0; this.h = 0; this.dpr = 1;
      this.baseR = 30;
      this.reduced = false;
      this.fade = 1;
      this.clearing = 0;
      this.clearT = 0;
    }

    resize(w, h, dpr) {
      this.w = w; this.h = h; this.dpr = dpr;
      this.cv.width = Math.round(w * dpr);
      this.cv.height = Math.round(h * dpr);
      this.baseR = clamp(Math.min(w, h * 1.3) * 0.032, 24, 46);
    }

    setCam(y) { this.cam = y; }

    inRects(rects, x, y, pad) {
      for (const r of rects) {
        if (x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad) return true;
      }
      return false;
    }

    hits(rects, x, y, w, h) {
      for (const r of rects) {
        if (x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y) return true;
      }
      return false;
    }

    makeSeed(x, y) {
      const type = pickType();
      const z = Math.random();
      const R = this.baseR * type.mul * (0.72 + z * 0.5) * rand(0.88, 1.14);
      const L = R * rand(2.6, 4.6);                    // largo del tallo hacia abajo
      const dir = Math.random() < 0.5 ? -1 : 1;
      const sprites = this.sprites[type.key];

      const leaves = [];
      const nl = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nl; i++) {
        leaves.push({
          t: rand(0.3, 0.85), side: i % 2 ? 1 : -1, ang: rand(0.7, 1.15),
          size: Math.max(14, R * rand(0.6, 0.95)), hue: rand(96, 122)
        });
      }
      const hue = rand(98, 118), sat = rand(38, 52), lit = 26 + z * 18;

      return {
        x: x, y: y, R: R, z: z, L: L,
        sprite: sprites[Math.floor(Math.random() * sprites.length)],
        bx: rand(-0.7, 0.7) * R,
        cx: dir * rand(0.3, 1) * R * 0.9,
        stemDur: this.reduced ? 1 : clamp(520 + L * 2.2, 700, 1500),
        bloomDur: this.reduced ? 600 : rand(850, 1100),
        rot: rand(-0.5, 0.5),
        spin: this.reduced ? 0 : rand(0.9, 1.6) * (Math.random() < 0.5 ? -1 : 1),
        ph: rand(0, TAU),
        swayAmp: this.reduced ? 0 : 2 + R * 0.05,
        sw: clamp(R * 0.085, 2, 5),
        stemPre: 'hsla(' + hue.toFixed(0) + ',' + sat.toFixed(0) + '%,' + lit.toFixed(0) + '%,',
        alpha: 0.8 + z * 0.2,
        leaves: leaves,
        t0: Infinity,          // Infinity = todavía no florece
        die: 0, dieT: 0
      };
    }

    /* Siembra todo el mundo con una cuadrícula con variación (reparto parejo).
       o.hard  = zonas prohibidas (textos)         — en coordenadas del mundo
       o.soft  = zonas que se prefiere evitar (fotos)
       o.bloomedUpTo = si viene, las semillas por encima de esa altura ya
                       están abiertas (se usa al cambiar el tamaño de ventana) */
    build(o) {
      const w = this.w;
      const avgR = this.baseR * 0.8;
      const density = clamp(o.density || 0.5, 0.15, 0.95);
      let p = 0.8;
      const cell = clamp(avgR * Math.sqrt(Math.PI * p / density), 40, 130);
      const perScreen = (w / cell) * (this.h / cell) * p;
      if (o.maxPerScreen && perScreen > o.maxPerScreen) p *= o.maxPerScreen / perScreen;

      const cols = Math.ceil(w / cell), rows = Math.ceil(o.worldH / cell);
      const seeds = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > p) continue;
          const x = (c + Math.random()) * cell, y = (r + Math.random()) * cell;
          if (x > w) continue;
          const f = this.makeSeed(x, y);
          // caja que cubre la cabeza y todo el tallo que cuelga debajo
          const bx0 = Math.min(f.x - f.R * 0.85, f.x + f.bx - f.sw, f.x + f.cx - f.sw);
          const bx1 = Math.max(f.x + f.R * 0.85, f.x + f.bx + f.sw, f.x + f.cx + f.sw);
          if (this.hits(o.hard, bx0, f.y - f.R * 0.85, bx1 - bx0, f.L + f.R * 0.85)) continue;
          if (this.inRects(o.soft, x, y, 0) && Math.random() < 0.6) continue;
          seeds.push(f);
        }
      }
      seeds.sort((a, b) => a.y - b.y);

      this.seeds = seeds;
      this.dying = [];
      this.ptr = 0; this.bloomed = 0;
      this.fade = 1; this.clearing = 0;
      if (o.bloomedUpTo != null) {
        while (this.ptr < seeds.length && seeds[this.ptr].y <= o.bloomedUpTo) {
          seeds[this.ptr].t0 = -1e9;
          this.ptr++; this.bloomed++;
        }
      }
    }

    /* Latido: abre (en cascada, de abajo hacia arriba) todas las semillas que
       ya cruzaron la línea de floración. Devuelve cuántas abrió. */
    bloomDue(trigY, spanMs) {
      const lim = this.cam + trigY;
      const seeds = this.seeds;
      let end = this.ptr;
      while (end < seeds.length && seeds[end].y <= lim) end++;
      const n = end - this.ptr;
      if (!n) return 0;
      const gap = Math.min(95, spanMs / n);
      for (let i = end - 1, k = 0; i >= this.ptr; i--, k++) {
        seeds[i].t0 = this.time + k * gap + rand(0, 40);
      }
      this.ptr = end;
      this.bloomed += n;
      return n;
    }

    /* Retira (con fundido) las flores que quedarían bajo el texto final */
    clearZone(rect, ms) {
      const cam = this.cam;
      for (const f of this.seeds) {
        if (f.t0 === Infinity) continue;
        const sy = f.y - cam, pad = f.R * 0.5;
        if (f.x > rect.x - pad && f.x < rect.x + rect.w + pad &&
            sy > rect.y - pad && sy < rect.y + rect.h + pad) {
          if (!f.die) this.dying.push(f);
          f.die = ms; f.dieT = ms;
        }
      }
    }

    /* Todo el jardín se desvanece (y luego hay que volver a sembrar) */
    clear(ms) {
      if (!ms) { this.seeds = []; this.ptr = 0; this.bloomed = 0; this.fade = 1; this.clearing = 0; return; }
      this.frozenCam = this.cam;
      this.clearing = ms;
      this.clearT = ms;
    }

    get count() { return this.bloomed; }

    update(dt) {
      if (!dt) return;
      this.time += dt;
      if (this.dying.length) {
        for (const f of this.dying) {
          f.dieT -= dt;
          if (f.dieT <= 0) f.t0 = Infinity;      // ya se fue: deja de dibujarse
        }
        this.dying = this.dying.filter(f => f.dieT > 0);
      }
      if (this.clearing) {
        this.clearT -= dt;
        this.fade = Math.max(0, this.clearT / this.clearing);
        if (this.clearT <= 0) { this.seeds = []; this.ptr = 0; this.bloomed = 0; this.fade = 1; this.clearing = 0; }
      }
    }

    draw() {
      const g = this.ctx, dpr = this.dpr, T = this.time, h = this.h;
      const cam = this.clearing ? this.frozenCam : this.cam;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, this.w, h);
      const seeds = this.seeds;
      if (!seeds.length) return;
      g.lineCap = 'round';
      g.lineJoin = 'round';

      // solo se dibuja lo que cae en pantalla (las semillas están ordenadas por altura)
      const yMin = cam - 340, yMax = cam + h + 80;
      let lo = 0, hi = seeds.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (seeds[m].y < yMin) lo = m + 1; else hi = m; }

      for (let i = lo; i < seeds.length; i++) {
        const f = seeds[i];
        if (f.y > yMax) break;
        const age = T - f.t0;
        if (!(age > 0)) continue;

        const sy = f.y - cam;
        const fk = this.fade * (f.die ? clamp(f.dieT / f.die, 0, 1) : 1);
        const gs = f.stemDur > 1 ? easeOutCubic(clamp(age / f.stemDur, 0, 1)) : 1;
        const sway = f.swayAmp ? Math.sin(T * 0.0009 + f.ph) * f.swayAmp * gs : 0;

        // tallo: sale de abajo (se desvanece hacia la base) y sube hasta la flor
        const p0x = f.x + f.bx,                p0y = sy + f.L;
        const p1x = f.x + f.cx + sway * 0.5,   p1y = sy + f.L * 0.5;
        const p2x = f.x + sway,                p2y = sy;
        const bez = (s) => {
          const m = 1 - s;
          return [m * m * p0x + 2 * m * s * p1x + s * s * p2x, m * m * p0y + 2 * m * s * p1y + s * s * p2y];
        };

        g.globalAlpha = f.alpha * fk;
        const grad = g.createLinearGradient(p0x, p0y, p2x, p2y);
        grad.addColorStop(0, f.stemPre + '0)');
        grad.addColorStop(0.32, f.stemPre + '.92)');
        grad.addColorStop(1, f.stemPre + '1)');
        g.strokeStyle = grad;
        g.lineWidth = f.sw;
        const N = Math.max(3, Math.ceil(gs * 16));
        g.beginPath();
        g.moveTo(p0x, p0y);
        for (let k = 1; k <= N; k++) {
          const q = bez(gs * k / N);
          g.lineTo(q[0], q[1]);
        }
        g.stroke();

        // hojas
        for (const L of f.leaves) {
          const lp = clamp((gs - L.t) / 0.22, 0, 1);
          if (lp <= 0) continue;
          const a = bez(L.t), b2 = bez(Math.min(1, L.t + 0.02));
          const th = Math.atan2(b2[1] - a[1], b2[0] - a[0]);
          g.globalAlpha = f.alpha * fk * Math.min(1, L.t * 1.7);
          g.save();
          g.translate(a[0], a[1]);
          g.rotate(th + L.side * L.ang);
          const sz = L.size * easeOutCubic(lp);
          g.fillStyle = 'hsl(' + L.hue.toFixed(0) + ',46%,' + (30 + f.z * 16).toFixed(0) + '%)';
          g.beginPath();
          g.moveTo(0, 0);
          g.quadraticCurveTo(sz * 0.5, -sz * 0.3, sz, 0);
          g.quadraticCurveTo(sz * 0.5, sz * 0.3, 0, 0);
          g.fill();
          g.strokeStyle = 'rgba(210,240,150,.28)';
          g.lineWidth = 1;
          g.beginPath(); g.moveTo(0, 0); g.lineTo(sz * 0.9, 0); g.stroke();
          g.restore();
        }

        // capullo → flor
        const tip = bez(gs);
        const bloomStart = f.stemDur * 0.82;
        const b = clamp((age - bloomStart) / f.bloomDur, 0, 1);

        if (gs > 0.55 && b < 0.3) {
          const br = f.R * 0.2 * clamp((gs - 0.55) / 0.45, 0, 1) * (1 - b / 0.3);
          g.globalAlpha = f.alpha * fk;
          g.fillStyle = '#79b957';
          g.beginPath(); g.arc(tip[0], tip[1], br, 0, TAU); g.fill();
          g.fillStyle = '#ffd23f';
          g.beginPath(); g.arc(tip[0], tip[1] - br * 0.15, br * 0.45, 0, TAU); g.fill();
        }

        if (b > 0) {
          const e = this.reduced ? b : easeOutBack(b, 1.7);
          const d = f.R * 2 * Math.max(0, e);
          const rot = f.rot + (1 - easeOutCubic(b)) * f.spin + sway * 0.004;

          // destello al abrir
          if (!this.reduced && b < 0.75) {
            const pr = b / 0.75;
            g.globalAlpha = (1 - pr) * 0.42 * fk;
            g.strokeStyle = '#ffe07a';
            g.lineWidth = 2;
            g.beginPath(); g.arc(p2x, p2y, f.R * (0.5 + pr * 1.15), 0, TAU); g.stroke();
          }

          g.globalAlpha = f.alpha * Math.min(1, b * 4) * fk;
          g.save();
          g.translate(p2x, p2y);
          g.rotate(rot);
          g.drawImage(f.sprite, -d / 2, -d / 2, d, d);
          g.restore();
        }
      }
      g.globalAlpha = 1;
    }
  }

  window.Garden = Garden;
})();
