import type { CreateTodo, Todo, UpdateTodo } from '$lib/common/schema';
import { inject } from './di';
import { NetworkServiceInterface } from './network-service';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { LocalTodoService } from './todo-local.service';
import { NetworkTodoService } from './todo-network.service';
import { TodoQueueService } from './todo-queue.service';

export class TodoService extends TodoServiceInterface {
	private readonly networkService = inject(NetworkServiceInterface);
	private readonly local = inject(LocalTodoService);
	private readonly network = inject(NetworkTodoService);
	private readonly pendingQueue = inject(TodoQueueService);

	async synchronize() {
		await this.local.synchronize();

		const resolvedCount = await this.pendingQueue.runPending();

		if (resolvedCount) {
			console.log(`✅ pending todos where resolved`);
		}
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		if (!this.networkService.isOnline()) {
			const result = await this.local.getAll(query);
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