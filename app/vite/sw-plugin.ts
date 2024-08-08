import path from 'node:path';
import fs from 'node:fs/promises';
import { normalizePath, type Plugin, resolveConfig } from 'vite';
import esbuild from 'esbuild';

type Options = {
	cwd?: string;
	filePath: string;
	outDir?: string;
};

export default async function registerWorker(options: Options): Promise<Plugin> {
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
			if (!id.includes(fileName)) {
				return;
			}
			const result = await esbuild.transform(code, {
				define: {
					__MANIFEST__: JSON.stringify(assetsFiles),
					__VERSION__: Date.now().toString()
				}
			});

			return result;
		},
		async generateBundle(_, bundle) {
			const assets = Object.keys(bundle);
			assetsFiles.push(...assets);
		},

		closeBundle: {
			sequential: true,
			order: 'post',
			async handler() {
				const viteConfig = await resolveConfig({}, 'build');
				const viteOutDir = normalizePath(viteConfig.build.outDir);

				if (!viteConfig.build.ssr) {
					return;
				}

				const baseViteOutDir = path.dirname(viteOutDir);
				const swOutDir = outDir ?? normalizePath(path.join(baseViteOutDir, 'client'));

				await esbuild.build({
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
