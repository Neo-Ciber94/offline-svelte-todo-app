import type { Result } from '$lib/common/types';
import { userSchema, type User } from '$lib/common/schema';
import { ApplicationError } from '$lib/common/error';
import { NetworkServiceInterface } from './network-service';
import * as devalue from 'devalue';
import { createKvStore } from '$lib/client/idb-kv';
import { inject } from './di';

const CURRENT_USER_KEY = 'current-user';
const { set, del, get } = createKvStore();

abstract class UserServiceInterface {
	abstract getCurrentUser(): Promise<User | null>;
	abstract register(username: string): Promise<Result<User, string>>;
	abstract logout(): Promise<void>;
}

export class UserService extends UserServiceInterface {
	private networkService = inject(NetworkServiceInterface);
	#user: User | null | undefined = undefined;

	async getCurrentUser(): Promise<User | null> {
		if (this.#user !== undefined) {
			return this.#user;
		}

		if (!this.networkService.isOnline()) {
			const raw = await get(CURRENT_USER_KEY);
			const result = userSchema.safeParse(raw);

			if (result.error) {
				await del(CURRENT_USER_KEY);
			}

			return result.success ? result.data : null;
		}

		const res = await fetch('/api/users/me');
		const contents = await res.text();

		if (!res.ok) {
			return null;
		}

		const result = userSchema.safeParse(devalue.parse(contents));

		if (result.success) {
			return result.data;
		}

		await del(CURRENT_USER_KEY);
		return null;
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

			const user = userSchema.parse(devalue.parse(contents));
			{
				this.#user = user;
				await set(CURRENT_USER_KEY, user);
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

			const user = userSchema.parse(devalue.parse(contents));
			{
				this.#user = user;
				await set(CURRENT_USER_KEY, user);
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

		await del(CURRENT_USER_KEY);
		this.#user = null;
		location.href = `${location.origin}/api/users/logout`;
	}
}
