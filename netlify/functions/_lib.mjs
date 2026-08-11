/* ==========================================================================
   Shared helpers for the Botanica admin functions.
   Node 18+ runtime — uses the built-in Web Crypto and fetch.
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

/* ------------------------------------------------------------------ stores */
export const codesStore = () => getStore({ name: 'botanica-codes', consistency: 'strong' });
export const dataStore  = () => getStore({ name: 'botanica-data',  consistency: 'strong' });

/* -------------------------------------------------------------- signed JWT */
/* Small HS256 token. No library needed and nothing sensitive inside — it just
   proves the bearer completed the email-code flow. */
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
  const body = { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const head = b64url(JSON.stringify(header));
  const load = b64url(JSON.stringify(body));
  const sig = b64url(crypto.createHmac('sha256', secret()).update(`${head}.${load}`).digest());
  return `${head}.${load}.${sig}`;
}

export function verify(token) {
  if (!token || token.split('.').length !== 3) return null;
  const [head, load, sig] = token.split('.');
  const expected = b64url(crypto.createHmac('sha256', secret()).update(`${head}.${load}`).digest());
  // constant-time compare
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

/* ---------------------------------------------------------------- helpers */
export function sixDigitCode() {
  // rejection-free: 6 digits, uniformly distributed
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

export function hashCode(code, email) {
  return crypto.createHash('sha256').update(`${code}:${email}:${secret()}`).digest('hex');
}

export function normaliseEmail(e) {
  return String(e || '').trim().toLowerCase();
}

export function isEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

/* --------------------------------------------------------------- mail out */
/* Sends via Resend. Swap this one function if you'd rather use Postmark,
   SendGrid, Mailgun or SMTP — nothing else in the codebase cares. */
export async function sendEmail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'Botanica <onboarding@resend.dev>';
  if (!key) throw new Error('RESEND_API_KEY is not set.');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html, text })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Email provider rejected the send (${res.status}). ${detail.slice(0, 200)}`);
  }
  return res.json();
}
