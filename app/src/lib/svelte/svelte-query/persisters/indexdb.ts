import { createKvStore } from '$lib/client/idb-kv';
import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core';

const { get, set, del } = createKvStore();

export function createIndexDbPersister(name: string = 'persistent-query-client'): Persister {
	return {
		async persistClient(persistClient) {
			await set(name, persistClient);
		},
		async restoreClient() {
			const client = await get(name);
			return client as PersistedClient;
		},
		async removeClient() {
			await del(name);
		}
	};
}
