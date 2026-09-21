/* ==========================================================================
   APP — orquesta textos, fotos, flores y música.
   Tip: agrega ?speed=6 a la URL para ver todo el recorrido más rápido.
   ========================================================================== */
(function () {
  'use strict';

  const cfg = window.CONFIG;
  const $ = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speed = parseFloat(new URLSearchParams(location.search).get('speed')) || 1;

  const stage = $('stage'), textzone = $('textzone'), photosEl = $('photos');
  const world = $('world'), worldwrap = $('worldwrap'), sky = $('sky'), starsEl = $('stars');
  const player = $('player'), playerCover = $('playerCover');
  const intro = $('intro'), introDisc = $('introDisc');
  const btnPlay = $('btnPlay'), btnStart = $('btnStart'), bar = $('bar');
  const audio = $('song');

  const texts = (cfg.texts && cfg.texts.length) ? cfg.texts : [''];
  const N = texts.length;
  const T = cfg.timing;

  /* ------------------------------------------------------------ contenido */

  document.title = cfg.pageTitle || cfg.song.title;
  btnStart.textContent = cfg.ui.start;
  $('introHint').textContent = cfg.ui.hint;
  $('introArtist').textContent = cfg.song.artist;
  $('playerArtist').textContent = cfg.song.artist;
  $('btnLbl').textContent = cfg.ui.replay;
  $('playerHint').textContent = cfg.ui.dragHint || '';

  const PH = [['#4c6fb8', '#c8d6f6'], ['#e0a04a', '#fae6b4'], ['#3f8a76', '#c2e6d2'],
              ['#a85f88', '#f1cddf'], ['#6a66b6', '#dad7f7'], ['#c7743f', '#f6d6bd']];

  function placeholder(i) {
    const a = PH[i % PH.length][0], b = PH[i % PH.length][1];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 448"><defs>' +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + a + '"/>' +
      '<stop offset="1" stop-color="' + b + '"/></linearGradient></defs>' +
      '<rect width="400" height="448" fill="url(#g)"/>' +
      '<circle cx="290" cy="120" r="46" fill="#fff" opacity=".35"/>' +
      '<path d="M0 340C90 270 170 320 250 290S370 260 400 290V448H0Z" fill="#fff" opacity=".22"/>' +
      '<path d="M0 390C110 340 190 380 280 350S370 340 400 360V448H0Z" fill="#fff" opacity=".28"/>' +
      '<text x="200" y="228" text-anchor="middle" font-family="Georgia,serif" font-style="italic" ' +
      'font-size="34" fill="#fff" opacity=".92">Foto ' + (i + 1) + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function coverPlaceholder() {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs>' +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd23f"/>' +
      '<stop offset="1" stop-color="#e8790a"/></linearGradient></defs>' +
      '<rect width="600" height="600" fill="url(#g)"/>' +
      '<g fill="#2b1a00" opacity=".82"><circle cx="255" cy="400" r="52"/>' +
      '<rect x="294" y="170" width="20" height="235"/>' +
      '<path d="M314 170C372 192 414 226 402 300C380 258 348 246 314 240Z"/></g></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function setImg(img, src, fallback) {
    img.addEventListener('error', function () {
      if (img.dataset.fb) return;
      img.dataset.fb = '1';
      img.src = fallback;
    });
    img.src = src;
  }

  const coverFallback = coverPlaceholder();
  setImg($('introImg'), cfg.song.cover, coverFallback);
  setImg($('playerImg'), cfg.song.cover, coverFallback);

  /* Fotos (máximo 6): una copia viaja por el mundo y otra (la que se puede
     arrastrar) llega al final */
  function makePhoto(im, i, cls) {
    const fig = document.createElement('figure');
    fig.className = 'photo ' + cls;
    fig.style.setProperty('--k', i);
    const fr = document.createElement('div');
    fr.className = 'frame';
    const tape = document.createElement('span');
    tape.className = 'tape';
    const img = document.createElement('img');
    img.alt = im.alt || '';
    img.decoding = 'async';
    setImg(img, im.src, placeholder(i));
    const cap = document.createElement('figcaption');
    cap.textContent = im.caption || '';
    fr.append(tape, img, cap);
    fig.appendChild(fr);
    return fig;
  }

  const photoEls = [], worldPhotos = [];
  (cfg.images || []).slice(0, 6).forEach(function (im, i) {
    const fin = makePhoto(im, i, 'slot-' + i);
    photosEl.appendChild(fin);
    photoEls.push(fin);

    const wp = makePhoto(im, i, 'wp');
    wp.style.setProperty('--r', [-5, 4, 3.5, -4, -3, 5][i % 6] + 'deg');
    wp.style.setProperty('--tr', (i % 2 ? 3 : -4) + 'deg');
    wp.style.setProperty('--fx', '0px');
    wp.style.setProperty('--fy', '60px');
    wp.style.setProperty('--fr', (i % 2 ? 8 : -8) + 'deg');
    world.appendChild(wp);
    worldPhotos.push(wp);
  });

  const imgSteps = (Array.isArray(cfg.imageSteps) && cfg.imageSteps.length)
    ? cfg.imageSteps
    : photoEls.map(function (_, k) { return Math.round(k * (N - 1) / Math.max(1, photoEls.length)); });

  /* Título animado letra por letra */
  function letters(el, text) {
    el.textContent = '';
    let i = 0;
    const words = text.split(' ');
    words.forEach(function (word, wi) {
      const w = document.createElement('span');
      w.className = 'word';
      Array.from(word).forEach(function (chr) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', i++);
        s.textContent = chr;
        w.appendChild(s);
      });
      el.appendChild(w);
      if (wi < words.length - 1) { el.appendChild(document.createTextNode(' ')); i++; }
    });
  }
  letters($('introTitle'), cfg.song.title);
  letters($('playerTitle').firstElementChild, cfg.song.title);

  function checkMarquee() {
    const box = $('playerTitle'), span = box.firstElementChild;
    const ov = span.scrollWidth - box.clientWidth;
    if (ov > 4) {
      box.style.setProperty('--ov', ov + 'px');
      box.style.setProperty('--mq', clamp(ov / 28, 4, 14).toFixed(1) + 's');
      box.classList.add('is-long');
    }
  }

  /* --------------------------------------------------------------- audio */

  let audioOK = true, audioDur = 0;
  audio.loop = cfg.song.loop !== false;
  audio.addEventListener('error', function () { audioOK = false; });
  audio.addEventListener('ended', function () { if (S.finished) songEnded(); });
  audio.addEventListener('loadedmetadata', function () {
    audioDur = isFinite(audio.duration) ? audio.duration : 0;
    calcTiming();
  });
  audio.src = cfg.song.src;

  function playAudio() {
    try {
      const p = audio.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* sin audio: la animación sigue igual */ }
  }

  function fadeInVolume() {
    const target = cfg.song.volume == null ? 0.85 : cfg.song.volume;
    const t0 = performance.now();
    try { audio.volume = 0; } catch (e) {}
    (function step() {
      const p = Math.min(1, (performance.now() - t0) / 2500);
      try { audio.volume = target * p; } catch (e) {}
      if (p < 1) requestAnimationFrame(step);
    })();
  }

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: cfg.song.title,
        artist: cfg.song.artist,
        artwork: [{ src: new URL(cfg.song.cover, location.href).href, sizes: '512x512' }]
      });
      navigator.mediaSession.setActionHandler('play',  function () { setPlaying(true); });
      navigator.mediaSession.setActionHandler('pause', function () { setPlaying(false); });
    } catch (e) {}
  }

  /* -------------------------------------------------------------- tiempos */

  let stepMs, pulseMs, pulsesPerStep, totalPulses;
  const HOLD_MS = 3200;

  function calcTiming() {
    if (T.bpm) {
      pulseMs = 60000 / T.bpm;
      pulsesPerStep = Math.max(1, T.beatsPerStep | 0);
      stepMs = pulseMs * pulsesPerStep;
    } else {
      stepMs = Math.max(2500, T.stepMs);
      pulsesPerStep = Math.max(1, T.pulsesPerStep | 0);
      pulseMs = stepMs / pulsesPerStep;
    }
    if (T.fitToSong && audioDur > 0) {
      stepMs = audioDur * 1000 / N;
      pulseMs = stepMs / pulsesPerStep;
    }
    totalPulses = N * pulsesPerStep;
  }
  calcTiming();

  /* --------------------------------------------------------------- estado */

  const S = {
    started: false, playing: true, finished: false,
    t: 0, step: -1, pulse: -1, timer: 0, timer2: 0, timer3: 0, ended: false
  };
  const running = function () { return S.started && S.playing && !S.finished; };

  /* ------------------------------------------------------ palabras animadas */

  function fillWords(p, text) {
    const words = text.split(/\s+/).filter(Boolean);
    p.style.setProperty('--gap', Math.min(70, 1300 / Math.max(1, words.length)).toFixed(0) + 'ms');
    words.forEach(function (wd, i) {
      const sp = document.createElement('span');
      sp.className = 'w';
      sp.style.setProperty('--i', i);
      sp.textContent = wd;
      p.appendChild(sp);
      if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
  }

  const worldTexts = [], wIn = [], pIn = [];
  texts.forEach(function (tx) {
    const p = document.createElement('p');
    p.className = 'line wl';
    fillWords(p, tx);
    world.appendChild(p);
    worldTexts.push(p);
  });

  /* --------------------------------------------------- mundo y cámara */

  const garden = new window.Garden($('garden'));
  garden.reduced = reduce;
  let dims = { w: 0, h: 0 };

  const portraitMQ = window.matchMedia('(max-aspect-ratio: 4/5), (max-width: 640px)');
  const DECEL = 0.8;   // el último tramo frena suave hasta detenerse (en pasos)
  const W = { S: 0, y0: 0, camEnd: 0, trig: 0, fin: { cy: 0, th: 0 }, photoY: [] };

  /* Pregunta al CSS dónde quedará el texto del final, para que el
     recorrido termine exactamente ahí */
  function probeFinale() {
    const st = document.createElement('div');
    st.className = 'stage is-finale';
    st.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;';
    const tz = document.createElement('section');
    tz.className = 'textzone';
    st.appendChild(tz);
    document.body.appendChild(st);
    const cs = getComputedStyle(tz);
    const r = { cy: parseFloat(cs.top) || 0, th: parseFloat(cs.height) || 0 };
    st.remove();
    return r;
  }

  /* Posición de la cámara según el tiempo: velocidad constante y, al final,
     frena suavemente para dejar el último texto en su sitio */
  function camAt(t) {
    if (!(t > 0) || !W.camEnd) return 0;
    const total = N * stepMs, Td = DECEL * stepMs, v = W.S / stepMs;
    if (t >= total) return W.camEnd;
    if (t <= total - Td) return v * t;
    const u = (t - (total - Td)) / Td;
    return v * (total - Td) + v * Td * (u - u * u / 2);
  }

  function buildStars(h, travel) {
    const Hs = h + travel * 0.14;
    starsEl.style.height = Hs + 'px';
    starsEl.textContent = '';
    const n = Math.round((window.innerWidth < 640 ? 28 : 46) * Hs / h);
    for (let i = 0; i < n; i++) {
      const st = document.createElement('i');
      st.className = 'star';
      const sz = rand(1, 2.4);
      st.style.cssText =
        'left:' + rand(0, 100).toFixed(1) + '%;top:' + rand(0, Hs * 0.9).toFixed(0) + 'px;' +
        'width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;' +
        '--d:' + rand(3, 7).toFixed(1) + 's;--dl:-' + rand(0, 6).toFixed(1) + 's';
      starsEl.appendChild(st);
    }
  }

  /* Coloca textos y fotos a lo largo del mundo y siembra las flores */
  function buildWorld() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    const mobile = portraitMQ.matches;
    garden.resize(w, h, Math.min(window.devicePixelRatio || 1, 2));

    const fin = probeFinale();
    const tw = textzone.offsetWidth;
    W.fin = fin;
    W.S = mobile ? clamp(h * 0.5, 300, 520) : clamp(h * 0.58, 320, 640);      // separación entre textos
    W.camEnd = W.S * (N - 0.5 * DECEL);                                       // recorrido total
    W.y0 = W.S * (1 - 0.5 * DECEL) + fin.cy;                                  // dónde empieza el 1.er texto
    W.trig = h * 0.9;                                                         // línea donde brotan las flores

    const hard = [];
    worldTexts.forEach(function (el, i) {
      const yc = W.y0 + i * W.S;
      el.style.setProperty('--tzw', tw + 'px');
      el.style.top = yc + 'px';
      const hi = el.offsetHeight;
      hard.push({ x: w / 2 - tw / 2 - 24, y: yc - hi / 2 - 24, w: tw + 48, h: hi + 48 });
    });

    // fotos: en escritorio al lado del texto; en celular entre un texto y el siguiente
    const soft = [], used = {};
    W.photoY = [];
    worldPhotos.forEach(function (el, k) {
      const i = clamp(imgSteps[k] | 0, 0, N - 1);
      const ph = el.offsetHeight, pw = el.offsetWidth;
      const left = k % 2 === 0;
      const key = (left ? 'L' : 'R') + i;
      used[key] = (used[key] || 0) + 1;
      let yc;
      if (mobile) yc = W.y0 + i * W.S + (i < N - 1 ? W.S / 2 : -W.S / 2);
      else yc = W.y0 + i * W.S + (((k * 37) % 5) - 2) * h * 0.04;
      yc += (used[key] - 1) * (ph + 24);
      const m = w * (0.04 + ((k * 53) % 7) / 7 * 0.05);
      const x = left ? m : w - m - pw;
      el.style.left = x + 'px';
      el.style.top = (yc - ph / 2) + 'px';
      W.photoY[k] = yc;
      soft.push({ x: x, y: yc - ph / 2, w: pw, h: ph });
    });

    buildStars(h, W.camEnd);

    garden.build({
      worldH: W.camEnd + h + 60,
      hard: hard, soft: soft,
      density: cfg.garden.density,
      maxPerScreen: cfg.garden.maxFlowers,
      bloomedUpTo: S.pulse >= 0 ? camAt(S.t) + W.trig : null   // si ya iba avanzando, lo anterior queda abierto
    });
    if (S.finished) setTimeout(clearBehindFinale, 500);
  }

  function layout(force) {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    const dw = Math.abs(w - dims.w), dh = Math.abs(h - dims.h);
    if (!force && dw < 1 && dh < 1) return;
    const rebuild = force || dims.w === 0 || dw >= 1 || dh > 140;
    dims = { w: w, h: h };
    if (rebuild) buildWorld();
    else garden.resize(w, h, Math.min(window.devicePixelRatio || 1, 2));   // solo cambió la barra del navegador
  }

  let rt;
  new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(layout, 120); }).observe(stage);
  layout(true);

  /* Cada cuadro: mueve el mundo, revela lo que va entrando y mueve el cielo */
  function updateWorld(cam) {
    world.style.transform = 'translate3d(0,' + (-cam).toFixed(2) + 'px,0)';

    if (S.started && S.t >= 0 && !S.finished) {
      const lim = dims.h * 0.86;
      for (let i = 0; i < N; i++) {
        if (!wIn[i] && W.y0 + i * W.S - cam < lim) { wIn[i] = 1; worldTexts[i].classList.add('in'); }
      }
      for (let k = 0; k < worldPhotos.length; k++) {
        if (!pIn[k] && W.photoY[k] - cam < lim) { pIn[k] = 1; worldPhotos[k].classList.add('is-in'); }
      }
    }

    // el cielo pasa de la noche al amanecer; las estrellas se alejan más despacio
    const prog = W.camEnd ? clamp(cam / W.camEnd, 0, 1) : 0;
    sky.style.backgroundPositionY = (prog * 100).toFixed(2) + '%';
    starsEl.style.transform = 'translate3d(0,' + (-cam * 0.14).toFixed(1) + 'px,0)';
    starsEl.style.opacity = (1 - prog * 0.9).toFixed(3);
  }

  function resetWorld() {
    worldwrap.classList.remove('is-gone');
    worldTexts.forEach(function (el) { el.classList.remove('in'); el.style.visibility = ''; });
    worldPhotos.forEach(function (el) { el.classList.remove('is-in'); });
    wIn.length = 0; pIn.length = 0;
    textzone.style.top = ''; textzone.style.height = '';
  }

  /* ------------------------------------------------------- texto del final */

  function setLine(text, opts) {
    const old = textzone.querySelector('.line.in');
    if (old) {
      old.classList.remove('in');
      old.classList.add('out');
      setTimeout(function () { old.remove(); }, 900);
    }
    if (!text) return;
    const p = document.createElement('p');
    p.className = 'line' + (opts && opts.instant ? ' instant' : '');
    fillWords(p, text);
    textzone.appendChild(p);
    void p.offsetWidth;
    requestAnimationFrame(function () { p.classList.add('in'); });
  }

  /* El último texto llega a su sitio en el mundo; aquí se le da el relevo al
     bloque fijo de texto (idéntico y en la misma posición) sin que se note */
  function handoffLastText() {
    textzone.style.transition = 'none';
    textzone.style.top = W.fin.cy + 'px';
    textzone.style.height = W.fin.th + 'px';
    setLine(texts[N - 1], { instant: true });
    void textzone.offsetWidth;
    textzone.style.transition = '';
    worldTexts[N - 1].style.visibility = 'hidden';
  }

  function releaseTextzone() { textzone.style.top = ''; textzone.style.height = ''; }

  function beat() {
    if (reduce || !playerCover.animate) return;
    playerCover.animate([
      { boxShadow: '0 0 0 2px rgba(255,225,140,.28), 0 0 0 0 rgba(255,210,63,.55)' },
      { boxShadow: '0 0 0 2px rgba(255,225,140,.28), 0 0 0 16px rgba(255,210,63,0)' }
    ], { duration: 900, easing: 'ease-out' });
  }

  /* Cada "latido": florecen en cascada las semillas que acaban de entrar */
  function onPulse() {
    garden.bloomDue(W.trig, pulseMs * 0.75);
    stage.style.setProperty('--bloom', clamp(camAt(S.t) / Math.max(1, W.camEnd), 0, 1).toFixed(3));
    beat();
  }

  function advance() {
    if (S.t < 0) return;
    const pi = Math.min(totalPulses - 1, Math.floor(S.t / pulseMs));
    while (S.pulse < pi) { S.pulse++; onPulse(); }
    if (S.t >= N * stepMs + (T.loop ? HOLD_MS : 0)) end();
  }

  /* Las fotos regresan volando desde los bordes y quedan listas para arrastrar */
  function bringPhotosBack() {
    photoEls.forEach(function (el, k) {
      el.style.transitionDelay = (250 + k * 130) + 'ms';
      el.classList.add('is-in');
    });
    setTimeout(function () {
      photoEls.forEach(function (el) { el.style.transitionDelay = ''; });
    }, 2800);
  }

  function end() {
    if (T.loop) { restart(true); return; }
    S.finished = true;
    S.t = N * stepMs;
    stage.classList.remove('is-paused');
    stage.classList.add('is-finished');
    btnPlay.setAttribute('aria-label', 'Pausar');

    handoffLastText();
    worldwrap.classList.add('is-gone');
    bringPhotosBack();
    enterFinale();

    // Si la canción sigue sonando, la tarjeta se queda como reproductor
    // (ecualizador, barra, pausa) y "Ver de nuevo" sale hasta que termine.
    if (audioOK && audioDur > 0 && !audio.paused && !audio.ended) {
      audio.loop = false;          // para que llegue a su final y avise
    } else {
      songEnded();                 // sin audio (o ya terminó): no hay nada que esperar
    }
  }

  function songEnded() {
    if (S.ended) return;
    S.ended = true;
    stage.classList.remove('is-paused');
    stage.classList.add('is-ended');
    btnPlay.setAttribute('aria-label', cfg.ui.replay);
  }

  /* ------------------------------------------------------------- final */

  let zTop = 10;

  function enableDrag(on) {
    photosEl.classList.toggle('is-draggable', on);
    photoEls.forEach(function (el) {
      el.classList.toggle('movable', on);
      if (!on) {
        el.dataset.dx = 0; el.dataset.dy = 0;
        el.style.removeProperty('--dx'); el.style.removeProperty('--dy');
        el.style.zIndex = '';
      }
    });
  }

  /* Arrastrar con mouse o dedo */
  photoEls.forEach(function (el) {
    let sx = 0, sy = 0, ox = 0, oy = 0, active = false, pid = null;

    el.addEventListener('pointerdown', function (e) {
      if (!el.classList.contains('movable')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      active = true; pid = e.pointerId;
      try { el.setPointerCapture(pid); } catch (err) {}
      sx = e.clientX; sy = e.clientY;
      ox = parseFloat(el.dataset.dx || 0); oy = parseFloat(el.dataset.dy || 0);
      el.style.zIndex = ++zTop;
      el.classList.add('is-dragging');
      e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      if (!active || e.pointerId !== pid) return;
      const W = stage.clientWidth, H = stage.clientHeight;
      const w = el.offsetWidth, h = el.offsetHeight;
      // que nunca se pierda fuera de la pantalla
      const dx = clamp(ox + e.clientX - sx, -w * 0.6 - el.offsetLeft, W - w * 0.4 - el.offsetLeft);
      const dy = clamp(oy + e.clientY - sy, -h * 0.6 - el.offsetTop,  H - h * 0.4 - el.offsetTop);
      el.dataset.dx = dx; el.dataset.dy = dy;
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
    });

    const up = function (e) {
      if (!active || e.pointerId !== pid) return;
      active = false;
      el.classList.remove('is-dragging');
      try { el.releasePointerCapture(pid); } catch (err) {}
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });

  /* En pantallas verticales bajitas las fotos se apartan hacia los bordes
     para no tapar el texto ni la tarjeta (se pueden traer de vuelta arrastrando) */
  function nudgePhotos() {
    if (!window.matchMedia('(max-aspect-ratio: 4/5), (max-width: 640px)').matches) return;
    const ph = photoEls[0] ? photoEls[0].offsetHeight : 130;
    const push = clamp((830 - stage.clientHeight) * 0.22, 0, ph * 0.4);
    if (push < 2) return;
    photoEls.forEach(function (el, k) {
      const dy = k % 2 === 0 ? -push : push;   // pares = fila de arriba, impares = fila de abajo
      el.dataset.dx = 0; el.dataset.dy = dy;
      el.style.setProperty('--dx', '0px');
      el.style.setProperty('--dy', dy.toFixed(1) + 'px');
    });
  }

  /* Cuando el texto y la tarjeta ya llegaron, las flores que quedan
     detrás se retiran con un fundido para que todo se lea limpio */
  function clearBehindFinale() {
    if (!S.finished) return;
    const sr = stage.getBoundingClientRect();
    [textzone, player].forEach(function (el) {
      const r = el.getBoundingClientRect();
      garden.clearZone({ x: r.left - sr.left - 14, y: r.top - sr.top - 14, w: r.width + 28, h: r.height + 28 }, 1000);
    });
  }

  /* El texto sube y la portada viaja al centro, en grande */
  function enterFinale() {
    if (stage.classList.contains('is-finale')) return;
    nudgePhotos();
    clearTimeout(S.timer2);
    S.timer2 = setTimeout(clearBehindFinale, reduce ? 200 : 1500);
    if (reduce || !playerCover.animate) {
      stage.classList.add('is-finale');
      releaseTextzone();
      enableDrag(true);
      return;
    }
    player.classList.add('is-fading');
    S.timer = setTimeout(function () {
      const first = playerCover.getBoundingClientRect();
      stage.classList.add('is-finale');
      releaseTextzone();
      player.classList.remove('is-fading');
      const last = playerCover.getBoundingClientRect();
      const dx = (first.left + first.width / 2) - (last.left + last.width / 2);
      const dy = (first.top + first.height / 2) - (last.top + last.height / 2);
      playerCover.animate([
        { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + (first.width / last.width) + ')' },
        { transform: 'none' }
      ], { duration: 1500, easing: 'cubic-bezier(.65,0,.2,1)' });
      enableDrag(true);
    }, 420);
  }

  function leaveFinale(done) {
    enableDrag(false);
    player.classList.add('is-swap');
    setTimeout(function () {
      stage.classList.remove('is-finale');
      player.classList.remove('is-swap', 'is-fading');
      done();
    }, 340);
  }

  function restart(keepAudio) {
    clearTimeout(S.timer);
    clearTimeout(S.timer2);
    clearTimeout(S.timer3);
    S.finished = false;
    S.playing = true;
    S.step = -1; S.pulse = -1;
    S.t = -1200 * (1 / speed);
    stage.classList.remove('is-paused', 'is-finished', 'is-ended');
    S.ended = false;
    audio.loop = cfg.song.loop !== false;
    btnPlay.setAttribute('aria-label', 'Pausar');
    stage.style.setProperty('--bloom', 0);
    const fade = Math.round(1000 / speed);
    garden.clear(fade);                                        // el jardín se desvanece...
    S.timer3 = setTimeout(buildWorld, fade + 40);              // ...y se siembra uno nuevo
    setLine('');
    resetWorld();
    photoEls.forEach(function (el) { el.classList.remove('is-in'); });
    if (!keepAudio && audioOK) { try { audio.currentTime = 0; } catch (e) {} }
    playAudio();
  }

  function setPlaying(v) {
    if (!S.started || S.ended) return;
    if (S.finished) {              // tarjeta final: solo pausa o reanuda la canción
      stage.classList.toggle('is-paused', !v);
      btnPlay.setAttribute('aria-label', v ? 'Pausar' : 'Reanudar');
      if (v) playAudio(); else audio.pause();
      return;
    }
    S.playing = v;
    stage.classList.toggle('is-paused', !v);
    btnPlay.setAttribute('aria-label', v ? 'Pausar' : 'Reanudar');
    if (v) playAudio(); else audio.pause();
  }

  btnPlay.addEventListener('click', function () {
    if (!S.finished) { setPlaying(!S.playing); return; }
    if (!S.ended) { setPlaying(audio.paused); return; }   // la canción sigue: pausa / reanuda
    if (stage.classList.contains('is-finale')) {
      leaveFinale(function () { restart(false); });
    } else restart(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && S.started && document.activeElement.tagName !== 'BUTTON') {
      e.preventDefault();
      btnPlay.click();
    }
  });

  /* ---------------------------------------------------------------- inicio */

  const fontsReady = Promise.race([
    (document.fonts && document.fonts.ready) || Promise.resolve(),
    new Promise(function (r) { setTimeout(r, 1500); })
  ]);
  fontsReady.then(function () {
    layout(true);
    intro.classList.add('is-ready');
    $('introTitle').classList.add('on');
  });

  function start() {
    layout(true);
    S.started = true;
    const FLIGHT = reduce ? 1 : 1400;

    playAudio();
    fadeInVolume();

    intro.classList.add('is-leaving');
    player.classList.add('is-in');

    introDisc.style.animation = 'none';
    introDisc.style.opacity = '1';
    const from = introDisc.getBoundingClientRect();
    const to = playerCover.getBoundingClientRect();
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const sc = to.width / from.width;

    S.t = -(FLIGHT + 250) / speed;

    const fly = introDisc.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ')' }
    ], { duration: FLIGHT, easing: 'cubic-bezier(.65,0,.2,1)', fill: 'forwards' });

    fly.onfinish = function () {
      player.classList.add('is-landed');
      $('playerTitle').classList.add('on');
      requestAnimationFrame(function () { intro.remove(); });
      setTimeout(checkMarquee, 1600);
    };
  }
  btnStart.addEventListener('click', start, { once: true });

  /* ------------------------------------------------------------ bucle */

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(now - last, 250) * speed;
    last = now;

    if (running()) {
      if (T.fitToSong && audioDur > 0 && S.t >= 0 && !audio.paused && !audio.seeking && speed === 1) {
        S.t = audio.currentTime * 1000;
      } else {
        S.t += dt;
      }
      advance();
    }

    const cam = camAt(S.t);
    garden.setCam(cam);
    updateWorld(cam);
    garden.update(running() || S.finished ? dt : 0);
    garden.draw();

    if (S.started) {
      const prog = (audioOK && audioDur > 0)
        ? audio.currentTime / audioDur
        : clamp(S.t / (N * stepMs), 0, 1);
      bar.style.transform = 'scaleX(' + clamp(prog, 0, 1).toFixed(4) + ')';
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* Para depurar desde la consola: window.__jardin */
  window.__jardin = { S: S, garden: garden, W: W, cam: function () { return camAt(S.t); } };
})();
