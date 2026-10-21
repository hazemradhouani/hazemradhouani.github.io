/* Hazem Radhouani · site.js ("Field", docs/flagship/08-direction.md)
   Progressive enhancement only: every page reads, navigates, opens full-size images and plays films
   without it. Modules: menu dialog, compact bar, arrival, figure viewer, contact form, analytics.
   Every motion has a stated purpose and is skipped under prefers-reduced-motion. No dependencies. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var thisScript = document.currentScript;   // this file, so a vendored script is found beside it at any depth
  var css = function (name) { return getComputedStyle(root).getPropertyValue(name).trim(); };
  var slice = function (list) { return Array.prototype.slice.call(list); };

  /* ------------------------------------------------------------ theme (preference, state)
     The inline bootstrap sets data-theme before CSS is parsed. This controller only synchronises
     the three visible controls, persists an explicit choice when storage is available, and keeps
     the browser chrome colour in step. A failed storage read/write is deliberately non-fatal. */
  var themeControls = slice(document.querySelectorAll('[data-theme-toggle]'));
  var themeMeta = document.getElementById('theme-color');
  var themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  var explicitTheme = null;
  try {
    var savedTheme = window.localStorage.getItem('hazem-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') explicitTheme = savedTheme;
  } catch (e) {}
  var currentTheme = function () { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; };
  var applyTheme = function (theme, persist) {
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
    if (persist) {
      explicitTheme = dark ? 'dark' : 'light';
      try { window.localStorage.setItem('hazem-theme', explicitTheme); } catch (e) {}
    }
  };
  applyTheme(currentTheme(), false);
  themeControls.forEach(function (button) {
    button.addEventListener('click', function () { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true); });
  });
  var followSystemTheme = function (event) { if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light', false); };
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
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) menu.close(); });
    menu.addEventListener('close', function () { (opener && !opener.closest('[inert]') ? opener : menuButtons[0]).focus(); });
    var wide = window.matchMedia('(min-width: 48rem)');
    var onWide = function () { if (wide.matches && menu.open) menu.close(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  /* ------------------------------------------------------------ compact bar (wayfinding)
     Slides in when the reader scrolls back up a long page, so the nav is one gesture away; it hides
     on scroll-down and whenever focus moves into the page, so it never covers a focused element. */
  var bar = document.getElementById('bar');
  var header = document.querySelector('.site-header');
  if (bar && header) {
    var shown = false, anchor = window.scrollY, ticking = false, quietUntil = 0;
    var setBar = function (on) {
      if (on === shown || (!on && bar.contains(document.activeElement))) return;
      shown = on;
      bar.classList.toggle('is-shown', on);
      if (on) bar.removeAttribute('inert'); else bar.setAttribute('inert', '');
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.scrollY;
        if (y < header.offsetHeight + 400) { setBar(false); anchor = y; return; }
        if (y > anchor) { anchor = y; setBar(false); }              // going down: follow, keep hidden
        else if (y < anchor - 40 && Date.now() > quietUntil) setBar(true);  // 40px back up: show
      });
    }, { passive: true });
    document.addEventListener('focusin', function (e) {
      if (bar.contains(e.target) || e.target.closest('dialog')) return;
      quietUntil = Date.now() + 600; anchor = window.scrollY; setBar(false);
    });
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
     (vendored, MIT, 5.6 KB gzipped) eases the page's own scroll position, so the compact bar, the arrivals,
     find-in-page, the keyboard and the back button behave exactly as native. It loads only for a fine
     pointer without reduced motion: touch keeps the device's own inertia, and reduced motion keeps native,
     unsmoothed scrolling. An open dialog holds the page still and scrolls on its own. A link to a place on
     the page glides there on the in-out curve, then updates the address and moves focus, as a jump would. */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (thisScript && !reduce.matches && fine.matches) {
    var lenisScript = document.createElement('script');
    lenisScript.src = new URL('vendor/lenis-1.3.26.min.js', thisScript.src).href;
    lenisScript.async = true;
    lenisScript.onload = function () {
      if (typeof window.Lenis !== 'function') return;
      var lenis = new window.Lenis({ autoRaf: true, lerp: 0.1, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, stopInertiaOnNavigate: true });
      // a dialog (menu, viewer) holds the page still; the page resumes where it was when the last one closes
      var dialogs = slice(document.querySelectorAll('dialog'));
      var hold = function () { if (dialogs.some(function (d) { return d.open; })) lenis.stop(); else lenis.start(); };
      dialogs.forEach(function (d) { new MutationObserver(hold).observe(d, { attributes: true, attributeFilter: ['open'] }); });
      // a key that scrolls or moves focus takes over from a glide still settling, where the page is, so the
      // browser's own keyboard scroll (and scrolling a focused element into view) is never fought
      var KEYS = { ArrowUp: 1, ArrowDown: 1, PageUp: 1, PageDown: 1, Home: 1, End: 1, ' ': 1, Tab: 1 };
      document.addEventListener('keydown', function (e) {
        if (KEYS[e.key] && lenis.isScrolling === 'smooth' && !(e.target.closest && e.target.closest('input, textarea, select, [contenteditable], dialog'))) {
          lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        }
      }, true);
      var inOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || a.classList.contains('skip') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var id = decodeURIComponent(a.getAttribute('href').slice(1));
        var el = id && document.getElementById(id);
        if (!el || el.closest('dialog')) return;
        e.preventDefault();
        // the target from the page's true position now (a scroll just before the click may not have reached
        // Lenis yet), less the scroll padding that keeps it clear of the compact bar, as a native jump does
        var y = el.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0);
        lenis.scrollTo(y, { duration: 1.1, easing: inOut, force: true, onComplete: function () {
          if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
          if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
        } });
      });
    };
    document.head.appendChild(lenisScript);
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

  /* ------------------------------------------------------------ contact form (feedback)
     Same FormSubmit endpoint and payload as before; inline field errors, a busy state and a polite status. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  slice(document.querySelectorAll('form[data-contact]')).forEach(function (form) {
    var statusEl = form.querySelector('.form__status');
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.querySelector('span');
    var get = function (n) { return form.elements.namedItem(n); };
    var fields = ['name', 'email', 'subject', 'message'];
    var messages = { name: 'Enter your name.', email: 'Enter your email address.', subject: 'Enter a subject.', message: 'Enter your message.' };
    var setError = function (input, msg) {
      var err = document.getElementById(input.id + '-err');
      if (msg) { input.setAttribute('aria-invalid', 'true'); err.textContent = msg; err.hidden = false; }
      else { input.removeAttribute('aria-invalid'); err.textContent = ''; err.hidden = true; }
    };
    var say = function (msg, isError) { statusEl.textContent = msg; statusEl.classList.toggle('is-error', !!isError); };
    fields.forEach(function (n) {
      get(n).addEventListener('input', function () { if (this.getAttribute('aria-invalid') === 'true') setError(this, ''); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;
      var hp = get('_honey');
      if (hp && hp.value) { say('Message sent.', false); return; }
      var values = {}; var firstBad = null;
      fields.forEach(function (n) {
        var input = get(n); var v = input.value.trim(); values[n] = v; var msg = '';
        if (!v) msg = messages[n];
        else if (n === 'email' && !EMAIL.test(v)) msg = 'Enter a valid email address, like name@example.com.';
        setError(input, msg);
        if (msg && !firstBad) firstBad = input;
      });
      if (firstBad) {
        var onlyEmail = values.name && values.subject && values.message && values.email;
        say(onlyEmail ? 'Please enter a valid email address.' : 'Please fill in all fields.', true);
        firstBad.focus();
        return;
      }
      var data = new FormData();
      data.append('name', values.name); data.append('email', values.email);
      data.append('subject', values.subject); data.append('message', values.message);
      data.append('_subject', (form.getAttribute('data-subject-prefix') || 'Portfolio enquiry from ') + values.name + ': ' + values.subject);
      data.append('_template', 'none'); data.append('_captcha', 'false'); data.append('_replyto', values.email);
      form.setAttribute('aria-busy', 'true'); btn.setAttribute('aria-disabled', 'true'); btnLabel.textContent = 'Sending…'; say('', false);
      var done = function (msg, isError) { form.removeAttribute('aria-busy'); btn.removeAttribute('aria-disabled'); btnLabel.textContent = 'Send'; say(msg, isError); };
      fetch(form.getAttribute('action'), { method: 'POST', headers: { Accept: 'application/json' }, body: data })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && (res.body.success === 'true' || res.body.success === true)) { form.reset(); done('Message sent. I will be in touch shortly.', false); }
          else done('Something went wrong. Please email hazemradhouani@gmail.com directly.', true);
        })
        .catch(function () { done('Network error. Please email hazemradhouani@gmail.com directly.', true); });
    });
  });

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
