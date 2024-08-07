/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

// import { build, prerendered, files, version } from '$service-worker';
// import { files, version } from '$assets-manifest';

declare const __FILES__: string;
declare const __VERSION__: number;

const files = __FILES__;
const version = __VERSION__;
const worker = self as unknown as ServiceWorkerGlobalScope;

const CACHE_KEY = `cache-v${version}`;
const OFFLINE_URL = '/offline';
const ASSETS = files; //[...build, ...files, ...prerendered];

worker.addEventListener('install', (event) => {
	async function precacheOfflinePage() {
		const cache = await caches.open(CACHE_KEY);
		await cache.add(OFFLINE_URL);
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
	if (event.request.method !== 'GET') {
		return;
	}

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE_KEY);

		// Static pages try to load its js from the '_app/immutable',
		// we attend to get the response from there
		if (url.pathname.includes('_app/immutable')) {
			const idx = url.pathname.indexOf('_app/immutable');
			const pathname = url.pathname.slice(idx);
			const matchResponse = await cache.match(pathname);

			console.log(`Matched? ${pathname}? ${matchResponse != null}`);
			if (matchResponse) {
				return matchResponse;
			}
		}

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
			const matchResponse = await cache.match(event.request);

			if (matchResponse) {
				return matchResponse;
			}

			// catch is only triggered if an exception is thrown, which is
			// likely due to a network error.
			// If fetch() returns a valid HTTP response with a response code in
			// the 4xx or 5xx range, the catch() will NOT be called.
			console.log('Fetch failed; returning offline page instead.', error);

			const cachedResponse = await cache.match(OFFLINE_URL);
			return cachedResponse;
		}
	}

	event.respondWith(respond());
});
