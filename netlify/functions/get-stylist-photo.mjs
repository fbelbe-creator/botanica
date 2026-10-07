import { getStore } from '@netlify/blobs';
import { bad } from './_lib.mjs';

const TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

export default async (request) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return bad('Method not allowed', 405);
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|avif)$/i.test(key)) return bad('Photo not found.', 404);
  const extension = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
  const photo = await getStore({ name: 'botanica-photos' }).get(key, { type: 'arrayBuffer' });
  if (!photo) return bad('Photo not found.', 404);
  return new Response(request.method === 'HEAD' ? null : photo, {
    headers: {
      'content-type': TYPES[extension],
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff'
    }
  });
};
