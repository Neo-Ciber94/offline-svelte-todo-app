import type { PendingTodo } from '$lib/common/schema';
import { inject } from './di';
import { db } from './local-db';
import { NetworkServiceInterface } from './network-service';
import { NetworkTodoService } from './todo-network.service';

export abstract class TodoQueueServiceInterface {
	abstract enqueue(pending: PendingTodo): Promise<void>;
	abstract runPending(): Promise<number>;
}

export class TodoQueueService extends TodoQueueServiceInterface {
	private networkService = inject(NetworkServiceInterface);
	private networkTodos = inject(NetworkTodoService);

	async enqueue(pending: PendingTodo): Promise<void> {
		console.log('🕒 Pending todo: ', pending);

		// If is trying to update a pending 'add', we update the add instead
		if (pending.action.type === 'update') {
			const existingAdd = await db.stores.pendingTodos.getByKey(pending.id);

			if (existingAdd && existingAdd.action.type === 'create') {
				// Update the add input
				const addInput = existingAdd.action.input;
				const updateInput = pending.action.input;
				addInput.title = updateInput.title == null ? addInput.title : updateInput.title;
				addInput.description =
					updateInput.description == null ? addInput.description : updateInput.description;
				addInput.emoji = updateInput.emoji == null ? addInput.emoji : updateInput.emoji;

				await db.stores.pendingTodos.set(existingAdd);
				return;
			}
		}

		// If is trying to delete a pending 'add' or update we delete both
		if (pending.action.type === 'delete' || pending.action.type === 'update') {
			const existingAdd = await db.stores.pendingTodos.getByKey(pending.id);
			if (existingAdd && existingAdd.action.type === 'create') {
				await db.stores.pendingTodos.delete(pending.id);
				return;
			}
		}

		// otherwise just queue the action
		await db.stores.pendingTodos.set(pending);
	}

	async runPending(): Promise<number> {
		const pendingTodos = await db.stores.pendingTodos.getAll();

		if (!this.networkService.isOnline()) {
			return pendingTodos.length;
		}

		if (pendingTodos.length === 0) {
			return 0;
		}

		let pendingCount = pendingTodos.length;

		async function deletePending(id: string) {
			await db.stores.pendingTodos.delete(id);
			pendingCount -= 1;
		}

		for (const pendingTodo of pendingTodos) {
			switch (pendingTodo.action.type) {
				case 'create': {
					try {
						await this.networkTodos.insert(pendingTodo.action.input);
						await deletePending(pendingTodo.id);
					} catch {
						// ignore
					}

					break;
				}
				case 'update': {
					try {
						await this.networkTodos.update(pendingTodo.action.input);
						await deletePending(pendingTodo.id);
					} catch {
						// ignore
					}

					break;
				}
				case 'delete': {
					try {
						await this.networkTodos.delete(pendingTodo.action.input.id);
						await deletePending(pendingTodo.id);
					} catch {
						// ignore
					}

					break;
				}
			}
		}

		return pendingCount;
	}
}
