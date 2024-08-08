import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import registerWorker from './vite/sw-plugin';

export default defineConfig({
	plugins: [
		sveltekit(),
		registerWorker({
			filePath: 'src/service-worker.ts'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
