/* ==========================================================================
   GET /.netlify/functions/get-stylists
   --------------------------------------------------------------------------
   Public read of the roster — the stylists page calls this on every visit.
   Returns the saved list, or an empty array if nothing has been saved yet, in
   which case the page keeps showing its bundled copy.
   ========================================================================== */
import { json, dataStore } from './_lib.mjs';

export default async () => {
  const store = dataStore();
  const list = await store.get('stylists', { type: 'json' }).catch(() => null);

  return json(
    { stylists: Array.isArray(list) ? list : [] },
    200,
    // short cache so the site is fast but an admin edit shows up quickly
    { 'cache-control': 'public, max-age=60, stale-while-revalidate=600' }
  );
};
