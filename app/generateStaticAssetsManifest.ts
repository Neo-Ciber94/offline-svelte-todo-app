import path from 'node:path';
import fs from 'node:fs/promises';

const dir = path.join(process.cwd(), '.svelte-kit', 'output', 'client');
const exclude = ['service-worker.js', 'manifest.json', '.vite/manifest.json', '_app/version.json'];

export default async function generateAssetsManifest() {
	const assetsFiles: string[] = [];
	const excludedFilePaths = exclude.map((f) => path.join(dir, f));
	const files = await fs.readdir(dir, { recursive: true });

	for (const file of files) {
		const filePath = path.join(dir, file);

		if (excludedFilePaths.includes(filePath)) {
			continue;
		}

		const stats = await fs.stat(filePath);

		if (stats.isDirectory()) {
			continue;
		}

		const assetFilePath = '/' + file.replace(/\\/g, '/');
		assetsFiles.push(assetFilePath);
	}

	return assetsFiles;
}
