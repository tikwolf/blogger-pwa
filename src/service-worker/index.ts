import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

setCacheNameDetails({
  prefix: 'blogger-pwa',
  suffix: 'v2',
  precache: 'install-time',
  runtime: 'run-time',
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const runtimeCacheableResponse = new CacheableResponsePlugin({
  statuses: [0, 200],
});

/**
 * Preserve the original Blogger page. Prefer fresh content, but fall back to
 * a previously visited page when the network is unavailable.
 */
registerRoute(
  ({ sameOrigin, request }) => sameOrigin && request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'page-cache',
    networkTimeoutSeconds: 4,
    plugins: [
      runtimeCacheableResponse,
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 60 * 60 * 24 * 14,
        purgeOnQuotaError: true,
      }),
      {
        handlerDidError: async () => {
          return (await matchPrecache('/app/offline/index.html')) ?? Response.error();
        },
      },
    ],
  }),
);

/** Keep same-origin scripts and styles usable after a successful visit. */
registerRoute(
  ({ sameOrigin, request }) => sameOrigin && (request.destination === 'script' || request.destination === 'style'),
  new StaleWhileRevalidate({
    cacheName: 'site-assets-cache',
    plugins: [
      runtimeCacheableResponse,
      new ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 60 * 60 * 24 * 30,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

/**
 * Cache visited images from the site and trusted external image hosts too.
 * Blogger commonly serves media from a different origin, so restricting this
 * route to same-origin requests would make many cached pages look incomplete
 * while offline. The bounded cache and 30-day expiry limit storage growth.
 */
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'site-images-cache',
    plugins: [
      runtimeCacheableResponse,
      new ExpirationPlugin({
        maxEntries: 120,
        maxAgeSeconds: 60 * 60 * 24 * 30,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => request.destination === 'style' && /^https:\/\/fonts\.googleapis\.com$/i.test(url.origin),
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      runtimeCacheableResponse,
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => request.destination === 'font' && /^https:\/\/fonts\.gstatic\.com$/i.test(url.origin),
  new CacheFirst({
    cacheName: 'gstatic-fonts-cache',
    plugins: [
      runtimeCacheableResponse,
      new ExpirationPlugin({
        maxEntries: 40,
        maxAgeSeconds: 60 * 60 * 24 * 365,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);
