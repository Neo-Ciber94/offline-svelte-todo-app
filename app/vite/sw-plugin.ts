import path from 'node:path';
import fs from 'node:fs/promises';
import { normalizePath, type Plugin, resolveConfig } from 'vite';
import esbuild from 'esbuild';

type Options = {
	cwd?: string;
	filePath: string;
	outDir?: string;
};

export default async function serviceWorker(options: Options): Promise<Plugin> {
	const { cwd = process.cwd(), filePath, outDir } = options;
	const inputSwFile = path.join(cwd, filePath);
	const fileName = path.parse(inputSwFile).name;
	const assetsFiles: string[] = [];

	if (!fileExists(inputSwFile)) {
		throw new Error(`Service worker file not found: ${inputSwFile}`);
	}

	return {
		name: 'build-service-worker',
		enforce: 'post',
		apply: 'build',
		async transform(code, id) {
			// if (!id.includes(fileName)) {
			// 	return;
			// }
			// const result = await esbuild.transform(code, {
			// 	define: {
			// 		__MANIFEST__: JSON.stringify([]),
			// 		__VERSION__: Date.now().toString(),
			// 	}
			// });
			// if (id.includes('service-worker')) {
			// 	console.log({ id });
			// }
			// return result;
		},
		async generateBundle(_, bundle) {
			const assets = Object.keys(bundle);
			assetsFiles.push(...assets);
		},
		closeBundle: {
			sequential: true,

			async handler() {
				const viteConfig = await resolveConfig({}, 'build');
				if (viteConfig.build.ssr) {
					return;
				}

				const viteOutDir = normalizePath(viteConfig.build.outDir);
				const swOutDir = outDir ?? viteOutDir;
				console.log({ inputSwFile, swOutDir, assetsFiles });
				esbuild.build({
					entryPoints: [inputSwFile],
					outdir: swOutDir,
					minify: false,
					define: {
						__MANIFEST__: JSON.stringify(assetsFiles),
						__VERSION__: Date.now().toString()
					}
				});
			}
		}
	};
}

async function fileExists(filePath: string) {
	try {
		const stats = await fs.stat(filePath);
		return stats.isFile();
	} catch {
		return false;
	}
}
