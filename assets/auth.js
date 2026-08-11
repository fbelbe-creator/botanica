/* ==========================================================================
   Botanica — admin auth client
   --------------------------------------------------------------------------
   Passwordless sign-in, exactly as specified:

     1. Someone enters an email on login.html.
     2. The server generates a six-digit code and EMAILS IT TO THE OWNER —
        never to whoever typed the address. So an outsider can request a code
        all day and only the owner ever receives one.
     3. They come back to the login screen and enter the code.
     4. The server checks it and issues a signed session token, kept in
        sessionStorage and sent as a Bearer token on admin requests.

   Codes expire after 10 minutes and are single-use. The server also rate
   limits requests per email address.

   DEMO MODE: opened straight from disk (file://) there is no backend, so this
   falls back to a local simulation that shows the code on screen. That exists
   so you can click through the admin before deploying — it is not security,
   and it switches itself off automatically once the site is on Netlify.
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

  /* ----------------------------------------------------------- demo mode */
  function demoRequest(email) {
    var code = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem('botanica.demo', JSON.stringify({
      email: email, code: code, expires: Date.now() + 10 * 60 * 1000
    }));
    return Promise.resolve({ ok: true, sentTo: 'the salon owner', devCode: code });
  }
  function demoVerify(email, code) {
    var raw = sessionStorage.getItem('botanica.demo');
    if (!raw) return Promise.reject(new Error('That code has expired. Please request a new one.'));
    var d = JSON.parse(raw);
    if (Date.now() > d.expires) return Promise.reject(new Error('That code has expired. Please request a new one.'));
    if (d.code !== code) return Promise.reject(new Error('That code isn\'t right. Check the email and try again.'));
    sessionStorage.removeItem('botanica.demo');
    save({ token: 'demo.' + Date.now(), email: email, demo: true });
    return Promise.resolve({ ok: true });
  }

  /* ------------------------------------------------------------- session */
  function save(s) { sessionStorage.setItem(KEY, JSON.stringify(s)); }
  function session() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }

  return {
    isDemo: function () { return DEMO; },
    token: function () { var s = session(); return s && s.token; },
    email: function () { var s = session(); return s && s.email; },

    requestCode: function (email) {
      if (DEMO) return demoRequest(email);
      return post('request-code', { email: email });
    },

    verifyCode: function (email, code) {
      if (DEMO) return demoVerify(email, code);
      return post('verify-code', { email: email, code: code }).then(function (res) {
        if (!res.token) throw new Error('Sign-in failed. Please try again.');
        save({ token: res.token, email: res.email || email });
        return res;
      });
    },

    signOut: function () {
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem('botanica.demo');
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
