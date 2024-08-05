import type { Todo } from '$lib/data';
import { checkNetwork, NetworkService } from './network-service';
import {
	TodoRepositoryInterface,
	type CreateTodo,
	type GetAllTodos,
	type UpdateTodo
} from './todos.interface';
import { LocalTodosRepository } from './todos.local';
import { NetworkTodosRepository } from './todos.network';
import { userRepository } from './user';

class TodoRepository extends TodoRepositoryInterface {
	constructor(
		private readonly networkService: NetworkService,
		private readonly local: LocalTodosRepository,
		private readonly network: NetworkTodosRepository
	) {
		super();
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		if (!this.networkService.isOnline()) {
			return this.local.getAll(query);
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
			return this.local.insert(input);
		}

		// Update local first
		await this.local.insert(input);

		const result = await this.network.insert(input);
		this.local.invalidate().catch(console.error);
		return result;
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		if (!this.networkService.isOnline()) {
			return this.local.update(input);
		}

		// Update local first
		await this.local.update(input);

		const result = await this.network.update(input);
		this.local.invalidate().catch(console.error);
		return result;
	}

	async delete(todoId: string): Promise<Todo | null> {
		if (!this.networkService.isOnline()) {
			return this.local.delete(todoId);
		}

		// Update local first
		await this.local.delete(todoId);

		const result = await this.network.delete(todoId);
		this.local.invalidate().catch(console.error);
		return result;
	}
}

const networkTodoRepository = new NetworkTodosRepository();
const localTodoRepository = new LocalTodosRepository(networkTodoRepository, userRepository);

export const todosRepository = new TodoRepository(
	checkNetwork,
	localTodoRepository,
	networkTodoRepository
);
