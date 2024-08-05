/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z, ZodType, ZodObject } from 'zod';

type StoreDefinitionSchema<S extends ZodObject<any>> = {
	schema: S;
	keys: [keyof S, ...(keyof S)[]];
};

type DatabaseDefinition<S extends ZodObject<any>> = {
	[storeName: string]: StoreDefinitionSchema<S>;
};

type BrowserDatabaseOptions<TShape extends DatabaseDefinition<any>> = {
	databaseName?: string;
	definition: TShape;
	version: number;
};

type DatabaseStoreCollection<TDefinition extends DatabaseDefinition<any>> = {
	[K in keyof TDefinition]: DatabaseStore<TDefinition[K]['schema']>;
};

type Entity<T extends ZodType> = z.infer<T>;

class DatabaseStore<T extends ZodObject<any>> {
	#indexDb: Promise<IDBDatabase>;
	#schema: StoreDefinitionSchema<T>;
	#storeName: string;

	constructor(db: Promise<IDBDatabase>, storeName: string, schema: StoreDefinitionSchema<T>) {
		this.#indexDb = db;
		this.#schema = schema;
		this.#storeName = storeName;
	}

	async #newTransaction(mode?: IDBTransactionMode, options?: IDBTransactionOptions) {
		const idb = await this.#indexDb;
		const transaction = idb.transaction(this.#storeName, mode, options);
		const store = transaction.objectStore(this.#storeName);
		return store;
	}

	get schema() {
		return this.#schema;
	}

	get name() {
		return this.#storeName;
	}

	unsafeGetIndexDatabase() {
		return this.#indexDb;
	}

	async getByKey(key: string) {
		const store = await this.#newTransaction('readonly');
		const request = store.get([key]);
		return new Promise<Entity<T>>((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async getAll() {
		const store = await this.#newTransaction('readonly');
		const request = store.getAll();
		return new Promise<Entity<T>[]>((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async set(value: z.input<T>) {
		const validatedValue = this.#schema.schema.parse(value);
		const store = await this.#newTransaction('readwrite');
		const request = store.put(validatedValue);
		return new Promise<void>((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async delete(key: string) {
		const store = await this.#newTransaction('readwrite');
		const request = store.delete([key]);

		return new Promise<void>((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}
}

export class BrowserDatabase<TDefinition extends DatabaseDefinition<any>> {
	#indexDb: Promise<IDBDatabase>;
	#definition: TDefinition;

	constructor(options: BrowserDatabaseOptions<TDefinition>) {
		const { databaseName = 'browser-idb', definition, version } = options;

		const dbRequest = window.indexedDB.open(databaseName, version);

		this.#definition = Object.freeze(definition);
		this.#indexDb = new Promise<IDBDatabase>((resolve, reject) => {
			dbRequest.onsuccess = () => resolve(dbRequest.result);
			dbRequest.onerror = () => reject(dbRequest.error);
			dbRequest.onupgradeneeded = () => {
				for (const [storeName, schema] of Object.entries(definition)) {
					const keyPath = schema.keys.map((s) => String(s));

					keyPath.forEach((k) => {
						if (schema.schema[k] == null) {
							throw new TypeError(
								`Store schema '${storeName}' does not define a key '${k}' to be used as index`
							);
						}
					});

					const idb = dbRequest.result;

					idb.createObjectStore(storeName, {
						keyPath: keyPath
					});
				}
			};
		});
	}

	get store() {
		const indexDb = this.#indexDb;
		const definition = this.#definition;

		return new Proxy(
			{},
			{
				get(_, storeName) {
					if (typeof storeName !== 'string') {
						return undefined;
					}

					const schema = definition[storeName];
					return new DatabaseStore(indexDb, storeName, schema);
				}
			}
		) as DatabaseStoreCollection<TDefinition>;
	}

	unsafeGetIndexDatabase() {
		return this.#indexDb;
	}

	get definition() {
		return this.#definition;
	}
}
