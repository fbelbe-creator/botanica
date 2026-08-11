/* Botanica by Collective Space — 2026 refresh
   Shared interactions: nav, scroll reveals, counters, parallax,
   filters, accordion, lightbox, forms. Vanilla JS, no dependencies. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* -------------------------------------------------------- Contact modal */
  /* The phone icon in the header opens this instead of dialling blindly —
     on desktop a tel: link does nothing useful, so we show the number,
     the address and the trading hours, with a tap-to-call button. */
  var MODAL_HTML =
    '<div class="modal" id="contact-modal" role="dialog" aria-modal="true" aria-labelledby="cm-title" hidden>' +
      '<div class="modal__veil" data-close></div>' +
      '<div class="modal__card">' +
        '<button class="modal__x" data-close aria-label="Close">&#10005;</button>' +
        '<img class="modal__logo" src="assets/botanica-logo-full.png" alt="Botanica by Collective Space">' +
        '<h3 id="cm-title">Get in touch</h3>' +
        '<p class="dim" style="font-size:.9rem;margin:0">We\'d love to hear from you.</p>' +
        '<a class="modal__num" href="tel:0437125007">0437&nbsp;125&nbsp;007</a>' +
        '<div class="modal__rows">' +
          '<div class="modal__row"><span>Tuesday – Saturday</span><span>9am – 5pm</span></div>' +
          '<div class="modal__row"><span>Sunday &amp; Monday</span><span>Closed</span></div>' +
          '<div class="modal__row"><span>Shop 7/19 Brolga Ave</span><span>Southport QLD 4215</span></div>' +
        '</div>' +
        '<div class="btn-row">' +
          '<a class="btn btn--clay" href="tel:0437125007">Call now</a>' +
          '<a class="btn btn--ghost" href="contact.html">Contact page</a>' +
        '</div>' +
      '</div>' +
    '</div>';

  var lastFocus = null;

  function initContactModal() {
    var triggers = $$('[data-contact-modal]');
    if (!triggers.length) return;

    var host = document.createElement('div');
    host.innerHTML = MODAL_HTML;
    var modal = host.firstChild;
    document.body.appendChild(modal);
    modal.hidden = false;

    // fix the logo path when the page sits in a subfolder
    var base = document.body.getAttribute('data-base') || '';
    if (base) $('.modal__logo', modal).src = base + 'assets/botanica-logo-full.png';

    function open(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      var f = $('a,button', modal); if (f) f.focus();
    }
    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    triggers.forEach(function (t) { t.addEventListener('click', open); });
    $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
      if (e.key === 'Tab' && modal.classList.contains('is-open')) trapFocus(e, modal);
    });
  }

  /* Keep keyboard focus inside an open overlay. */
  function trapFocus(e, root) {
    var f = $$('a[href],button:not([disabled]),input,select,textarea', root)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------------------------------------------------------- Nav */
  function initNav() {
    var nav = $('.nav');
    var burger = $('.burger');
    var drawer = $('.drawer');

    function onScroll() {
      if (nav) nav.classList.toggle('is-stuck', window.scrollY > 24);
      var top = $('.totop');
      if (top) top.classList.toggle('is-on', window.scrollY > 600);
      var bar = $('.progress');
      if (bar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function closeMenu() {
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); }
      if (drawer) drawer.setAttribute('aria-hidden', 'true');
    }

    if (burger) {
      if (drawer) drawer.setAttribute('aria-hidden', 'true');
      burger.addEventListener('click', function () {
        var open = document.body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.style.overflow = open ? 'hidden' : '';
        if (drawer) {
          drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
          if (open) { var f = $('a', drawer); if (f) setTimeout(function () { f.focus(); }, 260); }
        }
      });
    }
    if (drawer) {
      $$('a', drawer).forEach(function (a) { a.addEventListener('click', closeMenu); });
    }
    document.addEventListener('keydown', function (e) {
      if (!document.body.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { closeMenu(); if (burger) burger.focus(); }
      if (e.key === 'Tab' && drawer) trapFocus(e, drawer);
    });
    // If the viewport grows back to desktop width, drop the mobile menu state.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1100 && document.body.classList.contains('menu-open')) closeMenu();
    });

    var top = $('.totop');
    if (top) top.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------ Scroll reveal */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    // stagger siblings automatically
    items.forEach(function (el) {
      if (el.dataset.delay) el.style.setProperty('--d', el.dataset.delay + 'ms');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------- Counters */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = n.dataset.count; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var dur = 1500, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------- Parallax */
  function initParallax() {
    var els = $$('[data-parallax]');
    if (!els.length || reduced) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.dataset.parallax) || 0.08;
        var mid = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (-mid * speed).toFixed(2) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------ Tilt on cards */
  function initTilt() {
    if (reduced || window.matchMedia('(hover: none)').matches) return;
    $$('[data-tilt]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) +
          'deg) rotateY(' + (x * 5).toFixed(2) + 'deg) translateY(-6px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* --------------------------------------------------------- Accordion */
  function initAccordion() {
    $$('.acc__q').forEach(function (q) {
      q.addEventListener('click', function () {
        var item = q.closest('.acc__item');
        var panel = $('.acc__a', item);
        var open = item.classList.contains('is-open');
        // close siblings
        $$('.acc__item', item.parentElement).forEach(function (sib) {
          sib.classList.remove('is-open');
          var p = $('.acc__a', sib); if (p) p.style.maxHeight = null;
          var b = $('.acc__q', sib); if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!open) {
          item.classList.add('is-open');
          panel.style.maxHeight = panel.scrollHeight + 'px';
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------------------------------------------------------- Lightbox */
  function initLightbox() {
    var items = $$('.mitem');
    if (!items.length) return;
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.innerHTML =
      '<button class="lightbox__x" aria-label="Close">&#10005;</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" aria-label="Previous">&#8249;</button>' +
      '<button class="lightbox__nav lightbox__nav--next" aria-label="Next">&#8250;</button>' +
      '<img alt=""><div class="lightbox__cap"></div>';
    document.body.appendChild(box);
    var img = $('img', box), cap = $('.lightbox__cap', box), i = 0;

    function show(n) {
      i = (n + items.length) % items.length;
      var src = items[i].dataset.full || $('img', items[i]).src;
      img.src = src;
      img.alt = items[i].dataset.cap || '';
      cap.textContent = (items[i].dataset.cap || '') + '  ·  ' + (i + 1) + ' / ' + items.length;
    }
    function open(n) { show(n); box.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    function close() { box.classList.remove('is-open'); document.body.style.overflow = ''; }

    items.forEach(function (it, n) { it.addEventListener('click', function () { open(n); }); });
    $('.lightbox__x', box).addEventListener('click', close);
    $('.lightbox__nav--prev', box).addEventListener('click', function (e) { e.stopPropagation(); show(i - 1); });
    $('.lightbox__nav--next', box).addEventListener('click', function (e) { e.stopPropagation(); show(i + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(i + 1);
      if (e.key === 'ArrowLeft') show(i - 1);
    });
  }

  /* ----------------------------------------------------------- Filters */
  function initFilters() {
    var chips = $$('[data-filter]');
    if (!chips.length) return;
    var cards = $$('[data-role]');
    var count = $('#result-count');

    function apply(val) {
      var shown = 0;
      cards.forEach(function (c) {
        var match = val === 'all' || c.dataset.role === val;
        c.classList.toggle('is-hidden', !match);
        if (match) { shown++; c.classList.remove('in'); }
      });
      // re-run reveal for newly shown cards
      requestAnimationFrame(function () {
        cards.forEach(function (c, n) {
          if (!c.classList.contains('is-hidden')) {
            c.style.setProperty('--d', Math.min(n, 8) * 45 + 'ms');
            c.classList.add('in');
          }
        });
      });
      if (count) count.textContent = shown;
    }

    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        ch.classList.add('is-active');
        apply(ch.dataset.filter);
      });
    });
    if (count) count.textContent = cards.length;
  }

  /* ------------------------------------------------------- Bio expanders */
  function initBios() {
    $$('.more').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bio = btn.previousElementSibling;
        var open = bio.classList.toggle('is-open');
        btn.textContent = open ? 'Read less' : 'Read more';
      });
    });
    // hide the toggle where the bio isn't actually clamped
    $$('.person__bio').forEach(function (bio) {
      var btn = bio.nextElementSibling;
      if (btn && btn.classList.contains('more') && bio.scrollHeight <= bio.clientHeight + 2) {
        btn.style.display = 'none';
      }
    });
  }

  /* ------------------------------------------------------------- Forms */
  /* The enquiry forms are Netlify Forms. Netlify reads the markup at deploy
     time and collects submissions; here we POST them by fetch instead of
     letting the browser navigate, so the person stays on the page and gets
     the inline confirmation. If JavaScript is off or the fetch fails, the
     form falls back to a normal POST and lands on thanks.html. */
  function initForms() {
    $$('form[data-demo]').forEach(function (form) {
      var btn = $('button[type="submit"]', form);
      if (btn) btn.dataset.label = btn.textContent.trim();

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!form.checkValidity()) { form.reportValidity(); return; }

        var ok = $('.form-success', form);
        var err = $('.form-error', form);
        if (err) err.classList.remove('is-on');
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        var name = form.getAttribute('name') || 'enquiry';

        function done(message) {
          if (ok) {
            var span = ok.querySelector('span');
            if (span && message) span.textContent = message;
            ok.classList.add('is-on');
          }
          form.reset();
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
          // let Google Tag Manager see it as a conversion
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'form_submission', form_name: name });
        }

        function failed() {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
          if (err) {
            err.querySelector('span').innerHTML =
              'Sorry — that didn\'t send. Please try again, or call us on ' +
              '<a href="tel:0437125007" style="text-decoration:underline">0437 125 007</a>.';
            err.classList.add('is-on');
          } else {
            form.submit();   // last resort: let the browser do it
          }
        }

        // No server when the file is opened straight from disk — just show
        // the confirmation so the page can still be demonstrated.
        if (location.protocol === 'file:' || !window.fetch) {
          setTimeout(function () { done(); }, 600);
          return;
        }

        var body = new URLSearchParams(new FormData(form)).toString();
        fetch(form.getAttribute('action') || '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body
        })
          .then(function (r) { if (r.ok) { done(); } else { failed(); } })
          .catch(failed);
      });
    });
  }

  /* ---------------------------------------------------------- Tracking */
  /* Pushes the handful of actions worth measuring for a salon into the
     dataLayer, where Google Tag Manager (GTM-MZ78KMR) can pick them up and
     turn them into conversions. No personal data leaves the page. */
  function initTracking() {
    window.dataLayer = window.dataLayer || [];
    function push(o) { window.dataLayer.push(o); }

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';

      if (href.indexOf('tel:') === 0) {
        push({ event: 'phone_click', phone_number: href.replace('tel:', ''),
               link_location: a.closest('.nav, .modal, .footer, .person, .drawer') ? 'chrome' : 'content' });
      } else if (/fresha|gettimely|square\.link/i.test(href)) {
        push({ event: 'booking_click', booking_provider: href.split('/')[2] || '',
               stylist: (a.closest('.person') && a.closest('.person').querySelector('h3').textContent) || '' });
      } else if (href.indexOf('instagram.com') > -1) {
        push({ event: 'social_click', network: 'instagram' });
      } else if (href.indexOf('goo.gl/maps') > -1 || href.indexOf('google.com/maps') > -1) {
        push({ event: 'directions_click' });
      }
    });

    var modal = null;
    $$('[data-contact-modal]').forEach(function (t) {
      t.addEventListener('click', function () { push({ event: 'contact_modal_open' }); });
    });
    return modal;
  }

  /* ------------------------------------------------------ Page entrance */
  function initPageIn() {
    document.body.classList.add('is-loaded');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initContactModal();
    initReveal();
    initCounters();
    initParallax();
    initTilt();
    initAccordion();
    initLightbox();
    initFilters();
    initBios();
    initForms();
    initTracking();
    initPageIn();
  });

  /* Public hook so the stylist roster can re-bind after it swaps in live data. */
  window.Botanica = {
    refresh: function () { initReveal(); initFilters(); initBios(); initTilt(); }
  };
})();
