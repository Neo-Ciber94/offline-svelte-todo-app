import type { PendingTodo } from '$lib/data';
import { db } from './local-db';
import { networkService, type NetworkService } from './network-service';
import { networkTodoService, type NetworkTodoService } from './todo-network.service';

export abstract class TodoQueueService {
	abstract enqueue(pending: PendingTodo): Promise<void>;
	abstract runPending(): Promise<number>;
}

class LocalTodoQueueService extends TodoQueueService {
	constructor(
		private readonly networkService: NetworkService,
		private readonly networkTodos: NetworkTodoService
	) {
		super();
	}

	async enqueue(pending: PendingTodo): Promise<void> {
		console.log('🕒 Pending todo: ', pending);
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

export const todoQueueService: TodoQueueService = new LocalTodoQueueService(
	networkService,
	networkTodoService
);
