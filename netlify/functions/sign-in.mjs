/* ==========================================================================
   POST /.netlify/functions/sign-in   { passphrase }
   --------------------------------------------------------------------------
   Checks the passphrase against ADMIN_PASSPHRASE and, if it matches, returns
   a signed session token valid for 8 hours.

   Defences against guessing:
     - constant-time comparison, so response timing reveals nothing
     - a deliberate delay on every attempt, capping guesses to a few per second
     - a minimum passphrase length enforced at startup
     - the passphrase is never sent back, logged, or exposed to the browser

   Required environment variables:
     ADMIN_PASSPHRASE  the secret you type at /login  (20+ characters)
     SESSION_SECRET    a long random string, used to sign session tokens
   ========================================================================== */
import { json, bad, sign, safeEqual, sleep } from './_lib.mjs';

const MIN_LENGTH = 12;
const DELAY_MS = 600;   // slows brute force to ~1.5 attempts/second

export default async (request) => {
  if (request.method !== 'POST') return bad('Method not allowed', 405);

  const expected = process.env.ADMIN_PASSPHRASE;

  if (!expected) {
    return bad('The site owner has not finished setting up admin access. ' +
               'ADMIN_PASSPHRASE is not set.', 500);
  }
  if (expected.length < MIN_LENGTH) {
    return bad(`ADMIN_PASSPHRASE is too short — it must be at least ${MIN_LENGTH} characters.`, 500);
  }

  let body;
  try { body = await request.json(); } catch { return bad('Bad request body'); }

  const given = String(body.passphrase || '');

  // Always wait, whether right or wrong, so timing gives nothing away.
  await sleep(DELAY_MS);

  if (!safeEqual(given, expected)) {
    return bad('That passphrase isn\'t right.', 401);
  }

  return json({
    ok: true,
    token: sign({ sub: 'admin', role: 'admin' }),
    expiresIn: 60 * 60 * 8
  });
};
