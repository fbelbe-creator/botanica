/* ==========================================================================
   POST /.netlify/functions/verify-code   { email, code }
   --------------------------------------------------------------------------
   Checks the six-digit code and, if it matches, returns a signed session token
   valid for 8 hours. Codes are single-use and give up after 5 wrong attempts.
   ========================================================================== */
import { json, bad, codesStore, hashCode, normaliseEmail, isEmail, sign } from './_lib.mjs';

const MAX_ATTEMPTS = 5;

export default async (request) => {
  if (request.method !== 'POST') return bad('Method not allowed', 405);

  let body;
  try { body = await request.json(); } catch { return bad('Bad request body'); }

  const email = normaliseEmail(body.email);
  const code = String(body.code || '').replace(/\D/g, '');

  if (!isEmail(email) || code.length !== 6) {
    return bad('That code isn\'t right. Check the email and try again.', 401);
  }

  const store = codesStore();
  const key = `code:${email}`;
  const rec = await store.get(key, { type: 'json' }).catch(() => null);

  if (!rec) return bad('That code has expired. Please request a new one.', 401);

  if (Date.now() > rec.expires) {
    await store.delete(key);
    return bad('That code has expired. Please request a new one.', 401);
  }

  if ((rec.attempts || 0) >= MAX_ATTEMPTS) {
    await store.delete(key);
    return bad('Too many incorrect attempts. Please request a new code.', 429);
  }

  if (hashCode(code, email) !== rec.hash) {
    await store.setJSON(key, { ...rec, attempts: (rec.attempts || 0) + 1 });
    const left = MAX_ATTEMPTS - (rec.attempts || 0) - 1;
    return bad(
      left > 0
        ? `That code isn't right. ${left} attempt${left === 1 ? '' : 's'} left.`
        : 'That code isn\'t right. Please request a new one.',
      401
    );
  }

  // Correct — burn the code and hand back a session.
  await store.delete(key);

  return json({
    ok: true,
    email,
    token: sign({ sub: email, role: 'admin' }),
    expiresIn: 60 * 60 * 8
  });
};
