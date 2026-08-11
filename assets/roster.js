/* ==========================================================================
   Botanica — public stylist roster renderer
   --------------------------------------------------------------------------
   Renders the cards on stylists.html.

   Two-stage load, on purpose:
     1. Paint immediately from window.BOTANICA_STYLISTS (assets/stylists.js),
        so the page has content even with no network and no backend.
     2. Then ask the Netlify function for the live roster the admin edits.
        If it answers, swap the cards in. If it doesn't, nobody notices.
   ========================================================================== */
(function () {
  'use strict';

  var API = '/.netlify/functions/get-stylists';
  var DAYS = ['M', 'T', 'W', 'T', 'F', 'S'];
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function prettyTel(t) {
    var d = String(t || '').replace(/\D/g, '');
    return d.length === 10 ? d.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3') : t;
  }

  var IG_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">' +
    '<rect x="2" y="2" width="20" height="20" rx="5.5"/><circle cx="12" cy="12" r="4.2"/>' +
    '<circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>';

  function card(p, i) {
    var delay = Math.min(i, 8) * 60;
    var days = (p.days || []).map(function (on, n) {
      return '<li class="' + (on ? 'on' : '') + '"><span class="sr">' + DAY_NAMES[n] +
             (on ? ' available' : ' unavailable') + '</span><span aria-hidden="true">' + DAYS[n] + '</span></li>';
    }).join('');

    var ig = p.instagram
      ? '<a class="person__ig" href="' + esc(p.instagram) + '" target="_blank" rel="noopener" ' +
        'aria-label="' + esc(p.name) + ' on Instagram">' + IG_SVG + '</a>'
      : '';

    var acts = p.booking
      ? '<a class="btn btn--sm btn--clay" href="' + esc(p.booking) + '" target="_blank" rel="noopener">Book now</a>' +
        '<a class="btn btn--sm btn--ghost" href="tel:' + esc(p.tel) + '" aria-label="Call ' + esc(p.name) + '">Call</a>'
      : '<a class="btn btn--sm btn--clay" href="tel:' + esc(p.tel) + '">Call to book · ' + esc(prettyTel(p.tel)) + '</a>';

    var note = p.note
      ? '<p class="dim" style="font-size:.78rem;margin:-6px 0 12px">' + esc(p.note) + '</p>' : '';

    return '<article class="person" data-role="' + esc(p.role) + '" data-reveal data-delay="' + delay + '">' +
        '<div class="person__ph">' +
          '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + ', ' + esc(p.title) + ' at Botanica" loading="lazy">' +
          '<span class="person__role">' + esc(p.title) + '</span>' + ig +
        '</div>' +
        '<div class="person__body">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p class="person__bio">' + esc(p.bio) + '</p>' +
          '<button class="more" type="button">Read more</button>' + note +
          '<ul class="days" aria-label="Typical availability">' + days + '</ul>' +
          '<div class="person__acts">' + acts + '</div>' +
        '</div>' +
      '</article>';
  }

  function render(list) {
    var host = document.getElementById('people');
    if (!host) return;
    var live = (list || []).filter(function (p) { return p.active !== false; })
                           .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    host.innerHTML = live.map(card).join('');
    var c = document.getElementById('result-count');
    if (c) c.textContent = live.length;
    // reset any active filter chip, since the set of cards just changed
    var chips = document.querySelectorAll('[data-filter]');
    for (var i = 0; i < chips.length; i++) chips[i].classList.toggle('is-active', i === 0);
    return live.length;
  }

  // 1. paint from the bundled copy right away
  render(window.BOTANICA_STYLISTS || []);

  // 2. then try for the live roster
  document.addEventListener('DOMContentLoaded', function () {
    if (!window.fetch || location.protocol === 'file:') return;
    fetch(API, { headers: { 'accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var list = data && (data.stylists || data);
        if (!Array.isArray(list) || !list.length) return;
        render(list);
        if (window.Botanica && window.Botanica.refresh) window.Botanica.refresh();
      })
      .catch(function () { /* offline or not deployed yet — bundled copy stands */ });
  });
})();
