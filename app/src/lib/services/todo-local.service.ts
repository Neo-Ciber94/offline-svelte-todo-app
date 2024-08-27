import { getDb } from '$lib/client/db';
import { ApplicationError } from '$lib/common/error';
import {
	createTodoSchema,
	updateTodoSchema,
	type CreateTodo,
	type Todo,
	type UpdateTodo
} from '$lib/common/schema';
import { TodoRepository } from '$lib/data/todo.repository';
import { inject } from './di';
// import { db } from './local-db';
import { NetworkService } from './network-service';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { NetworkTodoService } from './todo-network.service';
import { UserService } from './user.service';

export class LocalTodoService extends TodoServiceInterface {
	private userService = inject(UserService);
	private networkService = inject(NetworkService);
	private networkTodoService = inject(NetworkTodoService);

	async #getRepo() {
		const db = await getDb();
		return new TodoRepository(db);
	}

	async synchronize() {
		if (!this.networkService.isOnline()) {
			return;
		}

		try {
			const user = await this.userService.getCurrentUser();

			if (!user) {
				return;
			}

			// Get all the todos over the network
			const todos = await this.networkTodoService.getAll();

			// Clean database
			// const db = await getDb();
			// await db.deleteDatabase();

			// // Insert new records
			// const repo = await this.#getRepo();
			// repo.insertMany(user.id, todos);

			// Cleanup the local cache and set the new todos
			// await db.stores.todos.deleteAll();
			// await db.stores.todos.setAll(todos);
		} catch {
			// ignore
		}
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			return [];
		}

		const repo = await this.#getRepo();
		return repo.getTodos(user.id, query);
	}

	async getById(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		const repo = await this.#getRepo();
		const result = await repo.getTodoById(user.id, todoId);
		return result;
	}

	async insert(input: CreateTodo): Promise<Todo> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		const result = createTodoSchema.parse(input);
		const repo = await this.#getRepo();
		return await repo.insert(user.id, result);
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const result = updateTodoSchema.parse(input);
		const repo = await this.#getRepo();
		return repo.update(user.id, result);
	}

	async delete(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const repo = await this.#getRepo();
		return repo.delete(user.id, todoId);
	}
}
