/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim, cacheNames } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

const manifestAssets = self.__WB_MANIFEST;

self.skipWaiting();
clientsClaim();

// Cleanup and cache
cleanupOutdatedCaches();
precacheAndRoute([...manifestAssets, '/200.html']);

// Register route for GET requests, navigation fallback, and not targeting /api
registerRoute(
	({ request, url }) => {
		return (
			request.mode === 'navigate' && request.method === 'GET' && !url.pathname.startsWith('/api')
		);
	},
	async (event) => {
		const cache = await caches.open(cacheNames.precache);
		try {
			// Try to fetch the network request
			const networkResponse = await fetch(event.request);
			if (networkResponse.ok) {
				return networkResponse;
			}
		} catch {
			// If network fails, try to return the 200.html from cache
			const cached200 = await cache.match('/200.html');
			if (cached200) {
				return cached200;
			}
		}

		// If 200.html is not available, return the offline.html page from the cache
		const cachedOffline = await cache.match('/offline.html');
		return cachedOffline || new Response(null, { status: 404 });
	}
);

// Register route to cache the offline.html page
registerRoute(
	({ url }) => url.pathname === '/offline.html',
	new CacheFirst({
		cacheName: 'offline-page'
	})
);
