import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			// strategies: 'injectManifest',
			// srcDir: 'src',
			// filename: 'service-worker.ts',
			registerType: 'autoUpdate',
			workbox: {
				navigateFallback: '/200.html',
				additionalManifestEntries: ['/200.html'],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				skipWaiting: true
			},
			devOptions: {
				enabled: true,
				navigateFallback: '/offline',
				type: 'module'
			}
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
