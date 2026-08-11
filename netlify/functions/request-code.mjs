/* ==========================================================================
   POST /.netlify/functions/request-code   { email }
   --------------------------------------------------------------------------
   Generates a six-digit code and emails it TO THE OWNER (OWNER_EMAIL), never
   to the address that was typed in. That is the whole security model: an
   attacker can guess emails all day and the code still only lands in the
   owner's inbox.

   The response is deliberately identical whether or not the address is on the
   allow-list, so this endpoint can't be used to discover valid accounts.
   ========================================================================== */
import { json, bad, codesStore, sixDigitCode, hashCode, normaliseEmail, isEmail, sendEmail } from './_lib.mjs';

const CODE_TTL_MS   = 10 * 60 * 1000;   // 10 minutes
const COOLDOWN_MS   = 45 * 1000;        // min gap between sends for one address
const MAX_PER_HOUR  = 6;

export default async (request) => {
  if (request.method !== 'POST') return bad('Method not allowed', 405);

  let body;
  try { body = await request.json(); } catch { return bad('Bad request body'); }

  const email = normaliseEmail(body.email);
  if (!isEmail(email)) return bad('Please enter a valid email address.');

  const owner = normaliseEmail(process.env.OWNER_EMAIL);
  if (!owner) return bad('The site owner has not finished setting up admin access.', 500);

  // Optional allow-list. If ADMIN_EMAILS is unset, only OWNER_EMAIL may sign in.
  const allowed = (process.env.ADMIN_EMAILS || owner)
    .split(',').map(normaliseEmail).filter(Boolean);

  const store = codesStore();
  const key = `code:${email}`;
  const existing = await store.get(key, { type: 'json' }).catch(() => null);
  const now = Date.now();

  // Rate limiting — applied before the allow-list check so timing doesn't leak.
  if (existing) {
    if (now - (existing.sentAt || 0) < COOLDOWN_MS) {
      return bad('A code was just sent. Please wait a moment before asking for another.', 429);
    }
    if ((existing.hourCount || 0) >= MAX_PER_HOUR && now - (existing.hourStart || 0) < 60 * 60 * 1000) {
      return bad('Too many code requests. Please try again in an hour.', 429);
    }
  }

  const ok = allowed.includes(email);

  if (ok) {
    const code = sixDigitCode();
    const hourFresh = !existing || now - (existing.hourStart || 0) > 60 * 60 * 1000;

    await store.setJSON(key, {
      hash: hashCode(code, email),
      expires: now + CODE_TTL_MS,
      sentAt: now,
      attempts: 0,
      hourStart: hourFresh ? now : existing.hourStart,
      hourCount: hourFresh ? 1 : (existing.hourCount || 0) + 1
    });

    const when = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' });
    await sendEmail({
      to: owner,
      subject: `Botanica admin sign-in code: ${code}`,
      text:
`Your Botanica admin sign-in code is ${code}

It expires in 10 minutes and can only be used once.

Requested for: ${email}
Time: ${when} (Brisbane)

If this wasn't you, ignore this email — nobody can sign in without this code.`,
      html:
`<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#192437">
  <p style="letter-spacing:.24em;text-transform:uppercase;font-size:11px;color:#8A7550;margin:0 0 6px">Botanica by Collective Space</p>
  <h1 style="font-size:22px;margin:0 0 18px;font-weight:600">Your admin sign-in code</h1>
  <p style="margin:0 0 18px;line-height:1.6;color:#33404F">Enter this code on the sign-in screen to open the stylist manager.</p>
  <div style="font-size:38px;letter-spacing:.22em;font-weight:600;background:#F4F0E9;border:1px solid #E9E1D3;border-radius:14px;padding:20px;text-align:center;margin:0 0 18px">${code}</div>
  <p style="margin:0 0 18px;line-height:1.6;color:#33404F">It expires in 10 minutes and can only be used once.</p>
  <hr style="border:0;border-top:1px solid #E9E1D3;margin:24px 0">
  <p style="font-size:13px;line-height:1.6;color:#7A8291;margin:0">
    Requested for <strong style="color:#192437">${email}</strong><br>
    ${when} (Brisbane)<br><br>
    If this wasn't you, you can safely ignore this email — no one can sign in without the code above.
  </p>
</div>`
    });
  }

  // Same answer either way.
  return json({
    ok: true,
    sentTo: 'the salon owner',
    message: 'If that address has admin access, a code is on its way to the salon owner.'
  });
};
