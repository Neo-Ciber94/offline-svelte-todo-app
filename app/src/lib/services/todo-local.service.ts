import { ApplicationError } from '$lib/common/error';
import {
	createTodoSchema,
	updateTodoSchema,
	type CreateTodo,
	type Todo,
	type UpdateTodo
} from '$lib/common/schema';
import { applyTodosQuery } from '$lib/common/todo.utils';
import { inject } from './di';
import { db } from './local-db';
import { NetworkService } from './network-service';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { NetworkTodoService } from './todo-network.service';
import { UserService } from './user.service';

export class LocalTodoService extends TodoServiceInterface {
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

		const userId = user.id;
		const todos = await db.stores.todos.getAll();

		return applyTodosQuery(todos, userId, query);
	}

	async getById(todoId: string): Promise<Todo | null> {
		const todo = await db.stores.todos.getByKey(todoId);
		return todo ?? null;
	}

	async insert(input: CreateTodo): Promise<Todo> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		const result = createTodoSchema.parse(input);

		const newTodo: Todo = {
			userId: user.id,
			id: input.id ?? crypto.randomUUID(),
			title: result.title,
			description: result.description,
			emoji: result.emoji,
			done: false,
			createdAt: new Date()
		};

		// Add the new todo
		await db.stores.todos.set(newTodo);

		return Object.assign({}, newTodo);
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const userId = user.id;
		const todoToUpdate = await db.stores.todos.getByKey(input.id);

		if (!todoToUpdate || todoToUpdate.userId !== userId) {
			return null;
		}

		const result = updateTodoSchema.parse(input);

		todoToUpdate.title = result.title == null ? todoToUpdate.title : result.title;
		todoToUpdate.description =
			result.description == null ? todoToUpdate.description : result.description;
		todoToUpdate.done = result.done == null ? todoToUpdate.done : result.done;
		todoToUpdate.emoji = result.emoji == null ? todoToUpdate.emoji : result.emoji;

		await db.stores.todos.set(todoToUpdate);

		return todoToUpdate;
	}

	async delete(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const userId = user.id;
		const todoToDelete = await db.stores.todos.getByKey(todoId);

		if (todoToDelete == null || todoToDelete.userId !== userId) {
			return null;
		}

		await db.stores.todos.delete(todoId);
		return todoToDelete;
	}
}
