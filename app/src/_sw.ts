/// <reference types="@sveltejs/kit" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
// import { prerendered } from '$service-worker';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
import { cacheNames } from 'workbox-core';

declare const __VERSION__: number;
declare const __MANIFEST__: string[];

const manifestAssets = __MANIFEST__;
const revision = __VERSION__.toString();

const files = manifestAssets.map((url) => ({ url, revision }));
const ADDITIONAL_MANIFEST = [{ url: '/offline', revision }];
const ASSETS = [...files, ...ADDITIONAL_MANIFEST];

console.log(manifestAssets);

cleanupOutdatedCaches();
precacheAndRoute(ASSETS);

// Custom handler to return the offline page if network request fails
const offlineFallbackHandler = async ({ event }) => {
	try {
		// Attempt to fetch the resource from the network
		const response = await fetch(event.request);
		return response;
	} catch {
		// If network request fails, return the offline page from cache
		const cache = await caches.open(cacheNames.precache);
		return cache.match('/offline');
	}
};

// Register route for navigation requests with offline fallback
registerRoute(
	({ request }) => request.mode === 'navigate',
	new NetworkOnly({
		plugins: [
			{
				handlerDidError: offlineFallbackHandler
			}
		]
	})
);
