import type { CreateTodo, Todo, UpdateTodo } from '$lib/data';
import { networkService, NetworkService } from './network-service';
import {
	TodoServiceInterface as TodoServiceInterface,
	type GetAllTodos
} from './todo-interface.service';
import { localTodoService, LocalTodoService } from './todo-local.service';
import { networkTodoService, NetworkTodoService } from './todo-network.service';
import { todoQueueService, type TodoQueueService } from './todo-queue.service';

class TodoRepository extends TodoServiceInterface {
	constructor(
		private readonly networkService: NetworkService,
		private readonly local: LocalTodoService,
		private readonly network: NetworkTodoService,
		private readonly pendingQueue: TodoQueueService
	) {
		super();
	}

	async synchronize() {
		await this.local.synchronize();

		const resolvedCount = await this.pendingQueue.runPending();

		if (resolvedCount) {
			console.log(`✅ pending todos where resolved`);
		}
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		if (!this.networkService.isOnline()) {
			console.log('get cache');
			const result = await this.local.getAll(query);
			console.log(result);
			return result;
		}

		return this.network.getAll(query);
	}

	async getById(todoId: string): Promise<Todo | null> {
		if (!this.networkService.isOnline()) {
			return this.local.getById(todoId);
		}

		return this.network.getById(todoId);
	}

	async insert(input: CreateTodo): Promise<Todo> {
		if (!this.networkService.isOnline()) {
			const newTodo = await this.local.insert(input);
			this.pendingQueue
				.enqueue({ id: newTodo.id, action: { type: 'create', input: input } })
				.catch(console.error);

			return newTodo;
		}

		// Update local first
		await this.local.insert(input);

		const result = await this.network.insert(input);
		return result;
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		if (!this.networkService.isOnline()) {
			this.pendingQueue
				.enqueue({ id: input.id, action: { type: 'update', input: input } })
				.catch(console.error);

			return this.local.update(input);
		}

		// Update local first
		await this.local.update(input);

		const result = await this.network.update(input);
		return result;
	}

	async delete(todoId: string): Promise<Todo | null> {
		if (!this.networkService.isOnline()) {
			this.pendingQueue
				.enqueue({ id: todoId, action: { type: 'delete', input: { id: todoId } } })
				.catch(console.error);

			return this.local.delete(todoId);
		}

		// Update local first
		await this.local.delete(todoId);

		const result = await this.network.delete(todoId);
		return result;
	}
}

export const todoService = new TodoRepository(
	networkService,
	localTodoService,
	networkTodoService,
	todoQueueService
);
