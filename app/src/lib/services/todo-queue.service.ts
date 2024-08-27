import { ApplicationError } from '$lib/common/error';
import { pendingTodoSchema, type PendingTodo } from '$lib/common/schema';
import { z } from 'zod';
import type { SyncTodosOutput, SyncTodosInput } from '../../routes/api/todos/sync/+server';
import { inject } from './di';
import { db } from './local-db';
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

		const res = await fetch('/api/todos/sync', {
			method: 'POST',
			body: devalue.stringify(pendingTodos as SyncTodosInput)
		});

		const contents = await res.text();

		if (!res.ok) {
			console.error(contents);
			throw new ApplicationError(400, 'Failed to process pending todos');
		} else {
			this.pendingTodosStorage.removeItem();
		}

		const result = devalue.parse(contents) as SyncTodosOutput;
		return result.processed;
	}

	// async enqueue(pending: PendingTodo): Promise<void> {
	// 	console.log('🕒 Pending todo: ', pending);

	// 	// If trying to update an already added, we merge the add and update
	// 	if (pending.action.type === 'update') {
	// 		const existing = await db.stores.pendingTodos.getByKey(pending.action.input.id);

	// 		if (existing && ['create', 'update'].includes(existing.action.type)) {
	// 			pending.action.input = {
	// 				...existing.action.input,
	// 				...pending.action.input
	// 			};
	// 		}
	// 	}

	// 	// If we try to delete an existing we just delete the local
	// 	if (pending.action.type === 'delete') {
	// 		const existing = await db.stores.pendingTodos.getByKey(pending.action.input.id);

	// 		if (existing && ['create', 'update'].includes(existing.action.type)) {
	// 			await db.stores.pendingTodos.delete(existing.id);
	// 			return;
	// 		}
	// 	}

	// 	// otherwise just queue the action
	// 	await db.stores.pendingTodos.set(pending);
	// }

	// async push(): Promise<number> {
	// 	const pendingTodos = await db.stores.pendingTodos.getAll();

	// 	if (!this.networkService.isOnline()) {
	// 		return pendingTodos.length;
	// 	}

	// 	if (pendingTodos.length === 0) {
	// 		return 0;
	// 	}

	// 	const res = await fetch('/api/todos/sync', {
	// 		method: 'POST',
	// 		body: devalue.stringify(pendingTodos)
	// 	});

	// 	const contents = await res.text();

	// 	if (!res.ok) {
	// 		console.error(contents);
	// 		throw new ApplicationError(400, 'Failed to process pending todos');
	// 	} else {
	// 		await db.stores.pendingTodos.deleteAll();
	// 	}

	// 	const result = devalue.parse(contents) as PendingTodosOutput;

	// 	return result.processed;
	// 	// let pendingCount = pendingTodos.length;

	// 	// async function deletePending(id: string) {
	// 	// 	await db.stores.pendingTodos.delete(id);
	// 	// 	pendingCount -= 1;
	// 	// }

	// 	// for (const pendingTodo of pendingTodos) {
	// 	// 	switch (pendingTodo.action.type) {
	// 	// 		case 'create': {
	// 	// 			try {
	// 	// 				await this.networkTodos.insert(pendingTodo.action.input);
	// 	// 				await deletePending(pendingTodo.id);
	// 	// 			} catch {
	// 	// 				// ignore
	// 	// 			}

	// 	// 			break;
	// 	// 		}
	// 	// 		case 'update': {
	// 	// 			try {
	// 	// 				await this.networkTodos.update(pendingTodo.action.input);
	// 	// 				await deletePending(pendingTodo.id);
	// 	// 			} catch {
	// 	// 				// ignore
	// 	// 			}

	// 	// 			break;
	// 	// 		}
	// 	// 		case 'delete': {
	// 	// 			try {
	// 	// 				await this.networkTodos.delete(pendingTodo.action.input.id);
	// 	// 				await deletePending(pendingTodo.id);
	// 	// 			} catch {
	// 	// 				// ignore
	// 	// 			}

	// 	// 			break;
	// 	// 		}
	// 	// 	}
	// 	// }

	// 	// return pendingCount;
	// }
}
