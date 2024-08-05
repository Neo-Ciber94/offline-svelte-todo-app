import { createIndexDb } from '$lib/client/idb-kv';
import type { User } from '$lib/data';
import { networkProvider } from './network-provider';
import { NetworkProvider, UserRepositoryInterface } from './todos.interface';
import * as devalue from 'devalue';

const { get, set, del } = createIndexDb('todos-db');

class UserRepository extends UserRepositoryInterface {
	#user: User | null | undefined = undefined;

	constructor(private readonly networkProvider: NetworkProvider) {
		super();
	}

	async getCurrentUser(): Promise<User | null> {
		if (this.#user !== undefined) {
			return this.#user;
		}

		if (!this.networkProvider.isOnline()) {
			const user = await get<User>('user');
			return user ?? null;
		}

		const res = await fetch('/api/users/me');
		const contents = await res.text();

		if (!res.ok) {
			return null;
		}

		const json = devalue.parse(contents) as User;
		await set('user', json);
		return json;
	}

	async logout(): Promise<void> {
		if (!this.networkProvider.isOnline()) {
			throw new Error('Cannot logout while offline');
		}

		await del('user');
		this.#user = null;
		location.href = `${location.origin}/api/users/logout`;
	}
}

export const userRepository = new UserRepository(networkProvider);
