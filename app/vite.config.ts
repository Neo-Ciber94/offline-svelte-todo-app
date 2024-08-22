import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig((config) => {
	const isDev = config.mode === 'development';
	const fallback = isDev ? undefined : '/200.html';

	return {
		plugins: [
			sveltekit(),
			SvelteKitPWA({
				// strategies: 'injectManifest',
				// srcDir: 'src',
				// filename: 'service-worker.ts',
				registerType: 'autoUpdate',
				workbox: {
					navigateFallback: fallback,
					additionalManifestEntries: fallback ? [fallback] : [],
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
	};
});
