/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, prerendered, files, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;

const CACHE_KEY = `cache-v${version}`;
const ASSETS = [...build, ...files, ...prerendered];

worker.addEventListener('install', (event) => {
	async function addFilesToCache() {
		// Add the static files to the cache
		const cache = await caches.open(CACHE_KEY);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
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
