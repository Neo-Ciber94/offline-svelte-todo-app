import { ApplicationError } from '$lib/common/error';
import type { CreateTodo, Todo, UpdateTodo } from '$lib/common/schema';
import { applyTodosQuery } from '$lib/common/todo.utils';
import { LogMethodCalls } from '$lib/decorators';
import { db } from './local-db';
import { networkService, type NetworkService } from './network-service';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { networkTodoService, type NetworkTodoService } from './todo-network.service';
import { userService, type UserServiceInterface } from './user.service';

@LogMethodCalls('LocalTodoService')
class LocalTodoService extends TodoServiceInterface {
	constructor(
		private readonly network: NetworkTodoService,
		private readonly networkService: NetworkService,
		private readonly userRepository: UserServiceInterface
	) {
		super();
	}

	async synchronize() {
		if (!this.networkService.isOnline()) {
			return;
		}

		try {
			// Get all the todos over the network
			const todos = await this.network.getAll();

			// Cleanup the local cache and set the new todos
			await db.stores.todos.deleteAll();
			await db.stores.todos.setAll(todos);
		} catch {
			// ignore
		}
	}

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		const user = await this.userRepository.getCurrentUser();

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
		const user = await this.userRepository.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		const userId = user.id;
		const newTodo: Todo = {
			userId,
			id: crypto.randomUUID(),
			title: input.title,
			description: input.description,
			done: false,
			createdAt: new Date()
		};

		// Add the new todo
		await db.stores.todos.set(newTodo);

		return Object.assign({}, newTodo);
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const user = await this.userRepository.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const userId = user.id;
		const todoToUpdate = await db.stores.todos.getByKey(input.id);

		if (!todoToUpdate || todoToUpdate.userId !== userId) {
			return null;
		}

		todoToUpdate.title = input.title == null ? todoToUpdate.title : input.title;
		todoToUpdate.description =
			input.description == null ? todoToUpdate.description : input.description;
		todoToUpdate.done = input.done == null ? todoToUpdate.done : input.done;

		await db.stores.todos.set(todoToUpdate);

		return todoToUpdate;
	}

	async delete(todoId: string): Promise<Todo | null> {
		const user = await this.userRepository.getCurrentUser();

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

export { LocalTodoService };

export const localTodoService = new LocalTodoService(
	networkTodoService,
	networkService,
	userService
);
