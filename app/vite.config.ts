import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import serviceWorker from './vite/sw-plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		serviceWorker({
			filePath: 'src/service-worker.ts',
			outDir: 'out'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
