import { getStore } from '@netlify/blobs';
import { authed, bad, json } from './_lib.mjs';
import crypto from 'node:crypto';

const TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif']
]);
const MAX_BYTES = 3.5 * 1024 * 1024;

export default async (request) => {
  if (request.method !== 'POST') return bad('Method not allowed', 405);
  if (!authed(request)) return bad('Your session has expired. Please sign in again.', 401);

  const contentType = (request.headers.get('content-type') || '').toLowerCase().split(';')[0].trim();
  const extension = TYPES.get(contentType);
  if (!extension) return bad('Choose a JPG, PNG, WebP or AVIF image.');
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > MAX_BYTES) return bad('That image is too large. Choose a file under 3.5 MB.', 413);

  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength) return bad('The selected image is empty.');
  if (bytes.byteLength > MAX_BYTES) return bad('That image is too large. Choose a file under 3.5 MB.', 413);

  const key = `${crypto.randomUUID()}.${extension}`;
  await getStore({ name: 'botanica-photos', consistency: 'strong' }).set(key, bytes);
  return json({ ok: true, url: `/.netlify/functions/get-stylist-photo?key=${key}` });
};
