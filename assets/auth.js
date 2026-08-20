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

  function post(fn, body) {
    return fetch(API + fn, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
        return data;
      });
    }, function () {
      throw new Error('Can\'t reach the server. Check your connection and try again.');
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
      return fetch(API + fn, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined
      }).then(function (r) {
        if (r.status === 401) { window.BotanicaAuth.signOut(); location.replace('login.html'); return; }
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) throw new Error(d.error || 'Request failed');
          return d;
        });
      });
    }
  };
})();
