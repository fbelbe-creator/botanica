/* ==========================================================================
   Botanica — admin auth client
   --------------------------------------------------------------------------
   Passphrase sign-in.

     1. You enter the passphrase on login.html.
     2. It's posted to the server, which compares it to ADMIN_PASSPHRASE
        (set in Netlify's environment variables — never in this code).
     3. If it matches, the server issues a signed session token, held in
        sessionStorage and sent as a Bearer token on admin requests.

   The session lasts 8 hours and disappears when you close the tab.

   PREVIEW MODE: opened straight from disk (file://) there is no server, so
   this lets you in without checking anything. That exists purely so the admin
   can be demonstrated offline — it is not security, and it switches itself off
   automatically once the site is on Netlify.
   ========================================================================== */
window.BotanicaAuth = (function () {
  'use strict';

  var API = '/.netlify/functions/';
  var KEY = 'botanica.session';
  var DEMO = location.protocol === 'file:';
  var TIMEOUT_MS = 15000;

  /* --------------------------------------------------- canonical host
     Netlify 301-redirects the bare domain to the www one. A browser
     following a 301 on a POST turns it into a GET and throws the body
     away, so signing in from the bare domain silently fails. Move to the
     www host before any of that can happen. */
  (function canonicalHost() {
    if (DEMO) return;
    var h = location.hostname;
    if (h === 'botanicabycollectivespace.com') {
      location.replace(location.protocol + '//www.' + h + location.pathname +
                       location.search + location.hash);
    }
  })();

  function post(fn, body) {
    /* Always fail loudly. A request that hangs with no timeout leaves the
       button stuck on "Checking…" forever, which tells nobody anything. */
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller && setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    return fetch(API + fn, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {}),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      if (timer) clearTimeout(timer);
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) {
          /* Carry the status code through. "Method not allowed (405)" points
             straight at a redirect problem; 500 points at a missing setting. */
          throw new Error((data.error || 'The server rejected that request.') +
                          ' (' + r.status + ')');
        }
        return data;
      });
    }, function (err) {
      if (timer) clearTimeout(timer);
      if (err && err.name === 'AbortError') {
        throw new Error('The server didn\'t answer within 15 seconds. Try again — ' +
                        'if it keeps happening, check the function log in Netlify.');
      }
      throw new Error('Couldn\'t reach the server. This is usually an ad blocker or ' +
                      'browser extension blocking the request — try an Incognito window ' +
                      'to confirm, then allowlist this site.');
    });
  }

  function save(s) { sessionStorage.setItem(KEY, JSON.stringify(s)); }
  function session() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  return {
    isDemo: function () { return DEMO; },
    token: function () { var s = session(); return s && s.token; },
    email: function () { var s = session(); return s && s.label; },

    /* Sign in with the passphrase. */
    signIn: function (passphrase) {
      if (!passphrase) return Promise.reject(new Error('Enter your passphrase.'));

      if (DEMO) {
        save({ token: 'demo.' + Date.now(), label: 'Preview mode', demo: true });
        return Promise.resolve({ ok: true });
      }

      return post('sign-in', { passphrase: passphrase }).then(function (res) {
        if (!res.token) throw new Error('Sign-in failed. Please try again.');
        save({ token: res.token, label: 'Salon admin' });
        return res;
      });
    },

    signOut: function () {
      sessionStorage.removeItem(KEY);
    },

    /* Guard for admin.html — bounces anyone without a session to the login. */
    require: function () {
      if (!this.token()) { location.replace('login.html'); return false; }
      return true;
    },

    /* Authenticated fetch helper. */
    api: function (fn, opts) {
      opts = opts || {};
      var headers = opts.headers || {};
      headers['content-type'] = 'application/json';
      headers['authorization'] = 'Bearer ' + this.token();

      var controller = window.AbortController ? new AbortController() : null;
      var timer = controller && setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

      return fetch(API + fn, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: controller ? controller.signal : undefined
      }).then(function (r) {
        if (timer) clearTimeout(timer);
        if (r.status === 401) { window.BotanicaAuth.signOut(); location.replace('login.html'); return; }
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) throw new Error((d.error || 'Request failed') + ' (' + r.status + ')');
          return d;
        });
      }, function (err) {
        if (timer) clearTimeout(timer);
        if (err && err.name === 'AbortError') {
          throw new Error('The server didn\'t answer within 15 seconds.');
        }
        throw new Error('Couldn\'t reach the server — an ad blocker or extension may be blocking it.');
      });
    }
  };
})();
