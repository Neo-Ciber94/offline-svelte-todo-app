/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

const manifestAssets = self.__WB_MANIFEST;
console.log(manifestAssets);

// https://vite-pwa-org.netlify.app/guide/inject-manifest.html

self.skipWaiting();
clientsClaim();

// Cleanup and cache
cleanupOutdatedCaches();
precacheAndRoute(manifestAssets);
