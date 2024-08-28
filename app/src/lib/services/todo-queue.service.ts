import { ApplicationError } from '$lib/common/error';
import { pendingTodoSchema, type PendingTodo, type Todo } from '$lib/common/schema';
import { z } from 'zod';
import type {
	SyncPushTodosOutput,
	SyncPushTodosInput
} from '../../routes/api/todos/sync/push/+server';
import { inject } from './di';
import { ConnectivityService } from './network-service';
import * as devalue from 'devalue';
import { createStorage } from '$lib/client/createStorage';
import { getDb, recreateDatabase } from '$lib/client/db';
import { TodoRepository } from '$lib/data/todo.repository';
import { UserService } from './user.service';

const syncTodosSchema = z.record(z.string(), pendingTodoSchema).catch(() => ({}));

export class TodoQueueService {
	private pendingTodosStorage = createStorage('pending-todos', { schema: syncTodosSchema });
	private connectivity = inject(ConnectivityService);
	private userService = inject(UserService);
	private todoRepository = getDb().then((db) => new TodoRepository(db));

	async enqueue(pending: PendingTodo): Promise<void> {
		const pendingTodos = this.pendingTodosStorage.getItem() || {};
		const existing = pendingTodos[pending.id];

		if (existing) {
			switch (true) {
				// If try to update an already created, update the values of the created
				case existing.action.type === 'create' && pending.action.type === 'update': {
					existing.action.input = {
						...existing.action.input,
						...pending.action.input
					};

					pendingTodos[pending.id] = existing;
					break;
				}

				// If trying to delete, remove it from the list
				case pending.action.type === 'delete': {
					delete pendingTodos[pending.id];
					break;
				}

				// We ignore any other
				default: {
					break;
				}
			}
		} else {
			pendingTodos[pending.id] = pending;
		}

		this.pendingTodosStorage.setItem(pendingTodos);
	}

	async pull() {
		if (!this.connectivity.isOnline()) {
			return;
		}

		const user = await this.userService.getCurrentUser();

		if (!user) {
			return;
		}

		try {
			// Drop all and run migrations again
			await recreateDatabase();

			// Insert all the user todos
			const res = await fetch('/api/todos/sync/pull');
			const contents = await res.text();

			if (!res.ok) {
				const json = JSON.parse(contents);
				const error = typeof json?.message === 'string' ? json.message : 'Something went wrong';
				throw new Error(error);
			}

			const todos = devalue.parse(contents) as Todo[];
			const repo = await this.todoRepository;
			await repo.insertMany(todos);
		} catch (err) {
			// ignore
		}
	}

	async push(): Promise<number> {
		const data = this.pendingTodosStorage.getItem() || {};
		const pendingTodos = Object.values(data);

		if (!this.connectivity.isOnline()) {
			return pendingTodos.length;
		}

		const res = await fetch('/api/todos/sync/push', {
			method: 'POST',
			body: devalue.stringify(pendingTodos as SyncPushTodosInput)
		});

		const contents = await res.text();

		if (!res.ok) {
			console.error(contents);
			throw new ApplicationError(400, 'Failed to process pending todos');
		} else {
			this.pendingTodosStorage.removeItem();
		}

		const result = devalue.parse(contents) as SyncPushTodosOutput;
		return result.processed;
	}
}
