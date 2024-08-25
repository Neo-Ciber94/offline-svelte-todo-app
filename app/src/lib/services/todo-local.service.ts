import { ApplicationError } from '$lib/common/error';
import {
	createTodoSchema,
	updateTodoSchema,
	type CreateTodo,
	type Todo,
	type UpdateTodo
} from '$lib/common/schema';
import { applyTodosQuery } from '$lib/common/todo.utils';
import { ClientTodoRepository } from '$lib/dal/todo.client';
import { inject } from './di';
import { db } from './local-db';
import { NetworkService } from './network-service';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { NetworkTodoService } from './todo-network.service';
import { UserService } from './user.service';

export class LocalTodoService extends TodoServiceInterface {
	private todoRepository = new ClientTodoRepository();
	private userService = inject(UserService);
	private networkService = inject(NetworkService);
	private networkTodoService = inject(NetworkTodoService);

	async synchronize() {
		if (!this.networkService.isOnline()) {
			return;
		}

		try {
			// Get all the todos over the network
			const todos = await this.networkTodoService.getAll();

			// Cleanup the local cache and set the new todos
			await db.stores.todos.deleteAll();
			await db.stores.todos.setAll(todos);
		} catch {
			// ignore
		}
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			return [];
		}

		return this.todoRepository.getTodos(user.id, query);
	}

	async getById(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		return this.todoRepository.getTodoById(user.id, todoId);
	}

	async insert(input: CreateTodo): Promise<Todo> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		return this.todoRepository.createTodo(user.id, input);
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		return this.todoRepository.updateTodo(user.id, input);
	}

	async delete(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		return this.todoRepository.deleteTodo(user.id, todoId);
	}
}
