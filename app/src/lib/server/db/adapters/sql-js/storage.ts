import { createKvStore } from '$lib/client/idb-kv';

export interface SqlJsStorage {
	write(filename: string, buffer: Uint8Array): Promise<void>;
	read(filename: string): Promise<Uint8Array | undefined>;
	remove(filename: string): Promise<void>;
}

type KvStore = ReturnType<typeof createKvStore>;

type IndexDbSqlJsStorageOptions = {
	databaseName?: string;
	storeName?: string;
};

export class IndexDbSqlJsStorage implements SqlJsStorage {
	#store: KvStore;

	constructor(opts?: IndexDbSqlJsStorageOptions) {
		const { databaseName = 'sql.js-data', storeName = 'sql.js' } = opts || {};
		this.#store = createKvStore(databaseName, storeName);
	}
	async write(filename: string, buffer: Uint8Array): Promise<void> {
		await this.#store.set(filename, buffer);
	}

	async read(filename: string): Promise<Uint8Array | undefined> {
		const data = await this.#store.get(filename);

		if (data instanceof Uint8Array) {
			return data;
		}

		return undefined;
	}

	async remove(filename: string): Promise<void> {
		await this.#store.del(filename);
	}
}
