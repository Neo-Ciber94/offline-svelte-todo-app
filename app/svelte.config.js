import nodeAdapter from '@sveltejs/adapter-node';
import staticAdapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		serviceWorker: {
			register: false
		},
		paths: {
			relative: false
		},

		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: nodeAdapter({
			precompress: false,
			fallback: '200.html'
		})
	}
};

// /**
//  * Run multiple adapters
//  * @param {import('@sveltejs/kit').Adapter[]} adapters
//  * @returns {import('@sveltejs/kit').Adapter}
//  */
// function adapter(...adapters) {
// 	return {
// 		name: 'static-with-node-adapter',
// 		async adapt(builder) {
// 			for (const adapter of adapters) {
// 				await adapter.adapt(builder);
// 			}

// 			await builder.generateFallback(path.join('build', 'client', '_fallback.html'));
// 		}
// 	};
// }

export default config;
