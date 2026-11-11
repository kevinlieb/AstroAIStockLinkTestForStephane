import type { APIRoute } from 'astro';
import { getSP500Quote } from '../../lib/stock';

export const GET: APIRoute = async () => {
  const quote = await getSP500Quote();
  return new Response(JSON.stringify(quote), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
};
