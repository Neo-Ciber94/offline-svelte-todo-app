import type { CreateTodo, Todo, UpdateTodo } from '$lib/common/schema';
import { inject } from '$lib/client/di';
import { ConnectivityService } from './network-service';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { LocalTodoService } from './todo-local.service';
import { NetworkTodoService } from './todo-network.service';
import { TodoSyncService } from './todo-sync.service';

export class TodoService extends TodoServiceInterface {
	private readonly connectivity = inject(ConnectivityService);
	private readonly localTodos = inject(LocalTodoService);
	private readonly networkTodos = inject(NetworkTodoService);
	private readonly todoSync = inject(TodoSyncService);

	async synchronize() {
		// Push any pending todos to the server
		const resolvedCount = await this.todoSync.push();

		if (resolvedCount) {
			console.log(`✅ pending todos where resolved`);
		}

		// Pull all the todos from the server and merge with the current
		await this.todoSync.pull();
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		if (!this.connectivity.isOnline()) {
			const result = await this.localTodos.getAll(query);
			return result;
		}

		return this.networkTodos.getAll(query);
	}

	async getById(todoId: string): Promise<Todo | null> {
		if (!this.connectivity.isOnline()) {
			return this.localTodos.getById(todoId);
		}

		return this.networkTodos.getById(todoId);
	}

	async insert(input: CreateTodo): Promise<Todo> {
		// We generate the id client-side to ensure is sync with the backend when offline
		input.id ??= crypto.randomUUID();

		if (!this.connectivity.isOnline()) {
			const newTodo = await this.localTodos.insert(input);
			this.todoSync
				.enqueue({ id: newTodo.id, action: { type: 'create', input } })
				.catch(console.error);

			return newTodo;
		}

		// Update local first
		await this.localTodos.insert(input);

		const result = await this.networkTodos.insert(input);
		return result;
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		if (!this.connectivity.isOnline()) {
			this.todoSync
				.enqueue({ id: input.id, action: { type: 'update', input: input } })
				.catch(console.error);

			return this.localTodos.update(input);
		}

		// Update local first
		await this.localTodos.update(input);

		const result = await this.networkTodos.update(input);
		return result;
	}

	async delete(todoId: string): Promise<Todo | null> {
		if (!this.connectivity.isOnline()) {
			this.todoSync
				.enqueue({ id: todoId, action: { type: 'delete', input: { id: todoId } } })
				.catch(console.error);

			return this.localTodos.delete(todoId);
		}

		// Update local first
		await this.localTodos.delete(todoId);

		const result = await this.networkTodos.delete(todoId);
		return result;
	}
}
