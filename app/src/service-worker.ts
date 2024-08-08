/// <reference types="@sveltejs/kit" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
// import { registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

const manifestAssets = self.__WB_MANIFEST;
console.log(manifestAssets);

cleanupOutdatedCaches();
precacheAndRoute(manifestAssets);

// registerRoute(
// 	// Match requests that contain '_app/immutable/' but do not start with it
// 	({ url }) => {
// 		return url.pathname.includes('/_app/immutable/') && !url.pathname.startsWith('/_app/immutable/');
// 	},
// 	async ({ url }) => {
// 		// Rewrite the URL to start with '/_app/immutable/'
// 		const index = url.pathname.indexOf('/_app/immutable/');
// 		const cacheUrl = url.pathname.substring(index);

// 		// Attempt to match the rewritten URL directly in the cache
// 		const cachedResponse = await caches.match(cacheUrl);
// 		return cachedResponse || new Response(null, { status: 404 });
// 	}
// );
