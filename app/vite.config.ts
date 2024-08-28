import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig((config) => {
	const isDev = config.mode === 'development';
	const fallback = isDev ? undefined : '/200.html';
	const additionalManifestEntries: string[] = fallback ? [fallback] : [];

	additionalManifestEntries.push('/dist/sql-wasm.wasm');

	return {
		plugins: [
			sveltekit(),
			SvelteKitPWA({
				registerType: 'autoUpdate',
				workbox: {
					navigateFallback: fallback,
					additionalManifestEntries,
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
