/* Hazem Radhouani · site.js
   Progressive enhancement only: every page reads, navigates and plays films without it.
   Modules: menu dialog, figure viewer, work register (filters + preview), draw-on-view,
   contact forms. No dependencies. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* placeholder <picture><img> is created on first use, so the markup has no src-less image */
  var ensureImg = function (box) {
    var img = box.querySelector("img");
    if (!img) { var pic = document.createElement("picture"); img = document.createElement("img"); img.alt = ""; img.decoding = "async"; pic.appendChild(img); box.appendChild(pic); }
    return img;
  };

  /* <picture> sources are created on demand so the markup never carries empty srcsets */
  var setSources = function (img, avif, webp) {
    var pic = img.parentNode;
    Array.prototype.slice.call(pic.querySelectorAll('source')).forEach(function (s) { pic.removeChild(s); });
    [['image/avif', avif], ['image/webp', webp]].forEach(function (t) {
      if (!t[1]) return;
      var s = document.createElement('source');
      s.type = t[0];
      s.srcset = t[1];
      pic.insertBefore(s, img);
    });
  };

  /* ------------------------------------------------------------ menu (phones)
     Chromium opens the dialog natively through commandfor/command; other browsers
     get the same call here. Esc and the Close button (form method="dialog") are native. */
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.menu-button');
  if (menu && menuBtn && typeof menu.showModal === 'function') {
    var nativeCommand = 'command' in HTMLButtonElement.prototype;
    if (!nativeCommand) {
      menuBtn.addEventListener('click', function () { if (!menu.open) menu.showModal(); });
    }
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) menu.close();
    });
    menu.addEventListener('close', function () { menuBtn.focus(); });
    var wide = window.matchMedia('(min-width: 768px)');
    var onWide = function () { if (wide.matches && menu.open) menu.close(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  /* ------------------------------------------------------------ figure viewer
     Links to the original file work without JS; here they open a modal viewer
     with fit / actual-size modes and drag-to-pan. */
  var viewer = document.getElementById('viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    var stage = viewer.querySelector('.viewer__stage');
    var vImg = null;
    var vTitle = viewer.querySelector('.viewer__title');
    var vToggle = viewer.querySelector('[data-viewer-toggle]');
    var opener = null;

    var setActual = function (on) {
      viewer.classList.toggle('is-actual', on);
      vToggle.setAttribute('aria-pressed', String(on));
      vToggle.querySelector('span').textContent = on ? 'Fit to screen' : 'Actual size';
      if (on) {
        requestAnimationFrame(function () {
          stage.scrollLeft = (stage.scrollWidth - stage.clientWidth) / 2;
          stage.scrollTop = (stage.scrollHeight - stage.clientHeight) / 2;
        });
      }
    };

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-viewer]');
      if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      opener = a.getAttribute('tabindex') === '-1'
        ? a.closest('.fig').querySelector('.fig__zoom') || a
        : a;
      vImg = vImg || ensureImg(stage);
      setSources(vImg, a.getAttribute('data-avif'), a.getAttribute('data-webp'));
      vImg.src = a.getAttribute('href');
      vImg.alt = a.getAttribute('data-alt') || '';
      var w = +a.getAttribute('data-w');
      var h = +a.getAttribute('data-h');
      if (w && h) { vImg.width = w; vImg.height = h; } else { vImg.removeAttribute('width'); vImg.removeAttribute('height'); }
      vTitle.textContent = a.getAttribute('data-title') || '';
      setActual(false);
      viewer.showModal();
    });
    vToggle.addEventListener('click', function () { setActual(!viewer.classList.contains('is-actual')); });
    stage.addEventListener('dblclick', function () { setActual(!viewer.classList.contains('is-actual')); });
    viewer.addEventListener('close', function () {
      if (opener) opener.focus();
      opener = null;
    });

    /* drag to pan in actual-size mode (mouse and pen; touch scrolls natively) */
    var drag = null;
    stage.addEventListener('pointerdown', function (e) {
      if (!viewer.classList.contains('is-actual') || e.pointerType === 'touch' || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, l: stage.scrollLeft, t: stage.scrollTop };
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('is-dragging');
      e.preventDefault();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      stage.scrollLeft = drag.l - (e.clientX - drag.x);
      stage.scrollTop = drag.t - (e.clientY - drag.y);
    });
    var endDrag = function () { drag = null; stage.classList.remove('is-dragging'); };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
  }

  /* ------------------------------------------------------------ work register */
  var reg = document.querySelector('[data-register]');
  if (reg) {
    var items = Array.prototype.slice.call(reg.querySelectorAll('.register__item'));
    var filterBar = document.querySelector('.filters');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var status = document.querySelector('.register__status');
    var empty = document.querySelector('.register__empty');

    var apply = function (f) {
      var n = 0;
      items.forEach(function (li) {
        var on = f === 'all' || (' ' + li.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') !== -1;
        li.hidden = !on;
        if (on) n++;
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === f)); });
      status.textContent = 'Showing ' + n + ' of ' + items.length + ' projects';
      if (empty) empty.hidden = n !== 0;
    };
    var run = function (f, animate) {
      if (animate && document.startViewTransition && !reduce.matches) {
        items.forEach(function (li, i) { if (!li.hidden) li.style.viewTransitionName = 'row-' + i; });
        var t = document.startViewTransition(function () {
          apply(f);
          items.forEach(function (li, i) { li.style.viewTransitionName = li.hidden ? '' : 'row-' + i; });
        });
        t.finished.then(function () { items.forEach(function (li) { li.style.viewTransitionName = ''; }); });
      } else {
        apply(f);
      }
      var url = new URL(window.location.href);
      if (f === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', f);
      history.replaceState(null, '', url);
    };

    if (filterBar) {
      filterBar.hidden = false;
      status.hidden = false;
      buttons.forEach(function (b) {
        b.addEventListener('click', function () { run(b.getAttribute('data-filter'), true); });
      });
      var initial = new URL(window.location.href).searchParams.get('filter');
      if (initial && buttons.some(function (b) { return b.getAttribute('data-filter') === initial; })) apply(initial);
    }

    /* preview panel: wide screens with a fine pointer only */
    var preview = document.querySelector('.preview');
    var wideFine = window.matchMedia('(min-width: 1280px) and (hover: hover) and (pointer: fine)');
    if (preview) {
      var pImg = null;
      var pCap = preview.querySelector('.preview__cap');
      var active = null;
      var show = function (row) {
        if (!row || row === active) return;
        if (active) active.classList.remove('is-active');
        active = row;
        row.classList.add('is-active');
        pImg = pImg || ensureImg(preview.querySelector('.media'));
        setSources(pImg, row.getAttribute('data-avif'), row.getAttribute('data-webp'));
        pImg.src = row.getAttribute('data-src');
        pImg.width = +row.getAttribute('data-w');
        pImg.height = +row.getAttribute('data-h');
        pCap.textContent = row.getAttribute('data-caption');
      };
      var sync = function () {
        document.documentElement.classList.toggle('js-preview', wideFine.matches);
        if (wideFine.matches && !active) show(reg.querySelector('.register__item:not([hidden]) .register__row'));
      };
      reg.addEventListener('pointerover', function (e) {
        if (wideFine.matches) show(e.target.closest('.register__row'));
      });
      reg.addEventListener('focusin', function (e) {
        if (wideFine.matches) show(e.target.closest('.register__row'));
      });
      if (wideFine.addEventListener) wideFine.addEventListener('change', sync);
      sync();
    }
  }

  /* ------------------------------------------------------------ draw on view
     Diagrams draw their linework once, in the order of their logic. Only elements
     that start below the fold are hidden first, so nothing on screen flashes and
     nothing is hidden if this script never runs. */
  var drawables = document.querySelectorAll('[data-draw]');
  if (drawables.length && 'IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        requestAnimationFrame(function () { el.classList.add('is-drawn'); });
      });
    }, { rootMargin: '0px 0px -18% 0px', threshold: 0 });
    Array.prototype.forEach.call(drawables, function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('will-draw');
      io.observe(el);
    });
  }

  /* ------------------------------------------------------------ contact forms
     Same FormSubmit endpoint and payload as before; adds inline field errors,
     a busy state and a polite status message. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  Array.prototype.forEach.call(document.querySelectorAll('form[data-contact]'), function (form) {
    var statusEl = form.querySelector('.form__status');
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.querySelector('span');
    var get = function (n) { return form.elements.namedItem(n); };
    var fields = ['name', 'email', 'subject', 'message'];
    var messages = {
      name: 'Enter your name.',
      email: 'Enter your email address.',
      subject: 'Enter a subject.',
      message: 'Enter your message.'
    };
    var setError = function (input, msg) {
      var err = document.getElementById(input.id + '-err');
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        err.textContent = msg;
        err.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        err.textContent = '';
        err.hidden = true;
      }
    };
    var say = function (msg, isError) {
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-error', !!isError);
    };
    fields.forEach(function (n) {
      get(n).addEventListener('input', function () {
        if (this.getAttribute('aria-invalid') === 'true') setError(this, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.getAttribute('aria-busy') === 'true') return;
      var hp = get('_honey');
      if (hp && hp.value) { say('Message sent.', false); return; }

      var values = {};
      var firstBad = null;
      fields.forEach(function (n) {
        var input = get(n);
        var v = input.value.trim();
        values[n] = v;
        var msg = '';
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
      data.append('name', values.name);
      data.append('email', values.email);
      data.append('subject', values.subject);
      data.append('message', values.message);
      data.append('_subject', (form.getAttribute('data-subject-prefix') || 'Portfolio enquiry from ') + values.name + ': ' + values.subject);
      data.append('_template', 'none');
      data.append('_captcha', 'false');
      data.append('_replyto', values.email);

      form.setAttribute('aria-busy', 'true');
      btn.disabled = true;
      btnLabel.textContent = 'Sending…';
      say('', false);

      var done = function (msg, isError) {
        form.removeAttribute('aria-busy');
        btn.disabled = false;
        btnLabel.textContent = 'Send';
        say(msg, isError);
      };
      fetch(form.getAttribute('action'), { method: 'POST', headers: { Accept: 'application/json' }, body: data })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && (res.body.success === 'true' || res.body.success === true)) {
            form.reset();
            done('Message sent. I will be in touch shortly.', false);
          } else {
            done('Something went wrong. Please email hazemradhouani@gmail.com directly.', true);
          }
        })
        .catch(function () {
          done('Network error. Please email hazemradhouani@gmail.com directly.', true);
        });
    });
  });

  /* ------------------------------------------------------------ analytics
     GA4 is loaded once the page is idle, so it never competes with the first render. */
  var ga = document.documentElement.getAttribute('data-ga');
  if (ga) {
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
