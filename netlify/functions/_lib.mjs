/* ==========================================================================
   Shared helpers for the Botanica admin functions.
   Node 18+ runtime — uses built-in Web Crypto and fetch.
   ========================================================================== */
import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';

export const JSON_HEADERS = {
  'content-type': 'application/json',
  'cache-control': 'no-store'
};

export function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra }
  });
}

export function bad(message, status = 400) {
  return json({ error: message }, status);
}

/* ------------------------------------------------------------------ store */
export const dataStore = () => getStore({ name: 'botanica-data', consistency: 'strong' });

/* -------------------------------------------------------------- signed JWT */
/* Small HS256 token. No library needed and nothing sensitive inside — it just
   proves the bearer signed in successfully. */
const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 24) {
    throw new Error('SESSION_SECRET is missing or too short. Set it in your Netlify environment variables.');
  }
  return s;
}

export function sign(payload, ttlSeconds = 60 * 60 * 8) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSeconds };
  const head = b64url(JSON.stringify(header));
  const load = b64url(JSON.stringify(body));
  const sig = b64url(crypto.createHmac('sha256', secret()).update(`${head}.${load}`).digest());
  return `${head}.${load}.${sig}`;
}

export function verify(token) {
  if (!token || token.split('.').length !== 3) return null;
  const [head, load, sig] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', secret()).update(`${head}.${load}`).digest());
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(load.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

/* Reads the Authorization header and returns the payload, or null. */
export function authed(request) {
  const h = request.headers.get('authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? verify(m[1]) : null;
}

/* --------------------------------------------------------------- helpers */
/* Constant-time string comparison — prevents an attacker learning the
   passphrase one character at a time by measuring response times. */
export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) {
    // still burn the comparison so the timing doesn't reveal the length
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
