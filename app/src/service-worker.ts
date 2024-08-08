/// <reference types="@sveltejs/kit" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

const manifestAssets = self.__WB_MANIFEST;
console.log(manifestAssets);

cleanupOutdatedCaches();
precacheAndRoute(manifestAssets);