/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, prerendered, files, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;

const CACHE_KEY = `cache-v${version}`;
const OFFLINE_URL = '/offline';
const ASSETS = [...build, ...files, ...prerendered];

worker.addEventListener('install', (event) => {
	async function precacheOfflinePage() {
		const cache = await caches.open(CACHE_KEY);
		await cache.addAll(OFFLINE_URL);
	}

	async function precacheAssets() {
		// Add the static files to the cache
		const cache = await caches.open(CACHE_KEY);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(Promise.all([precacheOfflinePage(), precacheAssets()]));
});

worker.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		// Delete old caches
		const keys = await caches.keys();

		for (const key of keys) {
			if (key !== CACHE_KEY) {
				await caches.delete(key);
			}
		}
	}

	event.waitUntil(deleteOldCaches());
});

// @ts-expect-error FetchEvent is valid
// https://web.dev/articles/offline-fallback-page#the_service_worker_code
self.addEventListener('fetch', (event: FetchEvent) => {
	async function fetchOrOfflineFallback() {
		try {
			// First, try to use the navigation preload response if it's supported.
			const preloadResponse = await event.preloadResponse;
			if (preloadResponse) {
				return preloadResponse;
			}

			// Always try the network first.
			const networkResponse = await fetch(event.request);
			return networkResponse;
		} catch (error) {
			// catch is only triggered if an exception is thrown, which is
			// likely due to a network error.
			// If fetch() returns a valid HTTP response with a response code in
			// the 4xx or 5xx range, the catch() will NOT be called.
			console.log('Fetch failed; returning offline page instead.', error);

			const cache = await caches.open(CACHE_KEY);
			const cachedResponse = await cache.match(OFFLINE_URL);
			return cachedResponse;
		}
	}

	if (event.request.mode === 'navigate') {
		event.respondWith(fetchOrOfflineFallback());
	}
});
