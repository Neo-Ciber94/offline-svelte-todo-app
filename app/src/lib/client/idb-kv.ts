export function createIndexDb(dbName = 'idb-kv', storeName = 'idb-store') {
	const db = new Promise<IDBDatabase>((resolve, reject) => {
		if (typeof window === 'undefined') {
			return;
		}

		const dbRequest = indexedDB.open(dbName);

		dbRequest.onupgradeneeded = () => dbRequest.result.createObjectStore(storeName);
		dbRequest.onsuccess = () => resolve(dbRequest.result);
		dbRequest.onerror = () => reject(dbRequest.error);
	});

	async function newTransaction(mode?: IDBTransactionMode, options?: IDBTransactionOptions) {
		const idb = await db;
		return idb.transaction(storeName, mode, options);
	}

	async function set(key: string, value: unknown) {
		const transaction = await newTransaction('readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.put(value, key);

		return new Promise<void>((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async function get<T = unknown>(key: string): Promise<T | undefined> {
		const transaction = await newTransaction('readonly');
		const store = transaction.objectStore(storeName);
		const request = store.get(key);

		return new Promise<T>((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async function del(key: string) {
		const transaction = await newTransaction('readwrite');
		const store = transaction.objectStore(storeName);
		const request = store.delete(key);

		return new Promise<void>((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	return { set, get, del };
}
