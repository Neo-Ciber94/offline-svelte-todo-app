import type { Result } from '$lib/common';
import { ApplicationError } from '$lib/common/error';
import type { User } from '$lib/data';
import { db } from './local-db';
import { networkService, NetworkService } from './network-service';
import * as devalue from 'devalue';

const CURRENT_USER_KEY = 'current-user';

export abstract class UserRepositoryInterface {
	abstract getCurrentUser(): Promise<User | null>;
	abstract register(username: string): Promise<Result<User, string>>;
	abstract logout(): Promise<void>;
}

class UserRepository extends UserRepositoryInterface {
	#user: User | null | undefined = undefined;

	constructor(private readonly networkService: NetworkService) {
		super();
	}

	async getCurrentUser(): Promise<User | null> {
		if (this.#user !== undefined) {
			return this.#user;
		}

		if (!this.networkService.isOnline()) {
			const user = await db.stores.users.getByKey(CURRENT_USER_KEY);
			return user ?? null;
		}

		const res = await fetch('/api/users/me');
		const contents = await res.text();

		if (!res.ok) {
			return null;
		}

		const json = devalue.parse(contents) as User;
		if (json == null) {
			await db.stores.users.delete(CURRENT_USER_KEY);
		} else {
			await db.stores.users.setWithKey(CURRENT_USER_KEY, json);
		}

		return json;
	}

	async register(username: string): Promise<Result<User, string>> {
		if (!this.networkService.isOnline()) {
			throw new ApplicationError(400, 'Unable to register while offline');
		}

		try {
			const res = await fetch('/api/users/register', {
				method: 'POST',
				body: devalue.stringify({ username })
			});

			const contents = await res.text();

			if (!res.ok) {
				const json = JSON.parse(contents);
				const error =
					typeof json?.message === 'string' ? json.message : 'Failed to register account';

				return { success: false, error };
			}

			const user = devalue.parse(contents) as User;

			{
				this.#user = user;
				await db.stores.users.setWithKey(CURRENT_USER_KEY, user);
			}

			return { success: true, data: user };
		} catch (err) {
			console.error(err);
			return { success: false, error: 'Failed to register account' };
		}
	}

	async login(username: string): Promise<Result<User, string>> {
		if (!this.networkService.isOnline()) {
			throw new ApplicationError(400, 'Unable to login while offline');
		}

		try {
			const res = await fetch('/api/users/login', {
				method: 'POST',
				body: devalue.stringify({ username })
			});

			const contents = await res.text();

			if (!res.ok) {
				const json = JSON.parse(contents);
				const error = typeof json?.message === 'string' ? json.message : 'Failed to login';

				return { success: false, error };
			}

			const user = devalue.parse(contents) as User;

			{
				this.#user = user;
				await db.stores.users.setWithKey(CURRENT_USER_KEY, user);
			}

			return { success: true, data: user };
		} catch (err) {
			console.error(err);
			return { success: false, error: 'Failed to login' };
		}
	}

	async logout(): Promise<void> {
		if (!this.networkService.isOnline()) {
			throw new ApplicationError(400, 'Unable to logout while offline');
		}

		await db.stores.users.delete(CURRENT_USER_KEY);
		this.#user = null;
		location.href = `${location.origin}/api/users/logout`;
	}
}

export const userRepository = new UserRepository(networkService);
