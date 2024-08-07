import path from 'node:path';
import { type Plugin, resolveConfig } from 'vite';
import esbuild from 'esbuild';
import generateStaticAssetsManifest from '../generateStaticAssetsManifest';

type Options = {
	cwd?: string;
	filePath: string;
	outDir?: string;
};

export default function serviceWorker(options: Options): Plugin {
	const { cwd = process.cwd(), filePath } = options;

	return {
		name: 'build-service-worker',
		enforce: 'post',
		async closeBundle() {
			const viteConfig = await resolveConfig({}, 'build');

			if (viteConfig.build.ssr) {
				return;
			}

			const outDir = options.outDir || viteConfig.build.outDir;
			const swFilePath = path.join(cwd, filePath);
			const assetsFiles = await generateStaticAssetsManifest();
			console.log(`Building service worker: ${swFilePath} -> ${outDir}`);

			await esbuild.build({
				entryPoints: [swFilePath],
				outfile: path.join(outDir, 'service-worker.js'),
				define: {
					__FILES__: JSON.stringify(assetsFiles),
					__VERSION__: Date.now().toString()
				}
			});
		}
	};
}
