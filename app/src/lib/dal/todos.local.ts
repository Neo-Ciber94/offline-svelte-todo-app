import { createIndexDb } from '$lib/client/idb-kv';
import { ApplicationError } from '$lib/common/error';
import type { Todo } from '$lib/data';
import {
	TodoRepositoryInterface,
	type CreateTodo,
	type GetAllTodos,
	type UpdateTodo
} from './todos.interface';
import type { NetworkTodosRepository } from './todos.network';
import type { UserRepositoryInterface } from './user';

const { get, set } = createIndexDb('todos-db');

const IS_LOCAL = Symbol('IS_LOCAL');

async function getTodos() {
	const todos = await get<Todo[]>('todos');
	return todos || [];
}

export class LocalTodosRepository extends TodoRepositoryInterface {
	constructor(
		private readonly network: NetworkTodosRepository,
		private readonly userRepository: UserRepositoryInterface
	) {
		super();
	}

	async invalidate() {
		try {
			const todos = await this.network.getAll();
			await set('todos', todos);
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
		const todos = await getTodos();

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
		const todo = await getTodos().then((todos) => todos.find((todo) => todo.id === todoId));
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

		const todos = await getTodos();
		todos.push(newTodo);
		await set('todos', todos);

		return Object.assign({}, newTodo);
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const user = await this.userRepository.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const userId = user.id;
		const todos = await getTodos();
		const todoToUpdate = todos.find((t) => t.id === input.id);

		if (!todoToUpdate || todoToUpdate.userId !== userId) {
			return null;
		}

		todoToUpdate.title = input.title == null ? todoToUpdate.title : input.title;
		todoToUpdate.description =
			input.description == null ? todoToUpdate.description : input.description;
		todoToUpdate.done = input.done == null ? todoToUpdate.done : input.done;

		return todoToUpdate;
	}

	async delete(todoId: string): Promise<Todo | null> {
		const user = await this.userRepository.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const userId = user.id;
		const todos = await getTodos();
		const todoIdx = todos.findIndex((t) => t.id === todoId);

		if (todoIdx === -1) {
			return null;
		}

		const todoToDelete = todos[todoIdx];

		if (todoToDelete.userId !== userId) {
			return null;
		}

		todos.splice(todoIdx, 1);
		await set('todos', todos);
		return todoToDelete;
	}
}
