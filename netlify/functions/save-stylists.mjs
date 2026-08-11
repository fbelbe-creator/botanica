/* ==========================================================================
   POST /.netlify/functions/save-stylists   { stylists: [...] }
   Requires: Authorization: Bearer <session token>
   --------------------------------------------------------------------------
   Validates and stores the roster. Keeps the previous version as a dated
   backup so a bad edit is always recoverable.
   ========================================================================== */
import { json, bad, dataStore, authed } from './_lib.mjs';

const ROLES = new Set(['hair', 'colour', 'extensions', 'nails']);
const MAX = 200;

const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

function clean(p, i) {
  const name = str(p.name, 80);
  const tel = str(p.tel, 24).replace(/[^\d+ ]/g, '');
  if (!name || !tel) return null;

  const url = (v) => {
    const s = str(v, 500);
    return /^https?:\/\//i.test(s) ? s : '';
  };

  return {
    id: str(p.id, 80) || `stylist-${i + 1}`,
    name,
    title: str(p.title, 60) || 'Hair Stylist',
    role: ROLES.has(p.role) ? p.role : 'hair',
    img: url(p.img),
    tel,
    instagram: url(p.instagram),
    booking: url(p.booking),
    note: str(p.note, 140),
    bio: str(p.bio, 2000),
    days: Array.isArray(p.days) && p.days.length === 6
      ? p.days.map(Boolean)
      : [false, true, true, true, true, true],
    active: p.active !== false,
    order: Number.isFinite(+p.order) ? +p.order : i + 1
  };
}

export default async (request) => {
  if (request.method !== 'POST') return bad('Method not allowed', 405);

  const session = authed(request);
  if (!session) return bad('Your session has expired. Please sign in again.', 401);

  let body;
  try { body = await request.json(); } catch { return bad('Bad request body'); }

  const incoming = body.stylists;
  if (!Array.isArray(incoming)) return bad('Expected a list of stylists.');
  if (incoming.length > MAX) return bad(`That's more than ${MAX} profiles — something looks wrong.`);

  const stylists = incoming.map(clean).filter(Boolean);
  if (incoming.length && !stylists.length) {
    return bad('None of those profiles had both a name and a phone number.');
  }

  // Reject duplicate ids, which would make editing unpredictable.
  const ids = new Set();
  for (const s of stylists) {
    while (ids.has(s.id)) s.id = `${s.id}-2`;
    ids.add(s.id);
  }

  const store = dataStore();

  // keep the outgoing version as a backup before overwriting
  const previous = await store.get('stylists', { type: 'json' }).catch(() => null);
  if (previous) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await store.setJSON(`backup/stylists-${stamp}`, previous).catch(() => {});
  }

  await store.setJSON('stylists', stylists);
  await store.setJSON('meta', {
    updatedAt: new Date().toISOString(),
    updatedBy: session.sub,
    count: stylists.length
  });

  return json({ ok: true, count: stylists.length, saved: stylists });
};
