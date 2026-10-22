/* Hazem Radhouani · site.js ("Field", docs/flagship/08-direction.md)
   Progressive enhancement only: every page reads, navigates, opens full-size images and plays films
   without it. Modules: theme, menu dialog, email chip, scroll engine, arrival, smooth scroll, figure viewer, analytics.
   Every motion has a stated purpose and is skipped under prefers-reduced-motion. No dependencies. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  root.setAttribute('data-js', '');   // the head drops html.fx at load without this mark (D101): no script, nothing hidden
  var thisScript = document.currentScript;   // this file, so a vendored script is found beside it at any depth
  var css = function (name) { return getComputedStyle(root).getPropertyValue(name).trim(); };
  var slice = function (list) { return Array.prototype.slice.call(list); };

  /* ------------------------------------------------------------ theme (preference, state)
     The inline bootstrap sets data-theme before CSS is parsed. This controller synchronises the two
     controls (header, menu) and every open page, persists an explicit choice when storage is available, and
     keeps the browser chrome colour in step. A failed storage read/write is deliberately non-fatal. */
  var themeControls = slice(document.querySelectorAll('[data-theme-toggle]'));
  var themeMeta = document.getElementById('theme-color');
  var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  var explicitTheme = null;
  try {
    var savedTheme = window.localStorage.getItem('hazem-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') explicitTheme = savedTheme;
  } catch (e) {}
  var currentTheme = function () { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; };
  var saveTheme = function (theme) {
    explicitTheme = theme;
    try { window.localStorage.setItem('hazem-theme', theme); } catch (e) {}
  };
  var applyTheme = function (theme) {
    var dark = theme === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    root.style.colorScheme = dark ? 'dark' : 'light';
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#121311' : '#FFFFFF');
    // the name is the visible state plus the action (WCAG 2.5.3: the visible words begin the name)
    themeControls.forEach(function (button) {
      var label = button.querySelector('[data-theme-label]');
      if (label) label.textContent = 'theme: ' + (dark ? 'dark' : 'light');
      var action = button.querySelector('[data-theme-action]');
      if (action) action.textContent = ', switch to ' + (dark ? 'light' : 'dark');
    });
  };
  applyTheme(currentTheme());
  /* the change spreads from its button in a feathered circle (D108; state): a view transition whose new picture is
     masked by a circle growing over 950ms on the in-out curve. The page stays live under it, so a click before it
     ends runs the circle back. The scheme the reader wants is `wanted`, never read back from the page: mid-reveal
     the page already wears the new scheme. A keeper animation holds the transition open until the circle lands,
     then the page is set to `wanted` and the transition skipped, so no frame shows the wrong scheme. Reduced
     motion, or a browser without view transitions, switches at once. */
  var wanted = currentTheme();
  var reveal = null;
  var revealDone = function (run) {
    if (reveal !== run) return;
    reveal = null;
    if (currentTheme() !== wanted) applyTheme(wanted);
    run.t.skipTransition();
    run.t.finished.then(function () { if (!reveal) root.classList.remove('theme-vt'); });
  };
  var swapTheme = function (button) {
    wanted = wanted === 'dark' ? 'light' : 'dark';
    saveTheme(wanted);
    if (reveal) { if (reveal.anim) reveal.anim.reverse(); return; }
    if (reduce.matches || typeof document.startViewTransition !== 'function') { applyTheme(wanted); return; }
    var b = button.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 6 * parseFloat(getComputedStyle(root).fontSize);
    root.style.setProperty('--vt-x', x + 'px'); root.style.setProperty('--vt-y', y + 'px');
    root.classList.add('theme-vt');
    var to = wanted;
    var run = { t: document.startViewTransition(function () { applyTheme(to); }), anim: null };
    reveal = run;
    run.t.ready.then(function () {
      if (reveal !== run) return;
      root.animate({ opacity: [1, 1] }, { duration: 1000, iterations: Infinity, pseudoElement: '::view-transition-old(root)' });
      run.anim = root.animate({ '--vt-r': ['0px', r + 'px'] }, { duration: 950, easing: css('--ease-in-out'), fill: 'both', pseudoElement: '::view-transition-new(root)' });
      if (wanted !== to) run.anim.reverse();   // a second click landed before the circle began
      run.anim.finished.then(function () { revealDone(run); }, function () { revealDone(run); });
    }, function () { revealDone(run); });
  };
  themeControls.forEach(function (button) {
    button.addEventListener('click', function () { swapTheme(button); });
  });
  // every open page follows: another tab's choice (storage) and a page restored by Back or Forward (pageshow)
  var adopt = function (theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    explicitTheme = wanted = theme;
    if (reveal) { var run = reveal; reveal = null; run.t.skipTransition(); root.classList.remove('theme-vt'); }
    if (currentTheme() !== theme) applyTheme(theme);
  };
  window.addEventListener('storage', function (e) { if (e.key === 'hazem-theme') adopt(e.newValue); });
  window.addEventListener('pageshow', function (e) { if (e.persisted) { try { adopt(window.localStorage.getItem('hazem-theme')); } catch (err) {} } });
  window.addEventListener('pagehide', function () { if (reveal) adopt(wanted); });
  var followSystemTheme = function (event) { if (!explicitTheme) { wanted = event.matches ? 'dark' : 'light'; applyTheme(wanted); } };
  if (themeMedia.addEventListener) themeMedia.addEventListener('change', followSystemTheme);
  else if (themeMedia.addListener) themeMedia.addListener(followSystemTheme);

  /* ------------------------------------------------------------ menu (phones; state)
     Chromium opens the dialog natively through commandfor/command; other browsers get the same call
     here. Esc and the close button (form method="dialog") are native. Focus returns to the opener. */
  var menu = document.getElementById('menu');
  var menuButtons = slice(document.querySelectorAll('.menu-button'));
  if (menu && typeof menu.showModal === 'function') {
    var opener = null;
    var nativeCommand = 'command' in HTMLButtonElement.prototype;
    menuButtons.forEach(function (b) {
      b.addEventListener('click', function () { opener = b; if (!nativeCommand && !menu.open) menu.showModal(); });
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a:not(.mail__a)')) menu.close(); });
    menu.addEventListener('close', function () { (opener && !opener.closest('[inert]') ? opener : menuButtons[0]).focus(); });
    var wide = window.matchMedia('(min-width: 48rem)');
    var onWide = function () { if (wide.matches && menu.open) menu.close(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  /* ------------------------------------------------------------ the email chip (feedback, D107)
     Contact opens a chip beside it whose button copies the address and says so ("Copied", and the polite status).
     A modified click still follows the mailto: link. Esc or a click outside closes the chip. */
  var mails = slice(document.querySelectorAll('.mail'));
  var setChip = function (m, open) { m.classList.toggle('is-open', open); m.querySelector('.mail__a').setAttribute('aria-expanded', String(open)); };
  mails.forEach(function (m, i) {
    var a = m.querySelector('.mail__a'), chip = m.querySelector('.mail__chip'), status = m.querySelector('[data-mail-status]');
    var copy = m.querySelector('[data-mail-copy]'), done = m.querySelector('[data-mail-done]'), address = a.getAttribute('href').slice(7);
    chip.id = 'mail-chip-' + i; chip.hidden = false;
    a.setAttribute('aria-controls', chip.id); setChip(m, false);
    a.addEventListener('click', function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      var open = !m.classList.contains('is-open');
      mails.forEach(function (o) { setChip(o, false); });
      setChip(m, open);
    });
    var timer = 0;
    var say = function (copied, words) {
      copy.hidden = copied; done.hidden = !copied; status.textContent = words;
      clearTimeout(timer); timer = setTimeout(function () { copy.hidden = false; done.hidden = true; status.textContent = ''; }, 2400);
    };
    // the clipboard, then the older copy command, then the address left selected for the reader's own copy
    var fallback = function () {
      var range = document.createRange(), sel = window.getSelection(), ok = false;
      range.selectNodeContents(m.querySelector('.mail__e')); sel.removeAllRanges(); sel.addRange(range);
      try { ok = document.execCommand('copy'); } catch (e) {}
      if (ok) { sel.removeAllRanges(); say(true, 'Address copied'); } else status.textContent = 'Address selected';
    };
    m.querySelector('.mail__b').addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(address).then(function () { say(true, 'Address copied'); }, fallback);
      else fallback();
    });
  });
  if (mails.length) document.addEventListener('click', function (e) {
    mails.forEach(function (m) { if (m.classList.contains('is-open') && !m.contains(e.target)) setChip(m, false); });
  });
  /* Esc, one ordered handler (D107, D113): an open chip closes first (a dialog around it stays open); then a
     modal dialog keeps its own Esc */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = mails.filter(function (x) { return x.classList.contains('is-open'); })[0];
    if (!m) return;
    e.preventDefault();
    var inside = m.contains(document.activeElement);
    setChip(m, false);
    if (inside) m.querySelector('.mail__a').focus();
  }, true);

  /* ------------------------------------------------------------ scroll engine (orientation, hierarchy: D83, D96)
     One measured list of [data-fx] elements, read in the frame the page moves (Lenis on a fine pointer, the
     native scroll elsewhere). Every value is a pure function of the scroll position, so scrolling back runs
     everything backwards; CSS maps the values to transform, opacity and, on a fine pointer, blur.
       data-fx ("view"): --p, 0 as the element's top enters at the bottom, 1 as its bottom leaves at the top
       data-fx="top":    --p, 0 at the top of the page, 1 when the element reaches the top; --k, its fill scale
       data-fx="track":  --p, 0 when a tall section's top reaches the top of the screen, 1 when its bottom
                         reaches the bottom: its sticky stage moves only while it stands (A1); data-steps
                         ("0,.25,.5,.75") give data-chapter, and the steps of its rail [data-rail="id"] follow
       data-fx="centre": --d, the element's centre against the screen's centre: 1 entering, 0 centred, -1 leaving
     html.fx (set in the head before the first paint) is on whenever motion is allowed, touch included; without
     it nothing is written and all stands settled. A rail follows the reading position either way. Positions are
     where an element stands without sticking or moving, so a stuck stage keeps counting. */
  var naturalTop = function (el) {
    var t = 0;
    if (getComputedStyle(el).position === 'sticky') {
      t = el.parentNode.getBoundingClientRect().top + window.scrollY;
      for (var s = el.parentNode.firstElementChild; s !== el; s = s.nextElementSibling) t += s.offsetHeight;
      return t;
    }
    for (var e = el; e; e = e.offsetParent) t += e.offsetTop;   // offsets ignore transforms: no feedback from --p
    return t;
  };
  var FX = root.classList.contains('fx');
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var fxItems = slice(document.querySelectorAll(FX ? '[data-fx]' : '[data-fx][data-steps]')).map(function (el) {
    var kind = el.getAttribute('data-fx') || 'view';
    var auto = el.getAttribute('data-steps') === 'auto';   // steps measured from the rail's own targets (D99)
    var steps = auto ? [] : (el.getAttribute('data-steps') || '').split(',').filter(Boolean).map(Number);
    var rail = el.id ? slice(document.querySelectorAll('[data-rail="' + el.id + '"] [data-step]')) : [];
    return { el: el, kind: kind, steps: steps, auto: auto, rail: rail, dark: el.hasAttribute('data-dark'), ch: -1, y: 0, h: 0, p: -1, d: 2, scrub: null };
  });
  var fxUpdate = function () {};
  var scrubKick = function () {};
  if (fxItems.length) {
    var headH = 0;
    var measure = function () {
      var hd = document.querySelector('.site-header'); headH = hd ? hd.offsetHeight : 0;
      fxItems.forEach(function (it) {
        it.y = naturalTop(it.el); it.h = it.el.offsetHeight; it.p = -1; it.d = 2;
        // a chapter is current once its top passes the middle of the screen, wherever the layout put it
        if (it.auto) { var vh0 = document.documentElement.clientHeight; it.steps = it.rail.map(function (a, i) { var t = document.getElementById(a.getAttribute('href').slice(1)); return i && t ? clamp((naturalTop(t) - vh0 / 2 - it.y) / Math.max(1, it.h - vh0), 0, 1) : 0; }); it.ch = -1; }
      });
      fxUpdate();
    };
    var chapter = function (it, p) {
      var c = 0;
      for (var i = 0; i < it.steps.length; i++) if (p >= it.steps[i]) c = i;
      if (c === it.ch) return;
      it.ch = c; it.el.setAttribute('data-chapter', String(c));
      it.rail.forEach(function (s, i) {
        s.classList.toggle('is-on', i === c);
        if (s.tagName === 'A') { if (i === c) s.setAttribute('aria-current', 'location'); else s.removeAttribute('aria-current'); }
      });
    };
    fxUpdate = function () {
      // clientHeight: the layout viewport, steady while a phone's toolbar shows and hides (A1)
      var y = window.scrollY, vh = document.documentElement.clientHeight, band = y + headH / 2;
      fxItems.forEach(function (it) {
        if (!it.h) return;   // a hidden view of a page (display: none) has nothing to move
        // a dark ground (D99) under the header's middle turns the header to the ground's colours (CSS: html.on-dark)
        if (it.dark) root.classList.toggle('on-dark', band >= it.y && band < it.y + it.h);
        if (it.kind === 'centre') {
          var d = clamp((it.y + it.h / 2 - y - vh / 2) / ((vh + it.h) / 2), -1, 1);
          if (Math.abs(d - it.d) < 0.001) return;
          it.d = d; it.el.style.setProperty('--d', d.toFixed(4));
          if (it.scrub) it.scrub.to((1 - d) / 2);
          return;
        }
        var p = it.kind === 'track' ? (y - it.y) / Math.max(1, it.h - vh)
          : (y + vh - it.y) / (vh + it.h);
        p = clamp(p, 0, 1);
        if (it.steps.length) chapter(it, p);
        if (Math.abs(p - it.p) < 0.001) return;
        it.p = p;
        if (FX) it.el.style.setProperty('--p', p.toFixed(4));
        if (it.scrub) it.scrub.to(p);
      });
    };
    var fxQueued = false;
    window.addEventListener('scroll', function () {
      if (fxQueued) return;
      fxQueued = true;
      requestAnimationFrame(function () { fxQueued = false; fxUpdate(); });
    }, { passive: true });
    // re-measured once the layout settles, never on every observed change in a burst (A5)
    var measureTimer = 0;
    var measureSoon = function () { clearTimeout(measureTimer); measureTimer = setTimeout(measure, 120); };
    window.addEventListener('resize', measureSoon);
    if ('ResizeObserver' in window) new ResizeObserver(measureSoon).observe(document.body);
    measure();
  }

  /* ------------------------------------------------------------ the scrubbed films (orientation, D96)
     A video[data-scrub] inside a track or centre item follows the scroll: its time eases toward the reading
     position (0.12 of the gap per frame, the Scroll map's weighted scrub), a new seek only once the last has
     landed (A2). Under the poster until its first frame lands, so the first paint is always the poster. A fine
     pointer, or a touch screen from 48rem, scrubs (the small file on touch); a narrow touch screen, reduced
     motion, saved data or no script keep the poster (A4, D101: a loop there would have nothing to pause it).
     A seek that never lands within 1.5 s leaves the poster in place. Safari on iOS: UNVERIFIED (no WebKit here). */
  var fineQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  var saveData = navigator.connection && navigator.connection.saveData;
  // a narrow touch screen keeps the poster: a looping film there would move with nothing to pause it (WCAG 2.2.2, D101)
  var scrubVideos = FX && !saveData && (fineQ.matches || window.matchMedia('(min-width: 48rem)').matches) ? slice(document.querySelectorAll('video[data-scrub]')) : [];
  if (scrubVideos.length) {
    var films = [];
    var running = false;
    var tick = function () {
      running = false;
      films.forEach(function (f) {
        if (!f.ready) return;
        var gap = f.target - f.t;
        f.t = Math.abs(gap) < 0.002 ? f.target : f.t + gap * 0.12;
        if (!f.v.seeking && Math.abs(f.v.currentTime - f.t) > 1 / 60) {
          f.v.currentTime = f.t;
          if (!f.live && !f.watch) f.watch = setTimeout(function () { if (!f.live) { f.ready = false; f.dead = true; console.warn('scrub: no frame landed, the poster stays'); } }, 1500);
        }
        if (f.t !== f.target || f.v.seeking) running = true;
      });
      if (running) requestAnimationFrame(tick);
    };
    scrubKick = function () { if (!running) { running = true; requestAnimationFrame(tick); } };
    scrubVideos.forEach(function (v) {
      var host = v.closest('[data-fx]');
      var it = fxItems.filter(function (x) { return x.el === host; })[0];
      var f = { v: v, frame: v.parentNode, t: 0, target: 0, frac: 0, ready: false, live: false, watch: 0,
        to: function (frac) { f.frac = frac; if (f.ready) { f.target = frac * v.duration; scrubKick(); } } };
      if (it) {
        it.scrub = f;
        // a page opened part-way down (a reload, Back) starts the film where the reader already is
        f.frac = it.kind === 'centre' ? (it.d <= 1 ? (1 - it.d) / 2 : 0) : Math.max(0, it.p);
      }
      films.push(f);
      var show = function () { if (f.live || f.dead) return; f.live = true; clearTimeout(f.watch); f.frame.classList.add('is-live'); };
      v.muted = true;
      v.setAttribute('playsinline', '');
      v.addEventListener('seeked', show);
      v.addEventListener('loadeddata', function () {
        // one play and pause primes a phone's decoder for seeking; the time then belongs to the scroll
        var go = function () { v.pause(); f.ready = true; f.to(f.frac); };
        var pr = v.play(); if (pr && pr.then) pr.then(go, go); else go();
      }, { once: true });
      v.src = v.getAttribute(fineQ.matches ? 'data-src' : 'data-src-small') || v.getAttribute('data-src');
    });
    // loaded once the page is idle, after its first paint and its images (the poster is the largest paint)
    var loadFilms = function () {
      scrubVideos.forEach(function (v) {
        v.preload = 'auto'; v.load();
      });
    };
    var whenIdle = function () { if ('requestIdleCallback' in window) window.requestIdleCallback(loadFilms, { timeout: 2500 }); else setTimeout(loadFilms, 1200); };
    if (document.readyState === 'complete') whenIdle(); else window.addEventListener('load', whenIdle, { once: true });
  }

  /* ------------------------------------------------------------ the label that follows the pointer (feedback, D97)
     dmcg's pill: on a fine pointer, an element with data-label names itself beside the cursor. Decorative
     (aria-hidden): the link it sits on already carries the same name. */
  if (FX && fineQ.matches && document.querySelector('[data-label]')) {
    var pill = document.createElement('div');
    pill.className = 'pill-label'; pill.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pill);
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest && e.target.closest('[data-label]');
      if (t) pill.textContent = t.getAttribute('data-label');
      pill.classList.toggle('is-on', !!t);
    });
    document.addEventListener('pointermove', function (e) { pill.style.translate = (e.clientX + 16) + 'px ' + (e.clientY + 18) + 'px'; }, { passive: true });
    root.addEventListener('pointerleave', function () { pill.classList.remove('is-on'); });
  }

  /* ------------------------------------------------------------ arrival (hierarchy, D76)
     Groups that start below the fold arrive once, after their images decode: each plate rises from its
     ground line inside its own frame, the cells of a row or series in order, and the words that belong to
     a plate follow it (the motion itself is CSS, keyed to .is-in). The whole group arrives together, so a
     figure's key and caption never show before its drawings. Nothing above the fold is touched, and
     nothing is hidden if this script never runs. */
  var groups = slice(document.querySelectorAll('[data-rv]'));
  if (groups.length && 'IntersectionObserver' in window && !reduce.matches) {
    var cellsOf = function (el) { return slice(el.querySelectorAll('.row > .cell, .cells > .cell')); };
    var arrive = function (g) { g.classList.add('is-in'); cellsOf(g).forEach(function (c) { c.classList.add('is-in'); }); };
    var decoded = function (el) {
      var waits = slice(el.querySelectorAll('img')).map(function (i) { return i.decode ? i.decode().catch(function () {}) : null; });
      return Promise.race([Promise.all(waits), new Promise(function (r) { setTimeout(r, 700); })]);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        decoded(en.target).then(function () { requestAnimationFrame(function () { arrive(en.target); }); });
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    // reached by the keyboard before its turn: shown at once, never animating under a focus ring
    document.addEventListener('focusin', function (e) {
      var g = e.target.closest && e.target.closest('.rv-g:not(.is-in)'); if (!g) return;
      g.classList.add('rv--now'); arrive(g);
    });
    groups.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('rv-g');
      cellsOf(el).forEach(function (c, i) { c.classList.add('rv'); c.style.setProperty('--i', String(i)); });
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------ smooth scroll (orientation, D79)
     The owner's request: wheel and trackpad scrolling glide with inertia, as on the reference sites. Lenis
     (vendored, MIT, 5.6 KB gzipped) eases the page's own scroll position, so the fixed header, the arrivals,
     find-in-page, the keyboard and the back button behave exactly as native. It loads only for a fine
     pointer without reduced motion: touch keeps the device's own inertia, and reduced motion keeps native,
     unsmoothed scrolling. An open dialog holds the page still and scrolls on its own. A link to a place on
     the page glides there on the in-out curve, then updates the address and moves focus, as a jump would. */
  var jump = function (y) { window.scrollTo({ top: y, behavior: 'instant' }); };   // an instant move; through Lenis once it runs
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (thisScript && !reduce.matches && fine.matches) {
    var lenisScript = document.createElement('script');
    lenisScript.src = new URL('vendor/lenis-1.3.26.min.js', thisScript.src).href;
    lenisScript.async = true;
    lenisScript.onload = function () {
      if (typeof window.Lenis !== 'function') return;
      // lerp 0.08 (D83): between Format's 0.1 and huyml's 0.075, a gentler settle that still answers the wheel
      var lenis = new window.Lenis({ autoRaf: true, lerp: 0.08, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, stopInertiaOnNavigate: true });
      lenis.on('scroll', fxUpdate);   // scroll-linked values in the frame Lenis moves the page, never one behind
      jump = function (y) { lenis.scrollTo(y, { immediate: true, force: true }); };
      // reduced motion switched on during the visit: native, unsmoothed scrolling from then on (every handler
      // below lets the browser act as usual once the engine is gone)
      var live = true;
      if (reduce.addEventListener) reduce.addEventListener('change', function (e) {
        if (!e.matches || !live) return;
        live = false;
        lenis.destroy();
        jump = function (y) { window.scrollTo({ top: y, behavior: 'instant' }); };
      });
      // a dialog (menu, viewer) holds the page still; the page resumes where it was when the last one closes
      var dialogs = slice(document.querySelectorAll('dialog'));
      var hold = function () { if (!live) return; if (dialogs.some(function (d) { return d.open; })) lenis.stop(); else lenis.start(); };
      dialogs.forEach(function (d) { new MutationObserver(hold).observe(d, { attributes: true, attributeFilter: ['open'] }); });
      // a key that scrolls or moves focus takes over from a glide still settling, where the page is, so the
      // browser's own keyboard scroll (and scrolling a focused element into view) is never fought
      var KEYS = { ArrowUp: 1, ArrowDown: 1, PageUp: 1, PageDown: 1, Home: 1, End: 1, ' ': 1, Tab: 1 };
      document.addEventListener('keydown', function (e) {
        if (live && KEYS[e.key] && lenis.isScrolling === 'smooth' && !(e.target.closest && e.target.closest('input, textarea, select, [contenteditable], dialog'))) {
          lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        }
      }, true);
      var inOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!live || !a || a.classList.contains('skip') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var id = decodeURIComponent(a.getAttribute('href').slice(1));
        var el = id && document.getElementById(id);
        if (!el || el.closest('dialog')) return;
        e.preventDefault();
        // the target from the page's true position now (a scroll just before the click may not have reached
        // Lenis yet), less the scroll padding that keeps it clear of the fixed header, as a native jump does
        var y = (el.hasAttribute('data-fx') ? naturalTop(el) : el.getBoundingClientRect().top + window.scrollY) - (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
        // the address and focus change at once, as a jump would: Back then returns to where the reader
        // clicked, the next Tab starts from the target, and an interrupted glide loses neither
        if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
        if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
        lenis.scrollTo(y, { duration: 1.1, easing: inOut, force: true });
      });
    };
    document.head.appendChild(lenisScript);
  }

  // reduced motion switched on during the visit: the scroll-linked styles let go (everything returns to its
  // settled place)
  if (reduce.addEventListener) reduce.addEventListener('change', function (e) {
    if (!e.matches) return;
    root.classList.remove('fx');
    if (films) films.forEach(function (f) { f.ready = false; f.dead = true; });
    scrubVideos.forEach(function (v) { v.pause(); v.removeAttribute('src'); v.load(); v.parentNode.classList.remove('is-live'); });
  });

  /* ------------------------------------------------------------ the column's way into a project (orientation, D97)
     Leaving the home for a project, only the chosen item's render and title take the names that carry them into
     the project's page (dmcg's genie): names on all fifteen would capture every item for the transition. */
  window.addEventListener('pageswap', function (e) {
    var to = e.viewTransition && e.activation && e.activation.entry && e.activation.entry.url;
    if (!to) return;
    slice(document.querySelectorAll('a.col__a')).forEach(function (a) {
      if (a.href !== to) return;
      var slug = to.replace(/^.*project-|\.html.*$/g, '');
      var card = a.querySelector('.col__card:not(.col__film)'), t = a.querySelector('.col__t');
      if (card) card.style.viewTransitionName = 'hero-' + slug;
      t.style.viewTransitionName = 'title-' + slug;
      t.style.viewTransitionClass = 'vt-title';
    });
  });

  /* ------------------------------------------------------------ the index's views and families (state, D98)
     The page holds the grid, the tree and the list; the bar shows one view and one family (dmcg's catalog) and
     keeps both in the address, so a link or Back returns to the same view. The tree needs room: under 48rem it
     gives way to the grid. A tile a filter brings back rises into place once (feedback). */
  var ixBar = document.querySelector('.ix-bar');
  if (ixBar) {
    var ixViews = slice(document.querySelectorAll('[data-view]'));
    var ixTiles = slice(document.querySelectorAll('.tile'));
    var ixWide = window.matchMedia('(min-width: 48rem)');
    var ixState = { view: 'grid', family: 'all' };
    var ixStatus = document.querySelector('[data-ix-status]');
    var ixQuery = new URLSearchParams(location.search);
    if (/^(grid|tree|list)$/.test(ixQuery.get('view'))) ixState.view = ixQuery.get('view');
    if (/^(all|drawing|render|film)$/.test(ixQuery.get('family'))) ixState.family = ixQuery.get('family');
    var ixApply = function (first) {
      var view = ixState.view === 'tree' && !ixWide.matches ? 'grid' : ixState.view;
      ixViews.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== view; });
      document.body.setAttribute('data-ix-view', view);
      ixTiles.forEach(function (t) {
        var on = ixState.family === 'all' || t.getAttribute('data-kind') === ixState.family;
        if (on && t.hidden && !first && !reduce.matches) { t.classList.remove('is-entering'); void t.offsetWidth; t.classList.add('is-entering'); }
        t.hidden = !on;
      });
      slice(document.querySelectorAll('[data-branch]')).forEach(function (b) { b.hidden = b.getAttribute('data-branch') !== ixState.family; });
      var shown = ixTiles.filter(function (t) { return !t.hidden; }), seen = {};
      ixTiles.forEach(function (t) { if (t.id) t.removeAttribute('id'); });
      shown.forEach(function (t) { var l = t.getAttribute('data-l'); if (!seen[l]) { seen[l] = 1; t.id = 'az-' + l; } });
      slice(document.querySelectorAll('.az li')).forEach(function (li) { li.hidden = !seen[li.textContent.trim()]; });
      if (!first && ixStatus) ixStatus.textContent = (view === 'list' ? document.querySelectorAll('.ix-table tbody tr').length + ' projects, list view' : shown.length + ' images, ' + (ixState.family === 'all' ? 'all kinds' : ixState.family + 's') + ', ' + view + ' view');
      slice(document.querySelectorAll('button[data-family]')).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-family') === ixState.family)); });
      slice(document.querySelectorAll('[data-view-btn]')).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view-btn') === view)); });
      if (!first) {
        var u = new URLSearchParams(location.search); u.set('view', view); u.set('family', ixState.family);
        history.replaceState(null, '', location.pathname + '?' + u.toString() + location.hash);
      }
      if (typeof measureSoon === 'function') measureSoon();   // the engine measures what is shown now
    };
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-family], button[data-view-btn]');
      if (!b) return;
      if (b.hasAttribute('data-view-btn')) ixState.view = b.getAttribute('data-view-btn'); else ixState.family = b.getAttribute('data-family');
      ixApply(false);
    });
    if (ixWide.addEventListener) ixWide.addEventListener('change', function () { ixApply(true); });
    ixBar.hidden = false;
    ixApply(true);
  }

  /* ------------------------------------------------------------ figure viewer (orientation, state)
     Links to the full-size file work without JS. Here every [data-viewer] link on the page becomes one
     gallery: the image grows out of the clicked picture and shrinks back into it (same path), on the
     critically damped spring; arrows, swipe and the buttons move between figures (crossfade). */
  var viewer = document.getElementById('viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    var links = slice(document.querySelectorAll('[data-viewer]'));
    var stage = viewer.querySelector('.viewer__stage');
    var vTitle = viewer.querySelector('.viewer__title');
    var vCount = viewer.querySelector('.viewer__count');
    var vToggle = viewer.querySelector('[data-viewer-toggle]');
    var vPrev = viewer.querySelector('[data-viewer-prev]');
    var vNext = viewer.querySelector('[data-viewer-next]');
    var vClose = viewer.querySelector('form[method="dialog"] button');
    var vProject = viewer.querySelector('[data-viewer-project]');
    vTitle.setAttribute('aria-live', 'polite');
    var cur = -1, img = null, actual = false, busy = false, returnTo = null;
    var spring = function () { return css('--spring') || 'cubic-bezier(0.16, 1, 0.3, 1)'; };
    var DUR = 660;
    var tf = function (t) { return 'translate(' + t.x + 'px, ' + t.y + 'px) scale(' + t.s + ')'; };

    var info = function (k) {
      var a = links[k];
      return { a: a, w: +a.getAttribute('data-w'), h: +a.getAttribute('data-h'), full: a.getAttribute('data-webp') || a.getAttribute('href'),
        title: a.getAttribute('data-title') || '', alt: a.getAttribute('data-alt') || '', dark: a.getAttribute('data-dark') || '',
        keep: a.getAttribute('data-keep') || '' };
    };
    // the figure's dark treatment (D50, D69) travels with its own image box, so a crossfade never re-treats the outgoing one
    var TREAT = { field: 'is-inspection', invert: 'is-invert', 'invert-accent': 'is-invert-accent', keep: 'is-keep' };
    // labels re-set from the drawing (D49) keep the page's proportion (1.15% of the drawing's width, the wide layout);
    // where that falls under 13px on screen they wait for actual size
    var LAB = 0.0115, LAB_MIN = 13;
    var sizeLabels = function (s) {
      viewer.classList.toggle('is-small-labels', !!img && img.hasAttribute('data-labels') && info(cur).w * LAB * s < LAB_MIN);
    };
    var fit = function (it) {
      var r = stage.getBoundingClientRect();
      var s = Math.min(r.width / it.w, r.height / it.h, 1);   // never above native pixels
      return { x: (r.width - it.w * s) / 2, y: (r.height - it.h * s) / 2, s: s };
    };
    var sourceRect = function (it) {
      var thumb = it.a.querySelector('img');
      var r = (thumb || it.a).getBoundingClientRect(), s = stage.getBoundingClientRect();
      var visible = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
      return visible ? { x: r.left - s.left, y: r.top - s.top, s: r.width / it.w } : null;
    };
    var makeImg = function (it) {
      var box = document.createElement('div');                // the image box moves; the image and its labels move with it
      box.className = 'viewer__img' + (TREAT[it.dark] ? ' ' + TREAT[it.dark] : '');
      box.style.width = it.w + 'px'; box.style.height = it.h + 'px';
      var el = document.createElement('img');
      var thumb = it.a.querySelector('img');
      el.alt = it.alt;
      el.width = it.w; el.height = it.h;
      el.src = (thumb && thumb.currentSrc) || it.full;     // instant: the picture already on screen
      if (el.src !== new URL(it.full, document.baseURI).href) { // then the full-size file, swapped once decoded
        var hi = new Image(); hi.src = it.full;
        (hi.decode ? hi.decode() : Promise.resolve()).then(function () { if (el.isConnected) el.src = it.full; }).catch(function () {});
      }
      box.appendChild(el);
      if (it.keep) {                                           // the solid rendered regions, shown over the inverted drawing in the dark scheme
        var kp = document.createElement('img');
        kp.className = 'viewer__keep'; kp.alt = ''; kp.width = it.w; kp.height = it.h; kp.src = it.keep;
        box.appendChild(kp);
      }
      var lab = it.a.closest('.lab'), list = lab && lab.querySelector('.lab__list');
      if (list) {
        var labs = list.cloneNode(true);
        labs.className = 'viewer__labs';
        labs.style.fontSize = (it.w * LAB) + 'px';
        box.appendChild(labs); box.setAttribute('data-labels', '');
      }
      return box;
    };
    var label = function () {
      var it = info(cur);
      vTitle.textContent = it.title + ', image ' + (cur + 1) + ' of ' + links.length;
      vCount.textContent = (cur + 1) + ' / ' + links.length;
      vPrev.setAttribute('aria-disabled', String(cur === 0)); vNext.setAttribute('aria-disabled', String(cur === links.length - 1));
      vToggle.hidden = fit(it).s >= 1;
      var proj = it.a.getAttribute('data-href');   // the index's tiles open their project from the viewer (A6)
      if (vProject) { vProject.hidden = !proj; if (proj) vProject.href = proj; }
    };
    var animate = function (el, from, to, dur) {
      el.style.transform = tf(to);
      if (reduce.matches || !el.animate || !from) return Promise.resolve();
      return el.animate([{ transform: tf(from) }, { transform: tf(to) }], { duration: dur || DUR, easing: spring() }).finished.catch(function () {});
    };
    var resetToggle = function () {
      actual = false; viewer.classList.remove('is-actual'); vToggle.querySelector('span').textContent = 'actual size';
    };
    var setActual = function (on) {
      if (!img || busy) return;
      var it = info(cur);
      if (on && fit(it).s >= 1) return;                       // already at native pixels
      actual = on;
      viewer.classList.toggle('is-actual', on);
      vToggle.querySelector('span').textContent = on ? 'fit to screen' : 'actual size';
      sizeLabels(on ? 1 : fit(it).s);
      if (on) {
        img.style.transform = 'none'; img.style.position = 'relative';
        requestAnimationFrame(function () {
          stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
          stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
        });
      } else {
        img.style.position = ''; stage.scrollLeft = 0; stage.scrollTop = 0; img.style.transform = tf(fit(it));
      }
    };
    var show = function (k, dir) {                            // move between figures: a short crossfade
      if (k < 0 || k >= links.length || k === cur || busy) return;
      var old = img, prev = cur; cur = k; resetToggle();
      if (old) { old.style.position = ''; old.style.transform = tf(fit(info(prev))); }   // leaving actual size: fade out from its fitted place
      stage.scrollLeft = 0; stage.scrollTop = 0;
      var it = info(k); img = makeImg(it); img.style.transform = tf(fit(it)); stage.appendChild(img); label(); sizeLabels(fit(it).s);
      if (reduce.matches || !img.animate) { if (old) old.remove(); return; }
      img.animate([{ opacity: 0, translate: (dir * 24) + 'px 0' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: css('--ease-out') });
      if (old) {
        var gone = function () { old.remove(); };
        old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: css('--ease-out'), fill: 'forwards' }).finished.then(gone, gone);
      }
    };
    var open = function (k) {
      returnTo = links[k]; cur = k; resetToggle();
      stage.textContent = '';
      viewer.showModal();
      var it = info(k);
      img = makeImg(it); stage.appendChild(img); label(); sizeLabels(fit(it).s);
      busy = true; viewer.classList.add('is-moving');
      animate(img, sourceRect(it), fit(it)).then(function () { busy = false; viewer.classList.remove('is-moving'); });
    };
    var closeViewer = function () {
      if (busy || !viewer.open) return;
      closeTarget();
      var it = info(cur);
      var target = actual ? null : sourceRect(it);
      if (!target || reduce.matches) { viewer.close(); return; }
      busy = true;
      viewer.classList.add('is-moving', 'is-closing');
      animate(img, fit(it), target, 480).then(function () {
        busy = false; viewer.classList.remove('is-moving', 'is-closing'); viewer.close();
      });
    };

    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-viewer]');
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      // the gallery is what the reader can see: a filtered index leaves its hidden tiles out (A6)
      links = slice(document.querySelectorAll('[data-viewer]')).filter(function (x) { return x.getClientRects().length > 0; });
      open(links.indexOf(a));
    });
    vClose.addEventListener('click', function (e) { e.preventDefault(); closeViewer(); });
    viewer.addEventListener('cancel', function (e) { e.preventDefault(); closeViewer(); });
    viewer.addEventListener('close', function () {
      stage.textContent = ''; img = null; cur = -1; busy = false; viewer.classList.remove('is-small-labels');
      if (returnTo) { var r = returnTo.getBoundingClientRect(); returnTo.focus({ preventScroll: r.bottom > 0 && r.top < window.innerHeight }); returnTo = null; }
    });
    vPrev.addEventListener('click', function () { show(cur - 1, -1); });
    vNext.addEventListener('click', function () { show(cur + 1, 1); });
    var closeTarget = function () { returnTo = links[cur] || returnTo; };
    vToggle.addEventListener('click', function () { setActual(!actual); });
    stage.addEventListener('dblclick', function () { setActual(!actual); });
    viewer.addEventListener('keydown', function (e) {
      if (actual || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, -1); }
    });
    window.addEventListener('resize', function () { if (img && viewer.open && !actual) { var f = fit(info(cur)); img.style.transform = tf(f); sizeLabels(f.s); } });

    /* pointer: swipe between figures when fitted (follows the gesture's direction); drag to pan at actual size */
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop, time: Date.now() };
      if (actual && e.pointerType !== 'touch') { stage.setPointerCapture(e.pointerId); stage.classList.add('is-dragging'); e.preventDefault(); }
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag || !actual || e.pointerType === 'touch') return;
      stage.scrollLeft = drag.l - (e.clientX - drag.x);
      stage.scrollTop = drag.t - (e.clientY - drag.y);
    });
    stage.addEventListener('pointerup', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y, v = Math.abs(dx) / Math.max(1, Date.now() - drag.time);
      if (!actual && Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 60 || v > 0.5)) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      drag = null; stage.classList.remove('is-dragging');
    });
    stage.addEventListener('pointercancel', function () { drag = null; stage.classList.remove('is-dragging'); });
  }

  /* ------------------------------------------------------------ analytics
     GA4 is loaded once the page is idle, so it never competes with the first render. */
  var ga = root.getAttribute('data-ga');
  var optOut = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  if (ga && !optOut) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga);
    var loadGa = function () {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga);
      document.head.appendChild(s);
    };
    var idle = function () { if ('requestIdleCallback' in window) window.requestIdleCallback(loadGa, { timeout: 4000 }); else setTimeout(loadGa, 2000); };
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });
  }
})();
