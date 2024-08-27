import { ApplicationError } from '$lib/common/error';
import { pendingTodoSchema, type PendingTodo } from '$lib/common/schema';
import { z } from 'zod';
import type { SyncPushTodosOutput, SyncPushTodosInput } from '../../routes/api/todos/sync/push/+server';
import { inject } from './di';
import { NetworkService } from './network-service';
import * as devalue from 'devalue';
import { createTypedStorage } from '$lib/client/createTypedStorage';

const syncTodosSchema = z.record(z.string(), pendingTodoSchema);

export class TodoQueueService {
	private networkService = inject(NetworkService);
	private pendingTodosStorage = createTypedStorage('pending-todos', { schema: syncTodosSchema });

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

	async push(): Promise<number> {
		const data = this.pendingTodosStorage.getItem() || {};
		const pendingTodos = Object.values(data);

		if (!this.networkService.isOnline()) {
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
