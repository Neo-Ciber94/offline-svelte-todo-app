import { ApplicationError } from '$lib/common/error';
import type { PendingTodo } from '$lib/common/schema';
import type { PendingTodosOutput } from '../../routes/api/todos/sync/+server';
import { inject } from './di';
import { db } from './local-db';
import { NetworkService } from './network-service';
import * as devalue from 'devalue';

export class TodoQueueService {
	private networkService = inject(NetworkService);

	async enqueue(pending: PendingTodo): Promise<void> {}

	async push(): Promise<number> {
		
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
