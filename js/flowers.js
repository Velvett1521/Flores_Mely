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

  class Garden {
    constructor(canvas) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.sprites = buildSprites(256);
      this.list = [];
      this.time = 0;
      this.w = 0; this.h = 0; this.dpr = 1;
      this.baseR = 30;
      this.hard = [];
      this.soft = [];
      this.textRect = { x: 0, y: 0, w: 0, h: 0 };
      this.freeArea = 0;
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

    /* hard: zonas donde NO puede haber flores (texto, reproductor).
       soft: zonas donde se prefiere no poner flores (fotos). */
    setZones(hard, soft, textRect) {
      this.hard = hard;
      this.soft = soft;
      this.textRect = textRect;
      let used = 0;
      for (const r of hard) {
        const x0 = clamp(r.x, 0, this.w), x1 = clamp(r.x + r.w, 0, this.w);
        const y0 = clamp(r.y, 0, this.h), y1 = clamp(r.y + r.h, 0, this.h);
        used += Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
      }
      this.freeArea = Math.max(1, this.w * this.h - used);
    }

    /* Cuántas flores caben con la densidad pedida */
    capacity(density, max) {
      const r = this.baseR * 0.8;
      return Math.min(max, Math.round(density * this.freeArea / (Math.PI * r * r)));
    }

    inRects(rects, x, y, pad) {
      for (const r of rects) {
        if (x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad) return true;
      }
      return false;
    }

    /* Mejor candidato: de varios puntos al azar elige el más alejado
       de las flores existentes → el jardín se llena parejo. */
    pickSpot(R) {
      let best = null, bestScore = -1;
      const m = R * 0.6;
      for (let k = 0; k < 24; k++) {
        const x = rand(m, this.w - m), y = rand(m, this.h - m);
        if (this.inRects(this.hard, x, y, R * 0.85)) continue;
        let d = 1e9;
        for (const f of this.list) {
          const dd = Math.hypot(f.x - x, f.y - y) - (f.R + R) * 0.55;
          if (dd < d) d = dd;
        }
        if (d === 1e9) d = 200;
        if (this.inRects(this.soft, x, y, 0)) d *= 0.6;
        if (d > bestScore) { bestScore = d; best = { x, y }; }
      }
      if (best) return best;
      for (let k = 0; k < 200; k++) {
        const x = rand(m, this.w - m), y = rand(m, this.h - m);
        if (!this.inRects(this.hard, x, y, R * 0.85)) return { x, y };
      }
      return null;
    }

    make() {
      const type = pickType();
      const z = Math.random();
      const R = this.baseR * type.mul * (0.72 + z * 0.5) * rand(0.88, 1.14);
      const spot = this.pickSpot(R);
      if (!spot) return null;
      const { x, y } = spot;

      // Los tallos salen del borde más cercano sin cruzar el texto
      const t = this.textRect;
      let edge;
      if (y < t.y) edge = 'top';
      else if (y > t.y + t.h) edge = 'bottom';
      else edge = y < this.h / 2 ? 'top' : 'bottom';

      const by = edge === 'top' ? -14 : this.h + 14;
      const bx = x + rand(-1, 1) * R * 0.6;
      const len = Math.abs(y - by);
      const s = Math.min(56, len * 0.22);
      const cxm = t.x + t.w / 2;
      const beside = y >= t.y && y <= t.y + t.h;
      const dir = beside ? (x < cxm ? -1 : 1) : (Math.random() < 0.5 ? -1 : 1);

      const sprites = this.sprites[type.key];
      const stemDur = this.reduced ? 1 : clamp(520 + len * 1.5, 700, 1700);

      const leaves = [];
      const nl = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nl; i++) {
        leaves.push({
          t: rand(0.28, 0.82),
          side: i % 2 ? 1 : -1,
          ang: rand(0.7, 1.15),
          size: Math.max(14, R * rand(0.6, 0.95)),
          hue: rand(96, 122)
        });
      }

      return {
        x, y, R, z, sprite: sprites[Math.floor(Math.random() * sprites.length)],
        bx, by,
        c1x: dir * rand(0.3, 1) * s * (beside ? 1 : rand(-1, 1)),
        c2x: dir * rand(0.3, 1) * s * (beside ? 1 : rand(-1, 1)),
        p1y: by + (y - by) * 0.35,
        p2y: by + (y - by) * 0.72,
        stemDur,
        bloomDur: this.reduced ? 600 : rand(850, 1100),
        rot: rand(-0.5, 0.5),
        spin: this.reduced ? 0 : rand(0.9, 1.6) * (Math.random() < 0.5 ? -1 : 1),
        ph: rand(0, TAU),
        swayAmp: this.reduced ? 0 : Math.min(6, 1.5 + len * 0.006),
        sw: clamp(R * 0.085, 2, 5),
        stemCol: 'hsl(' + rand(98, 118).toFixed(0) + ',' + rand(38, 52).toFixed(0) + '%,' + (26 + z * 18).toFixed(0) + '%)',
        alpha: 0.8 + z * 0.2,
        leaves,
        age: 0
      };
    }

    spawn(n, opts) {
      const o = opts || {};
      const gap = o.gap == null ? 95 : o.gap;
      for (let i = 0; i < n; i++) {
        const f = this.make();
        if (!f) continue;
        f.age = o.instant ? 1e6 : -(i * gap + rand(0, 60));
        this.list.push(f);
      }
      this.list.sort((a, b) => a.z - b.z);
    }

    clear(fadeMs) {
      if (!fadeMs) { this.list = []; this.fade = 1; this.clearing = 0; return; }
      this.clearing = fadeMs;
      this.clearT = fadeMs;
    }

    get count() { return this.list.filter(f => !f.die).length; }

    /* Retira (con fundido) las flores que quedarían bajo el texto final */
    clearZone(rect, ms) {
      for (const f of this.list) {
        const pad = f.R * 0.5;
        if (f.x > rect.x - pad && f.x < rect.x + rect.w + pad &&
            f.y > rect.y - pad && f.y < rect.y + rect.h + pad) {
          f.die = ms; f.dieT = ms;
        }
      }
    }

    update(dt) {
      if (!dt) return;
      this.time += dt;
      let dying = false;
      for (const f of this.list) {
        f.age += dt;
        if (f.die) { f.dieT -= dt; dying = true; }
      }
      if (dying) this.list = this.list.filter(f => !f.die || f.dieT > 0);
      if (this.clearing) {
        this.clearT -= dt;
        this.fade = Math.max(0, this.clearT / this.clearing);
        if (this.clearT <= 0) { this.list = []; this.fade = 1; this.clearing = 0; }
      }
    }

    draw() {
      const g = this.ctx, dpr = this.dpr, T = this.time;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, this.w, this.h);
      g.lineCap = 'round';
      g.lineJoin = 'round';

      for (const f of this.list) {
        if (f.age <= 0) continue;
        const fk = this.fade * (f.die ? clamp(f.dieT / f.die, 0, 1) : 1);

        const gs = f.stemDur > 1 ? easeOutCubic(clamp(f.age / f.stemDur, 0, 1)) : 1;
        const sway = f.swayAmp ? Math.sin(T * 0.0009 + f.ph) * f.swayAmp * gs : 0;

        // puntos de control del tallo (con balanceo)
        const p0x = f.bx, p0y = f.by;
        const p1x = f.bx + f.c1x + sway * 0.15, p1y = f.p1y;
        const p2x = f.x + f.c2x + sway * 0.6,   p2y = f.p2y;
        const p3x = f.x + sway,                 p3y = f.y;

        const bez = (s) => {
          const m = 1 - s, a = m * m * m, b = 3 * m * m * s, c = 3 * m * s * s, d = s * s * s;
          return [a * p0x + b * p1x + c * p2x + d * p3x, a * p0y + b * p1y + c * p2y + d * p3y];
        };

        g.globalAlpha = f.alpha * fk;

        // tallo
        const N = Math.max(3, Math.ceil(gs * 18));
        g.strokeStyle = f.stemCol;
        g.lineWidth = f.sw;
        g.beginPath();
        g.moveTo(p0x, p0y);
        for (let i = 1; i <= N; i++) {
          const q = bez(gs * i / N);
          g.lineTo(q[0], q[1]);
        }
        g.stroke();

        // hojas
        for (const L of f.leaves) {
          const lp = clamp((gs - L.t) / 0.22, 0, 1);
          if (lp <= 0) continue;
          const a = bez(L.t), b = bez(Math.min(1, L.t + 0.02));
          const th = Math.atan2(b[1] - a[1], b[0] - a[0]);
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
        const b = clamp((f.age - bloomStart) / f.bloomDur, 0, 1);

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
            g.beginPath(); g.arc(p3x, p3y, f.R * (0.5 + pr * 1.15), 0, TAU); g.stroke();
          }

          g.globalAlpha = f.alpha * Math.min(1, b * 4) * fk;
          g.save();
          g.translate(p3x, p3y);
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
