import { ApplicationError } from '$lib/common/error';
import type { CreateTodo, Todo, UpdateTodo } from '$lib/data';
import { db } from './local-db';
import { TodoRepositoryInterface, type GetAllTodos } from './todos.interface';
import { networkTodoRepository, type NetworkTodosRepository } from './todos.network';
import { userRepository, type UserRepositoryInterface } from './user';

const IS_LOCAL = Symbol('IS_LOCAL');

export class LocalTodosRepository extends TodoRepositoryInterface {
	constructor(
		private readonly network: NetworkTodosRepository,
		private readonly userRepository: UserRepositoryInterface
	) {
		super();
	}

	async synchronize() {
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
		const { filter, sort } = query || {};
		const search = filter?.search?.toLowerCase();
		const orderBy = sort?.by || 'createdAt';
		const orderDir = sort?.dir || 'desc';

		const user = await this.userRepository.getCurrentUser();

		if (!user) {
			return [];
		}

		const userId = user.id;
		const todos = await db.stores.todos.getAll();

		return todos
			.map((todo) => ({ ...todo }))
			.filter((todo) => todo.userId === userId)
			.filter((todo) => {
				return typeof filter?.done === 'boolean' ? todo.done === filter.done : true;
			})
			.filter((todo) => {
				if (search == null) {
					return true;
				}

				return (
					todo.title.toLowerCase().includes(search) ||
					todo.description?.toLowerCase().includes(search)
				);
			})
			.sort((a, b) => {
				switch (true) {
					case orderBy === 'title' && orderDir === 'desc': {
						return a.title.localeCompare(b.title);
					}
					case orderBy === 'title' && orderDir === 'asc': {
						return b.title.localeCompare(b.title);
					}
					case orderBy === 'createdAt' && orderDir === 'desc': {
						return a.createdAt.getTime() - b.createdAt.getTime();
					}
					case orderBy === 'createdAt' && orderDir === 'asc': {
						return b.createdAt.getTime() - a.createdAt.getTime();
					}
					default: {
						return 0;
					}
				}
			});
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

		Object.assign(newTodo, { [IS_LOCAL]: IS_LOCAL });

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

export const localTodoRepository = new LocalTodosRepository(networkTodoRepository, userRepository);
